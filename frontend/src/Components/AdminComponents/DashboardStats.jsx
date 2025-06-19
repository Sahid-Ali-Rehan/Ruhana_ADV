import React, { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const DashboardStats = () => {
  const [donutData, setDonutData] = useState(null);
  const [lineData, setLineData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://original-collections.onrender.com/api/dashboard/stats');
        const data = await response.json();

        console.log("Fetched Data:", data);

        if (data) {
          const { orders, products, users, salesData } = data;

          setDonutData({
            labels: ['Orders', 'Products', 'Users'],
            datasets: [
              {
                data: [orders, products, users],
                backgroundColor: ['#F68C1F', '#56C5DC', '#7D835F'],
              },
            ],
          });

          setLineData({
            labels: salesData.months,
            datasets: [
              {
                label: 'Sales',
                data: salesData.values,
                borderColor: '#F68C1F',
                fill: true,
                backgroundColor: 'rgba(246, 140, 31, 0.2)',
              },
            ],
          });
        } else {
          console.error("No data returned from API.");
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!donutData || !lineData) {
    return (
      <div className="grid grid-cols-2 gap-6 bg-[#D7F4FA] p-6 rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-primary mb-4">Overview</h3>
          <Skeleton height={200} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-primary mb-4">Sales Trend</h3>
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 bg-[#D7F4FA] p-6 rounded-lg">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-primary mb-4">Overview</h3>
        <Doughnut data={donutData} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-primary mb-4">Sales Trend</h3>
        <Line data={lineData} />
      </div>
    </div>
  );
};

export default DashboardStats;
