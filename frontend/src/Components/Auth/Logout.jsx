import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the user token (from localStorage or cookies)
    localStorage.removeItem('token');  // assuming you're using localStorage for token
    localStorage.removeItem('userId');
    // You can also clear cookies if you're storing the token there
    // document.cookie = 'authToken=; max-age=0'; 

    // Optionally, send a logout request to the backend (if you want to handle session invalidation on the server)
    // fetch('/api/logout', { method: 'POST' }); // Example route

    // Redirect to login page after logout
    navigate('/login');
  }, [navigate]);

  return <div>Logging you out...</div>;
};

export default Logout;
