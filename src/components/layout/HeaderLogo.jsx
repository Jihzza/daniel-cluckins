// src/components/layout/HeaderLogo.jsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import DaGalowLogo from '../../assets/images/DaGalow Logo.svg';

export default function HeaderLogo() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const topElement = document.getElementById('page-top');
      if (topElement) topElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.12 }} whileHover={prefersReduced ? undefined : { scale: 1.05 }}>
      <Link to="/" onClick={handleLogoClick} aria-label="Go to homepage" className="cursor-pointer">
        <img src={DaGalowLogo} alt="DaGalow Logo" className="w-[160px] md:w-[180px]" />
      </Link>
    </motion.div>
  );
}


