import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Modern Black and White Premium Color Palette
const COLORS = {
  background: "#FFFFFF",          // Pure white background
  primary: "#000000",             // Deep black for primary elements
  accent: "#333333",              // Dark gray for accents
  text: "#222222",                // Almost black for text
  subtle: "#E0E0E0",              // Light gray for subtle elements
  highlight: "#F5F5F5",           // Very light gray for highlights
  border: "#D1D1D1",              // Border color
  buttonHover: "#1A1A1A"          // Slightly lighter black for hover
};

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://ruhana-adv.onrender.com/api/users/fetch-users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const changeRole = async (id) => {
    try {
      await axios.put(`https://ruhana-adv.onrender.com/api/users/role/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const res = await axios.get('https://ruhana-adv.onrender.com/api/users/fetch-users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const deleteUser = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this user?');
    
    if (!isConfirmed) return;
  
    try {
      await axios.delete(`https://ruhana-adv.onrender.com/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
  
      const res = await axios.get('https://ruhana-adv.onrender.com/api/users/fetch-users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4" style={{ borderColor: COLORS.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: COLORS.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        All Users
      </motion.h2>
      
      <motion.div 
        className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b px-4 py-3 text-left font-medium" style={{ color: COLORS.text, borderColor: COLORS.border }}>User ID</th>
              <th className="border-b px-4 py-3 text-left font-medium" style={{ color: COLORS.text, borderColor: COLORS.border }}>Username</th>
              <th className="border-b px-4 py-3 text-left font-medium" style={{ color: COLORS.text, borderColor: COLORS.border }}>Email</th>
              <th className="border-b px-4 py-3 text-left font-medium" style={{ color: COLORS.text, borderColor: COLORS.border }}>Role</th>
              <th className="border-b px-4 py-3 text-left font-medium" style={{ color: COLORS.text, borderColor: COLORS.border }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr 
                key={user.uid} 
                className="hover:bg-gray-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <td className="border-b px-4 py-3" style={{ color: COLORS.text, borderColor: COLORS.border }}>{user.uid}</td>
                <td className="border-b px-4 py-3" style={{ color: COLORS.text, borderColor: COLORS.border }}>{user.username}</td>
                <td className="border-b px-4 py-3" style={{ color: COLORS.text, borderColor: COLORS.border }}>{user.email}</td>
                <td className="border-b px-4 py-3" style={{ color: COLORS.text, borderColor: COLORS.border }}>{user.role}</td>
                <td className="border-b px-4 py-3 flex gap-2" style={{ borderColor: COLORS.border }}>
                  <motion.button
                    onClick={() => changeRole(user.uid)}
                    className="px-4 py-2 rounded-lg border border-black"
                    style={{ backgroundColor: COLORS.background, color: COLORS.text }}
                    whileHover={{ 
                      backgroundColor: COLORS.buttonHover,
                      color: "#FFFFFF"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Change Role
                  </motion.button>
                  <motion.button
                    onClick={() => deleteUser(user.uid)}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: COLORS.primary, color: "#FFFFFF" }}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: COLORS.accent 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AllUsers;