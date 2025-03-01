// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Goals from './components/Goals';
import Budget from "./components/Budget";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/budget" element={<Budget/>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goals" element={<Goals />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;