import React, { useEffect, useState, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaBox, 
  FaUsers, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaStar,
  FaFire
} from 'react-icons/fa';
import { COLORS, FONTS } from '../../constants';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const StatCard = ({ title, value, icon, change, isPositive, isLoading }) => {
  return (
    <motion.div 
      className="rounded-xl p-5 bg-white shadow-sm border border-gray-100"
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        borderColor: COLORS.highlight
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: COLORS.secondary }}>{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{value}</h3>
          )}
        </div>
        <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      
      {!isLoading && change !== undefined && (
        <div className="flex items-center mt-4">
          <span 
            className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {change}%
          </span>
          <span className="ml-2 text-xs" style={{ color: COLORS.secondary }}>from last month</span>
        </div>
      )}
    </motion.div>
  );
};

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([]);
  const [salesDistribution, setSalesDistribution] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all stats in parallel
        const [
          statsResponse, 
          bestSellersResponse,
          salesDistributionResponse,
          salesByCategoryResponse
        ] = await Promise.all([
          fetch('https://ruhana-adv.onrender.com/api/dashboard/stats'),
          fetch('https://ruhana-adv.onrender.com/api/dashboard/best-sellers'),
          fetch('https://ruhana-adv.onrender.com/api/dashboard/sales-distribution'),
          fetch('https://ruhana-adv.onrender.com/api/dashboard/sales-by-category')
        ]);
        
        setStats(await statsResponse.json());
        setBestSellers(await bestSellersResponse.json());
        setSalesDistribution((await salesDistributionResponse.json()).data);
        setSalesByCategory(await salesByCategoryResponse.json());
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format numbers with commas
  const formatNumber = num => num?.toLocaleString() || '0';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Define all required statuses
  const allStatuses = useMemo(() => [
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled'
  ], []);

  // Create a color palette for all statuses
  const statusColors = useMemo(() => [
    COLORS.primary,        // Pending
    '#FFA500',             // Confirmed (orange)
    COLORS.accent,         // Shipped
    '#10B981',             // Delivered (green)
    '#EF4444'              // Canceled (red)
  ], []);

  // Transform sales distribution to include all statuses with proper percentages
  const transformedDistribution = useMemo(() => {
    // Calculate total orders for percentage calculation
    const totalOrders = salesDistribution.reduce(
      (total, item) => total + item.count, 0
    );
    
    // Create a map of existing status counts for quick lookup
    const statusMap = new Map();
    salesDistribution.forEach(item => {
      statusMap.set(item.status, item.count);
    });
    
    // Create distribution array with all required statuses
    return allStatuses.map(status => {
      const count = statusMap.get(status) || 0;
      const percent = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
      
      return {
        status,
        count,
        percent
      };
    });
  }, [salesDistribution, allStatuses]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Orders" 
            value={stats ? formatNumber(stats.orders) : "0"} 
            icon={<FaShoppingCart className="text-xl" />} 
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Products" 
            value={stats ? formatNumber(stats.products) : "0"} 
            icon={<FaBox className="text-xl" />} 
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Customers" 
            value={stats ? formatNumber(stats.users) : "0"} 
            icon={<FaUsers className="text-xl" />} 
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Revenue" 
            value={stats ? `৳${formatNumber(stats.totalRevenue)}` : "৳0"} 
            icon={<FaChartLine className="text-xl" />} 
            change={stats?.revenueChange}
            isPositive={stats?.revenueChange >= 0}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* Charts and Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          {/* Revenue Chart */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>
                Revenue Trend (All Time)
              </h3>
              <div className="flex items-center text-sm" style={{ color: COLORS.secondary }}>
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                All Time
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div style={{ minWidth: `${stats.salesData.months.length * 50}px`, height: '400px' }}>
                  <Line 
                    data={{
                      labels: stats.salesData.months,
                      datasets: [
                        {
                          label: 'Revenue (৳)',
                          data: stats.salesData.values,
                          borderColor: COLORS.highlight,
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: COLORS.highlight,
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 4,
                          pointHoverRadius: 6
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `৳${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.03)'
                          },
                          ticks: {
                            callback: function(value) {
                              return '৳' + (value/1000).toFixed(0) + 'K';
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Best Sellers */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>
              Best Selling Products
            </h3>
            <span className="text-sm flex items-center" style={{ color: COLORS.highlight }}>
              <FaFire className="mr-1" /> This Month
            </span>
          </div>
          
          {isLoading || !bestSellers.length ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {bestSellers.map((product, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mr-3">
                    <span className="font-bold" style={{ color: COLORS.primary }}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate" style={{ color: COLORS.primary }}>
                      {product.name}
                    </p>
                    <div className="flex items-center text-xs mt-1">
                      <span className="text-gray-500 mr-2">৳{product.price}</span>
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: COLORS.primary }}>
                      {product.sold} sold
                    </p>
                    <p className="text-xs" style={{ color: COLORS.secondary }}>
                      ৳{product.revenue}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Distribution */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.primary }}>
            Sales Distribution
          </h3>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-1/2">
                <Doughnut 
                  data={{
                    labels: transformedDistribution.map(item => item.status),
                    datasets: [
                      {
                        data: transformedDistribution.map(item => item.percent),
                        backgroundColor: statusColors,
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 12
                          },
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const index = context.dataIndex;
                            const count = transformedDistribution[index].count;
                            return `${context.label}: ${context.parsed}% (${count} orders)`;
                          }
                        }
                      }
                    },
                    cutout: '75%'
                  }}
                />
              </div>
              <div className="w-1/2 pl-6">
                {transformedDistribution.map((item, index) => (
                  <div key={item.status} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm" style={{ color: COLORS.secondary }}>{item.status}</span>
                      <span className="font-medium" style={{ color: COLORS.primary }}>{item.percent}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          backgroundColor: statusColors[index],
                          width: `${item.percent}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1" style={{ color: COLORS.secondary }}>
                      {item.count} orders
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sales by Category */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.primary }}>
            Sales by Category
          </h3>
          {isLoading || !salesByCategory.length ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
            </div>
          ) : (
            <Bar 
              data={{
                labels: salesByCategory.map(item => item._id || 'Uncategorized'),
                datasets: [
                  {
                    label: 'Sales Percentage',
                    data: salesByCategory.map(item => item.percent),
                    backgroundColor: COLORS.highlight,
                    borderRadius: 6,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const index = context.dataIndex;
                        const amount = salesByCategory[index].totalSales;
                        return `${context.parsed}% (৳${amount.toLocaleString()})`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.03)'
                    },
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardStats;