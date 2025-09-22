# ERP Lite

A modern, lightweight Enterprise Resource Planning (ERP) system built with React.js and Node.js. ERP Lite provides comprehensive inventory management, supplier tracking, transaction monitoring, and business analytics through an intuitive web interface.

## Features

### Core Functionality
- **Product Management**: Complete CRUD operations for product inventory with SKU tracking, stock monitoring, and categorization
- **Supplier Management**: Comprehensive supplier database with contact information, status tracking, and relationship management
- **Transaction Tracking**: Real-time inventory transactions including purchases, sales, and stock movements
- **Dashboard Analytics**: Visual insights with interactive charts and key performance indicators

### Analytics & Reporting
- **Interactive Charts**: Bar charts, pie charts, line graphs, and doughnut charts powered by Chart.js
- **Inventory Analytics**: Stock distribution, value analysis, and inventory optimization insights
- **Transaction Trends**: Monthly transaction patterns, revenue vs cost analysis, and volume tracking
- **Supplier Analytics**: Performance metrics, product distribution, and supplier status monitoring
- **Dashboard Metrics**: Real-time KPIs including total products, suppliers, recent transactions, and inventory value

### User Experience
- **Responsive Design**: Mobile-first design approach with Tailwind CSS
- **Premium UI Components**: Professional styling with gradient cards, smooth animations, and modern iconography
- **Real-time Notifications**: Toast notifications for user feedback and system updates
- **Advanced Search & Filtering**: Comprehensive search functionality across all modules
- **Modal-based Forms**: Intuitive data entry with validation and error handling

## Technology Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Chart.js & React-Chartjs-2**: Interactive data visualization
- **Heroicons**: Professional icon library
- **React Router DOM**: Client-side routing
- **React Hot Toast**: Elegant notification system
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js 5.1.0**: Web application framework
- **MongoDB & Mongoose**: NoSQL database with ODM
- **Security Middleware**:
  - Helmet: Security headers
  - CORS: Cross-origin resource sharing
  - Rate Limiting: API protection
  - Morgan: HTTP request logging
  - Compression: Response compression


## Project Structure

```
erp-lite/
├── backend/
│   ├── controllers/        # Business logic controllers
│   │   ├── dashboardController.js
│   │   ├── productController.js
│   │   ├── supplierController.js
│   │   └── transactionController.js
│   ├── models/            # MongoDB data models
│   │   ├── Product.js
│   │   ├── Supplier.js
│   │   └── Transaction.js
│   ├── routes/            # API route definitions
│   │   ├── dashboard.js
│   │   ├── products.js
│   │   ├── suppliers.js
│   │   └── transactions.js
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Express server configuration
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── charts/    # Chart component library
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── DoughnutChart.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   └── index.js
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/         # Main application pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   └── Transactions.jsx
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Application entry point
│   ├── public/            # Static assets
│   ├── package.json
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # Tailwind CSS configuration
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/erp-lite
NODE_ENV=development
GEMINI_API_KEY=your_api_key_here
```

5. Start the backend server:
```bash
node server.js
```

The backend server will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Products
- `GET /products` - Retrieve all products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Suppliers
- `GET /suppliers` - Retrieve all suppliers
- `POST /suppliers` - Create new supplier
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

#### Transactions
- `GET /transactions` - Retrieve all transactions
- `POST /transactions` - Create new transaction

#### Dashboard
- `GET /dashboard/overview` - Get dashboard metrics and analytics

### Request/Response Format

All API endpoints accept and return JSON data. Example product creation:

```json
POST /api/products
{
  "name": "Product Name",
  "sku": "SKU-001",
  "description": "Product description",
  "category": "Electronics",
  "price": 99.99,
  "quantity": 100,
  "supplier": "supplier_id",
  "minStockLevel": 10
}
```

## Database Schema

### Product Model
```javascript
{
  name: String (required),
  sku: String (required, unique),
  description: String,
  category: String,
  price: Number (required),
  quantity: Number (required),
  supplier: ObjectId (ref: Supplier),
  minStockLevel: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Supplier Model
```javascript
{
  name: String (required),
  contact: String (required),
  email: String (required),
  phone: String,
  address: String,
  status: String (enum: active, inactive),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  type: String (enum: purchase, sale),
  product: ObjectId (ref: Product),
  quantity: Number (required),
  price: Number (required),
  totalAmount: Number,
  notes: String,
  createdAt: Date
}
```

## Security Features

- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Controlled cross-origin access
- **Helmet Security**: HTTP security headers
- **Input Validation**: Joi validation for API inputs
- **Error Handling**: Secure error responses

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the GitHub repository.