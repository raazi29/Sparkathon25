import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                RetailVerse
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI-powered smart retail experience that transforms how you shop with personalized recommendations, 
              virtual try-ons, and sustainable shopping insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/try-on" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Virtual Try-On
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/social" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Social Shopping
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">support@retailverse.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">1-800-RETAIL</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 RetailVerse. All rights reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart size={14} className="text-red-500 mx-1" /> for sustainable shopping
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};