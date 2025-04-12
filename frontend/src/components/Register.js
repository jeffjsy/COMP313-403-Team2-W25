// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_URL = process.env.REACT_APP_API_URL;
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Registration failed';
      alert(errorMessage);
      console.error('Registration error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create New Account</h2>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-button">
          Register
        </button>

        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/login" className="link">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;