// src/components/Navbar.js
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to={isLoggedIn ? "/profile" : "/"} className="nav-link">
          Budget Planner
        </Link>
      </div>
      
      <div className="nav-center">
        {isLoggedIn && userData && (
          <span className="welcome-message">
            Welcome, {userData.username}
          </span>
        )}
      </div>

      <div className="nav-right">
        {!isLoggedIn ? (
          <Link to="/register" className="nav-link">Register</Link>
        ) : (
          <>
            <Link to="/planner" className="nav-link">Planner</Link>
            <Link to="/transaction" className="nav-link">Transactions</Link>
            <Link to="/budget" className="nav-link">Budget</Link>
            <Link to="/goals" className="nav-link">Goals</Link>
            <Link to="/recurring-transactions" className="nav-link">Manage</Link>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;