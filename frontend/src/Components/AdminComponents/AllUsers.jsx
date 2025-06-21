import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Color palette constants
const COLORS = {
  background: "#EFE2B2",
  primary: "#9E5F57",
  accent: "#567A4B",
  text: "#814B4A",
  subtle: "#97A276",
  highlight: "#F5C9C6"
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
        className="overflow-x-auto rounded-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <table className="min-w-full" style={{ backgroundColor: COLORS.highlight }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.primary }}>
              <th className="border-b px-4 py-3 text-white">User ID</th>
              <th className="border-b px-4 py-3 text-white">Username</th>
              <th className="border-b px-4 py-3 text-white">Email</th>
              <th className="border-b px-4 py-3 text-white">Role</th>
              <th className="border-b px-4 py-3 text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr 
                key={user.uid} 
                style={{ color: COLORS.text, borderColor: COLORS.subtle }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ backgroundColor: COLORS.highlight }}
              >
                <td className="border-b px-4 py-3">{user.uid}</td>
                <td className="border-b px-4 py-3">{user.username}</td>
                <td className="border-b px-4 py-3">{user.email}</td>
                <td className="border-b px-4 py-3">{user.role}</td>
                <td className="border-b px-4 py-3 flex justify-center gap-2">
                  <motion.button
                    onClick={() => changeRole(user.uid)}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: COLORS.subtle, color: 'white' }}
                    whileHover={{ scale: 1.05, backgroundColor: COLORS.primary }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Change Role
                  </motion.button>
                  <motion.button
                    onClick={() => deleteUser(user.uid)}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                    whileHover={{ scale: 1.05, backgroundColor: COLORS.accent }}
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