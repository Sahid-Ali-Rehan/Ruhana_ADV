import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title,
  BarElement
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaBox, FaUsers, FaMoneyBillWave, FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Color palette constants
const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

const StatCard = ({ title, value, icon, change, isPositive, isLoading }) => {
  return (
    <motion.div 
      className="rounded-xl p-6 shadow-lg"
      style={{ backgroundColor: COLORS.blush }}
      whileHover={{ y: -5, boxShadow: `0 10px 25px ${COLORS.terracotta}20` }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-medium mb-2" style={{ color: COLORS.rust }}>{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <h3 className="text-2xl font-bold" style={{ color: COLORS.rust }}>{value}</h3>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.terracotta }}>
          {icon}
        </div>
      </div>
      
      {!isLoading && change !== undefined && (
        <div className="flex items-center mt-4">
          <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {change}%
          </span>
          <span className="ml-2 text-sm" style={{ color: COLORS.rust }}>from last month</span>
        </div>
      )}
    </motion.div>
  );
};

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://ruhana-adv.onrender.com/api/dashboard/stats');
        const data = await response.json();
        
        if (data) {
          setStats(data);
        } else {
          console.error("No data returned from API.");
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  // Format numbers with commas
  const formatNumber = num => num?.toLocaleString() || '0';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Orders" 
            value={stats ? formatNumber(stats.orders) : "0"} 
            icon={<FaShoppingCart className="text-white" />} 
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Products" 
            value={stats ? formatNumber(stats.products) : "0"} 
            icon={<FaBox className="text-white" />} 
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Customers" 
            value={stats ? formatNumber(stats.users) : "0"} 
            icon={<FaUsers className="text-white" />} 
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Revenue" 
            value={stats ? `৳${formatNumber(stats.totalRevenue)}` : "৳0"} 
            icon={<FaMoneyBillWave className="text-white" />} 
            change={stats?.revenueChange}
            isPositive={stats?.revenueChange >= 0}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.rust }}>Sales Distribution</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.terracotta }}></div>
            </div>
          ) : (
            <Doughnut 
              data={{
                labels: ['Orders', 'Products', 'Customers'],
                datasets: [
                  {
                    data: [stats.orders, stats.products, stats.users],
                    backgroundColor: [COLORS.terracotta, COLORS.moss, COLORS.sage],
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
                        size: 14
                      },
                      padding: 20
                    }
                  }
                },
                cutout: '65%'
              }}
            />
          )}
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.rust }}>Revenue Trend (Last 6 Months)</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.terracotta }}></div>
            </div>
          ) : (
            <Line 
              data={{
                labels: stats.salesData.months,
                datasets: [
                  {
                    label: 'Revenue (৳)',
                    data: stats.salesData.values,
                    borderColor: COLORS.terracotta,
                    backgroundColor: `${COLORS.terracotta}20`,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: COLORS.terracotta,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                      callback: function(value) {
                        return '৳' + value.toLocaleString();
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