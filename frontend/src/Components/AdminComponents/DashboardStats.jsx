import React, { useEffect, useState, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaBox, 
  FaUsers, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaStar,
  FaFire,
  FaExchangeAlt
} from 'react-icons/fa';
import { COLORS, FONTS } from '../../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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

const ThreeDMetricCard = ({ title, value, icon, color, isLoading }) => {
  return (
    <motion.div
      className="relative rounded-xl p-6 overflow-hidden h-full"
      whileHover={{ 
        y: -5,
        scale: 1.02,
        boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        background: `linear-gradient(135deg, ${color}10, ${color}05)`,
        border: `1px solid ${color}20`,
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* 3D Edge Effect */}
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ 
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          transform: "translateZ(10px)"
        }}
      ></div>
      
      {/* Glossy Overlay */}
      <div 
        className="absolute top-0 left-0 w-full h-1/2 opacity-10"
        style={{ 
          background: "linear-gradient(to bottom, white, transparent)",
          transform: "translateZ(5px)"
        }}
      ></div>
      
      <div className="relative flex flex-col h-full" style={{ transform: "translateZ(20px)" }}>
        {isLoading ? (
          <>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <div 
                className="p-3 rounded-lg mr-3"
                style={{ background: `${color}15` }}
              >
                {React.cloneElement(icon, { 
                  className: "text-xl",
                  style: { color: color } 
                })}
              </div>
              <p className="text-md font-medium" style={{ color: COLORS.secondary }}>{title}</p>
            </div>
            <h3 className="text-3xl font-bold mt-auto" style={{ color: color }}>{value}</h3>
          </>
        )}
      </div>
    </motion.div>
  );
};

const DynamicMetricCard = ({ metrics, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (metrics.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % metrics.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [metrics.length]);

  const currentMetric = metrics[currentIndex];

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>
          Key Performance Metrics
        </h3>
        <div className="flex items-center text-sm" style={{ color: COLORS.secondary }}>
          <FaExchangeAlt className="mr-2 animate-pulse" />
          Auto-rotating
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-grow flex flex-col justify-center"
            >
              <div className="flex items-center mb-4">
                <div 
                  className="p-3 rounded-lg mr-3"
                  style={{ background: `${currentMetric.color}15` }}
                >
                  {React.cloneElement(currentMetric.icon, { 
                    className: "text-xl",
                    style: { color: currentMetric.color } 
                  })}
                </div>
                <p className="text-md font-medium" style={{ color: COLORS.secondary }}>
                  {currentMetric.title}
                </p>
              </div>
              
              <div className="flex items-baseline">
                <h3 
                  className="text-4xl font-bold" 
                  style={{ color: currentMetric.color }}
                >
                  {currentMetric.value}
                </h3>
                {currentMetric.change !== undefined && (
                  <span 
                    className={`ml-4 flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                      currentMetric.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {currentMetric.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {currentMetric.change}%
                  </span>
                )}
              </div>
              
              <p className="mt-3 text-sm" style={{ color: COLORS.secondary }}>
                {currentMetric.description}
              </p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center mt-4 space-x-1">
            {metrics.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show metric ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch only needed data to reduce payload
        const [statsResponse, bestSellersResponse, salesByCategoryResponse] = await Promise.all([
          fetch('https://ruhana-adv.onrender.com/api/dashboard/stats'),
          fetch('https://ruhana-adv.onrender.com/api/dashboard/best-sellers'),
          fetch('https://ruhana-adv.onrender.com/api/dashboard/sales-by-category')
        ]);
        
        setStats(await statsResponse.json());
        setBestSellers(await bestSellersResponse.json());
        setSalesByCategory(await salesByCategoryResponse.json());
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Cleanup function to abort requests if component unmounts
    return () => {
      // Implement abort controller if needed for large requests
    };
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

  // Calculate dynamic metrics
  const dynamicMetrics = useMemo(() => {
    if (!stats) return [];
    
    const avgOrderValue = stats.orders > 0 
      ? stats.totalRevenue / stats.orders 
      : 0;
      
    const conversionRate = stats.visitors > 0 
      ? (stats.orders / stats.visitors) * 100 
      : 0;
    
    return [
      {
        title: "Revenue Growth",
        value: `৳${formatNumber(stats.totalRevenue)}`,
        change: stats?.revenueChange,
        isPositive: stats?.revenueChange >= 0,
        description: "Total revenue generated this period",
        icon: <FaChartLine />,
        color: COLORS.highlight
      },
      {
        title: "Avg. Order Value",
        value: `৳${formatNumber(avgOrderValue.toFixed(2))}`,
        change: stats?.avgOrderValueChange,
        isPositive: stats?.avgOrderValueChange >= 0,
        description: "Average value per customer order",
        icon: <FaShoppingCart />,
        color: "#10B981"
      },
      {
        title: "Conversion Rate",
        value: `${conversionRate.toFixed(1)}%`,
        change: stats?.conversionRateChange,
        isPositive: stats?.conversionRateChange >= 0,
        description: "Visitors to paying customers",
        icon: <FaUsers />,
        color: "#8B5CF6"
      },
      {
        title: "Customer Retention",
        value: `${stats?.retentionRate || 0}%`,
        change: stats?.retentionChange,
        isPositive: stats?.retentionChange >= 0,
        description: "Repeat customers this period",
        icon: <FaStar />,
        color: "#F59E0B"
      }
    ];
  }, [stats]);

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
          {/* Dynamic Metrics Card */}
          <motion.div variants={itemVariants}>
            <DynamicMetricCard 
              metrics={dynamicMetrics} 
              isLoading={isLoading}
            />
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
        {/* Core Metrics - 3D Cards */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.primary }}>
            Core Metrics
          </h3>
          
          <div className="grid grid-cols-3 gap-4 h-48">
            <ThreeDMetricCard 
              title="Orders" 
              value={stats ? formatNumber(stats.orders) : "0"} 
              icon={<FaShoppingCart />}
              color={COLORS.highlight}
              isLoading={isLoading}
            />
            
            <ThreeDMetricCard 
              title="Products" 
              value={stats ? formatNumber(stats.products) : "0"} 
              icon={<FaBox />}
              color="#10B981"
              isLoading={isLoading}
            />
            
            <ThreeDMetricCard 
              title="Customers" 
              value={stats ? formatNumber(stats.users) : "0"} 
              icon={<FaUsers />}
              color="#8B5CF6"
              isLoading={isLoading}
            />
          </div>
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