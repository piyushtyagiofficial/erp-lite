import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  data, 
  title = 'Bar Chart',
  height = 300,
  backgroundColor = ['rgba(79, 70, 229, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
  borderColor = ['rgba(79, 70, 229, 1)', 'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
  className = ''
}) => {
  // Safety check for data
  if (!data || !data.labels) {
    return (
      <div className={`h-${height} ${className} flex items-center justify-center`} style={{ height: `${height}px` }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 600
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(79, 70, 229, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart'
    }
  };

  // Handle both single dataset (with values) and multiple datasets (with datasets array)
  const chartData = {
    labels: data.labels,
    datasets: data.datasets ? 
      // Multiple datasets format
      data.datasets.map((dataset, index) => ({
        label: dataset.label || 'Data',
        data: dataset.values || [],
        backgroundColor: Array.isArray(backgroundColor) 
          ? backgroundColor[index] || backgroundColor[0]
          : backgroundColor,
        borderColor: Array.isArray(borderColor)
          ? borderColor[index] || borderColor[0]
          : borderColor,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      })) :
      // Single dataset format
      [{
        label: data.label || 'Data',
        data: data.values || [],
        backgroundColor: Array.isArray(backgroundColor) 
          ? backgroundColor.slice(0, (data.values || []).length)
          : backgroundColor,
        borderColor: Array.isArray(borderColor)
          ? borderColor.slice(0, (data.values || []).length)
          : borderColor,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
  };

  return (
    <div className={`h-${height} ${className}`} style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;