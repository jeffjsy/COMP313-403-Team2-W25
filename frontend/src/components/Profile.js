import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirect if no token
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to fetch profile');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  return (
    <div>
      <h1>Profile</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user ? (
        <p>Welcome, {user.username}</p>
      ) : (
        <p>Loading...</p> // Show loading state
      )}
    </div>
  );
};

export default Profile;