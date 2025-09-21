// LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('user');

    // Optionally, invoke context or Redux logout method
    if (onLogout) onLogout();

    // Redirect to login or home page
    navigate('/login', { replace: true });
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );
};

export default LogoutButton;
