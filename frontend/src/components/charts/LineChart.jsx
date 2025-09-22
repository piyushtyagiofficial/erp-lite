import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ 
  data, 
  title = 'Line Chart',
  height = 300,
  colors = [
    'rgba(79, 70, 229, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(239, 68, 68, 1)'
  ],
  filled = false,
  className = ''
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        display: true,
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
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: '#fff',
        borderWidth: 2
      },
      line: {
        tension: 0.3,
        borderWidth: 3
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const createDataset = (dataset, index) => ({
    label: dataset.label,
    data: dataset.values,
    borderColor: colors[index % colors.length],
    backgroundColor: filled 
      ? colors[index % colors.length].replace('1)', '0.1)')
      : colors[index % colors.length],
    fill: filled,
    pointBackgroundColor: '#fff',
    pointBorderColor: colors[index % colors.length],
    pointHoverBackgroundColor: colors[index % colors.length],
    pointHoverBorderColor: '#fff',
  });

  const chartData = {
    labels: data.labels,
    datasets: Array.isArray(data.datasets) 
      ? data.datasets.map(createDataset)
      : [createDataset({ label: data.label || 'Data', values: data.values }, 0)]
  };

  return (
    <div className={`h-${height} ${className}`} style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;