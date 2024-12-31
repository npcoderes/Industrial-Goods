import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f0f0] flex flex-col items-center justify-center text-black p-4">
      <motion.h1 
        className="text-9xl font-bold text-[#422faf]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
      >
        404
      </motion.h1>
      
      <motion.div
        className="mt-8 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className="text-4xl font-semibold mb-4">Oops! Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </motion.div>
      
      <motion.div
        className="flex space-x-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Link to="/" className="px-6 py-3 bg-[#422faf] text-white rounded-full font-semibold hover:bg-[#5a3e8c] transition duration-300">
          Go Home
        </Link>
        <Link to="/contact" className="px-6 py-3 border border-[#422faf] text-[#422faf] rounded-full font-semibold hover:bg-[#422faf] hover:text-white transition duration-300">
          Contact Support
        </Link>
      </motion.div>
      
      <motion.div 
        className="mt-16"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
          <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
          <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
          <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
          <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
          <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
        </svg>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
