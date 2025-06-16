import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  MessageCircle, 
  Camera, 
  Eye,
  Star,
  Zap,
  Gift
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { mockProducts, mockUser } from '../data/mockData';
import { ProductCard } from '../components/Common/ProductCard';

export const Home: React.FC = () => {
  const { user, setUser, setProducts, products } = useStore();
  
  useEffect(() => {
    // Initialize mock data
    if (!user) {
      setUser(mockUser);
    }
    if (products.length === 0) {
      setProducts(mockProducts);
    }
  }, [user, setUser, products, setProducts]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const trendingProducts = products.filter(p => p.isTrending);
  const newProducts = products.filter(p => p.isNew);
  const dealsProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {getGreeting()}, {user?.name || 'Shopper'}!
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover your perfect products with AI-powered recommendations
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/ai-assistant"
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span>Ask AI Assistant</span>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/try-on"
                  className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 hover:bg-white/30 transition-colors"
                >
                  <Camera size={20} />
                  <span>Try-On Studio</span>
                </Link>
              </motion.div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">{user?.loyaltyPoints || 0}</div>
                <div className="text-sm opacity-80">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user?.tier || 'Bronze'}</div>
                <div className="text-sm opacity-80">Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user?.sustainabilityScore || 0}</div>
                <div className="text-sm opacity-80">Eco Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5★</div>
                <div className="text-sm opacity-80">Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Quick Actions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <Link
              to="/visual-search"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Visual Search</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Find products by image</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/sustainability"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Eco Tracker</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Monitor your impact</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/social"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Social Hub</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Share your style</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Daily Deals */}
      {dealsProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Deals</h2>
                    <p className="text-gray-600 dark:text-gray-400">Limited time offers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Ends in 23:59:42</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dealsProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
                    <p className="text-gray-600 dark:text-gray-400">What everyone's buying</p>
                  </div>
                </div>
                <Link
                  to="/products?filter=trending"
                  className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  <span>View All</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-12 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Gift className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
                    <p className="text-gray-600 dark:text-gray-400">Fresh products just for you</p>
                  </div>
                </div>
                <Link
                  to="/products?filter=new"
                  className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  <span>View All</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* AI Assistant CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12 text-white text-center"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Not sure what you're looking for?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Let our AI assistant help you find the perfect products based on your preferences, 
                mood, and budget.
              </p>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                <MessageCircle size={20} />
                <span>Start Conversation</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};