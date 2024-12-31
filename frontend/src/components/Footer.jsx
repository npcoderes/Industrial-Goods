import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Industrial Goods</h2>
            <p className="text-gray-400">Providing quality industrial goods since 2024.</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0 text-center">
            <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
            <div className="flex justify-center space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 p-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                <FaFacebookF className="text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 p-2 rounded-full hover:bg-blue-300 transition-colors"
              >
                <FaTwitter className="text-white" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 p-2 rounded-full hover:bg-pink-400 transition-colors"
              >
                <FaInstagram className="text-white" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <FaLinkedinIn className="text-white" />
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
            <p className="text-gray-400">Email: support@industrialgoods.com</p>
            <p className="text-gray-400">Phone: +1 (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm text-gray-500">&copy; 2024 Industrial Goods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;