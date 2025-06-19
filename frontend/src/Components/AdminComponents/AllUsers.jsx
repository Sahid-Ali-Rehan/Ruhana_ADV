import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../Loading/Loading';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://original-collections.onrender.com/api/users/fetch-users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const changeRole = async (id) => {
    try {
      await axios.put(`https://original-collections.onrender.com/api/users/role/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const res = await axios.get('https://original-collections.onrender.com/api/users/fetch-users', {
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
      await axios.delete(`https://original-collections.onrender.com/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
  
      const res = await axios.get('https://original-collections.onrender.com/api/users/fetch-users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
      <table className="min-w-full bg-white border border-secondary rounded-lg">
        <thead>
          <tr className="bg-secondary text-primary">
            <th className="border-b px-4 py-3">User ID</th>
            <th className="border-b px-4 py-3">Username</th>
            <th className="border-b px-4 py-3">Email</th>
            <th className="border-b px-4 py-3">Role</th>
            <th className="border-b px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.uid} className="text-primary text-center">
              <td className="border-b px-4 py-3">{user.uid}</td>
              <td className="border-b px-4 py-3">{user.username}</td>
              <td className="border-b px-4 py-3">{user.email}</td>
              <td className="border-b px-4 py-3">{user.role}</td>
              <td className="border-b px-4 py-3 flex justify-center gap-2">
                <button
                  onClick={() => changeRole(user.uid)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition duration-200"
                >
                  Change Role
                </button>
                <button
                  onClick={() => deleteUser(user.uid)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsers;
