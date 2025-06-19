import React from 'react';
import Sidebar from '../../Components/AdminComponents/Sidebar';
import DashboardStats from '../../Components/AdminComponents/DashboardStats';


const AdminPage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#D7F4FA] p-6 overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-6 text-primary">Dashboard</h2>
        <DashboardStats />
      </div>
    </div>
  );
};

export default AdminPage;
