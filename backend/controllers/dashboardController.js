const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Supplier = require('../models/Supplier');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalSuppliers = await Supplier.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    })
    .populate('supplier', 'name')
    .sort({ quantity: 1 })
    .limit(10);
    
    const lowStockCount = lowStockProducts.length;
    
    // Calculate total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);
    
    const totalInventoryValue = inventoryValue[0]?.totalValue || 0;
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Monthly sales/purchase trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type'
          },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Top selling products (by quantity sold)
    const topSellingProducts = await Transaction.aggregate([
      {
        $match: { type: 'sale' }
      },
      {
        $group: {
          _id: '$product',
          totalSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: '$productInfo'
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: '$productInfo.name',
          sku: '$productInfo.sku',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);
    
    res.json({
      stats: {
        totalProducts,
        totalSuppliers,
        totalTransactions,
        lowStockCount,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100
      },
      lowStockProducts,
      recentTransactions,
      monthlyTrends,
      topSellingProducts
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Get AI-powered reorder suggestions
exports.getReorderSuggestions = async (req, res) => {
  try {
    if (!genAI) {
      // Return mock suggestions if Gemini API is not configured
      return res.json([
        {
          productName: 'Sample Product 1',
          currentStock: 5,
          suggestedQuantity: 50,
          reason: 'Stock running low and showing consistent sales pattern'
        },
        {
          productName: 'Sample Product 2',
          currentStock: 2,
          suggestedQuantity: 30,
          reason: 'Critical stock level reached'
        }
      ]);
    }
    
    // Get low stock products and their transaction history
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', { $multiply: ['$minStockLevel', 2] }] }
    }).populate('supplier', 'name');
    
    if (lowStockProducts.length === 0) {
      return res.json([]);
    }
    
    // Get transaction history for these products (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const transactionHistory = await Transaction.find({
      product: { $in: lowStockProducts.map(p => p._id) },
      createdAt: { $gte: threeMonthsAgo }
    }).populate('product', 'name sku');
    
    // Prepare data for AI analysis
    const productData = lowStockProducts.map(product => {
      const transactions = transactionHistory.filter(t => 
        t.product._id.toString() === product._id.toString()
      );
      
      const salesTransactions = transactions.filter(t => t.type === 'sale');
      const totalSold = salesTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const avgMonthlySales = totalSold / 3; // Over 3 months
      
      return {
        name: product.name,
        sku: product.sku,
        currentStock: product.quantity,
        minStockLevel: product.minStockLevel,
        avgMonthlySales,
        totalSold,
        supplier: product.supplier?.name || 'Unknown',
        price: product.price
      };
    });
    
    // Create prompt for Gemini
    const prompt = `
    As an inventory management AI, analyze the following product data and provide reorder suggestions. 
    Consider current stock levels, minimum stock requirements, average monthly sales, and seasonal patterns.
    
    Product Data:
    ${JSON.stringify(productData, null, 2)}
    
    For each product that needs reordering, provide:
    1. Product name
    2. Current stock level
    3. Suggested reorder quantity
    4. Brief reason for the suggestion (max 50 words)
    
    Focus on products with stock levels approaching or below minimum thresholds, and consider sales velocity.
    Provide response in JSON format as an array of objects with properties: productName, currentStock, suggestedQuantity, reason.
    `;
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      const cleanedText = text.replace(/```json|```/g, '').trim();
      let suggestions;
      
      try {
        suggestions = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to rule-based suggestions
        suggestions = generateRuleBasedSuggestions(productData);
      }
      
      res.json(suggestions);
    } catch (aiError) {
      console.error('Error calling Gemini API:', aiError);
      // Fallback to rule-based suggestions
      const suggestions = generateRuleBasedSuggestions(productData);
      res.json(suggestions);
    }
  } catch (error) {
    console.error('Error generating reorder suggestions:', error);
    res.status(500).json({ message: 'Error generating reorder suggestions', error: error.message });
  }
};

// Fallback rule-based suggestions
function generateRuleBasedSuggestions(productData) {
  return productData
    .filter(product => product.currentStock <= product.minStockLevel * 1.5)
    .map(product => {
      let suggestedQuantity = Math.max(
        product.minStockLevel * 2, // At least double the minimum
        Math.ceil(product.avgMonthlySales * 2) // Or 2 months of average sales
      );
      
      let reason = '';
      if (product.currentStock <= product.minStockLevel) {
        reason = 'Stock below minimum level - urgent reorder needed';
      } else if (product.avgMonthlySales > 0) {
        reason = `Based on ${product.avgMonthlySales.toFixed(1)} avg monthly sales`;
      } else {
        reason = 'Low stock level detected';
      }
      
      return {
        productName: product.name,
        currentStock: product.currentStock,
        suggestedQuantity,
        reason
      };
    });
}

// Get inventory reports
exports.getInventoryReports = async (req, res) => {
  try {
    const { reportType } = req.query;
    
    let report = {};
    
    switch (reportType) {
      case 'stock_levels':
        report = await Product.aggregate([
          { $match: { isActive: true } },
          {
            $project: {
              name: 1,
              sku: 1,
              quantity: 1,
              minStockLevel: 1,
              price: 1,
              value: { $multiply: ['$quantity', '$price'] },
              status: {
                $cond: {
                  if: { $lte: ['$quantity', '$minStockLevel'] },
                  then: 'Low Stock',
                  else: {
                    $cond: {
                      if: { $lte: ['$quantity', { $multiply: ['$minStockLevel', 2] }] },
                      then: 'Medium Stock',
                      else: 'Well Stocked'
                    }
                  }
                }
              }
            }
          },
          { $sort: { quantity: 1 } }
        ]);
        break;
        
      case 'value_analysis':
        report = await Product.aggregate([
          { $match: { isActive: true } },
          {
            $project: {
              name: 1,
              sku: 1,
              quantity: 1,
              price: 1,
              value: { $multiply: ['$quantity', '$price'] }
            }
          },
          { $sort: { value: -1 } }
        ]);
        break;
        
      case 'supplier_performance':
        report = await Product.aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: 'suppliers',
              localField: 'supplier',
              foreignField: '_id',
              as: 'supplierInfo'
            }
          },
          {
            $unwind: {
              path: '$supplierInfo',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $group: {
              _id: '$supplier',
              supplierName: { $first: '$supplierInfo.name' },
              productCount: { $sum: 1 },
              totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
              avgPrice: { $avg: '$price' }
            }
          },
          { $sort: { totalValue: -1 } }
        ]);
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ message: 'Error generating inventory report', error: error.message });
  }
};