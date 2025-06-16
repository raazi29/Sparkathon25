import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, TrendingDown, TrendingUp, Bell, Share2, Folder, Plus, X, Star, AlertCircle, CheckCircle, Eye, EyeOff, CircleDot as DragHandleDots2, Filter, SortAsc, SortDesc, Grid, List, Settings, Download, Upload, Link, Facebook, Twitter, Instagram, Copy, Trash2, Edit3, BarChart3, Calendar, Package, Zap, Clock, Target, Bookmark, Tag, Search, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useStore } from '../store/useStore';
import { Product } from '../types';

interface WishlistCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  itemCount: number;
}

interface PriceHistory {
  date: Date;
  price: number;
}

interface EnhancedWishlistItem {
  id: string;
  productId: string;
  product: Product;
  dateAdded: Date;
  priceHistory: PriceHistory[];
  priceThreshold?: number;
  categoryId: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  lastPriceCheck: Date;
  priceDropPercentage?: number;
  stockAlert: boolean;
}

interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  dropPercentage: number;
  timestamp: Date;
  read: boolean;
}

export const SmartWishlist: React.FC = () => {
  const { user, products, addToCart, wishlistItems, removeFromWishlist } = useStore();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'price' | 'priceChange' | 'priority'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPriceHistory, setShowPriceHistory] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [enhancedWishlist, setEnhancedWishlist] = useState<EnhancedWishlistItem[]>([]);
  
  // Categories
  const [categories, setCategories] = useState<WishlistCategory[]>([
    { id: 'all', name: 'All Items', color: 'bg-gray-500', icon: 'heart', itemCount: 0 },
    { id: 'electronics', name: 'Electronics', color: 'bg-blue-500', icon: 'zap', itemCount: 0 },
    { id: 'fashion', name: 'Fashion', color: 'bg-pink-500', icon: 'tag', itemCount: 0 },
    { id: 'home', name: 'Home & Garden', color: 'bg-green-500', icon: 'home', itemCount: 0 },
    { id: 'gifts', name: 'Gift Ideas', color: 'bg-purple-500', icon: 'gift', itemCount: 0 },
    { id: 'sale', name: 'On Sale', color: 'bg-red-500', icon: 'percent', itemCount: 0 }
  ]);

  // Initialize enhanced wishlist
  useEffect(() => {
    const enhanced = wishlistItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      
      // Generate mock price history
      const priceHistory: PriceHistory[] = [];
      const currentDate = new Date();
      for (let i = 30; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const price = product.price * (1 + variation);
        priceHistory.push({ date, price: Math.round(price * 100) / 100 });
      }
      
      return {
        id: `wishlist-${item.productId}`,
        productId: item.productId,
        product,
        dateAdded: item.dateAdded,
        priceHistory,
        priceThreshold: product.price * 0.9, // 10% discount threshold
        categoryId: product.category.toLowerCase(),
        priority: 'medium' as const,
        notificationsEnabled: true,
        lastPriceCheck: new Date(),
        priceDropPercentage: Math.random() > 0.7 ? Math.round(Math.random() * 20 + 5) : undefined,
        stockAlert: product.stockCount < 10
      };
    }).filter(Boolean) as EnhancedWishlistItem[];
    
    setEnhancedWishlist(enhanced);
    
    // Update category counts
    setCategories(prev => prev.map(cat => ({
      ...cat,
      itemCount: cat.id === 'all' 
        ? enhanced.length 
        : enhanced.filter(item => item.categoryId === cat.id).length
    })));
  }, [wishlistItems, products]);

  // Generate mock price alerts
  useEffect(() => {
    const alerts: PriceAlert[] = enhancedWishlist
      .filter(item => item.priceDropPercentage)
      .map(item => ({
        id: `alert-${item.id}`,
        productId: item.productId,
        productName: item.product.name,
        oldPrice: item.product.originalPrice || item.product.price * 1.2,
        newPrice: item.product.price,
        dropPercentage: item.priceDropPercentage!,
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
        read: Math.random() > 0.5
      }));
    
    setPriceAlerts(alerts);
  }, [enhancedWishlist]);

  // Filter and sort wishlist items
  const filteredItems = enhancedWishlist
    .filter(item => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      if (searchQuery && !item.product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dateAdded':
          comparison = a.dateAdded.getTime() - b.dateAdded.getTime();
          break;
        case 'price':
          comparison = a.product.price - b.product.price;
          break;
        case 'priceChange':
          const aChange = a.priceDropPercentage || 0;
          const bChange = b.priceDropPercentage || 0;
          comparison = aChange - bChange;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (categoryId: string) => {
    if (draggedItem) {
      setEnhancedWishlist(prev => prev.map(item => 
        item.id === draggedItem ? { ...item, categoryId } : item
      ));
      setDraggedItem(null);
    }
  };

  const handleMoveToCart = (item: EnhancedWishlistItem) => {
    addToCart({
      productId: item.productId,
      quantity: 1,
      addedAt: new Date()
    });
    removeFromWishlist(item.productId);
  };

  const handleSetPriceThreshold = (itemId: string, threshold: number) => {
    setEnhancedWishlist(prev => prev.map(item => 
      item.id === itemId ? { ...item, priceThreshold: threshold } : item
    ));
  };

  const exportWishlist = () => {
    const csvContent = [
      ['Product Name', 'Price', 'Category', 'Date Added', 'Price Threshold'],
      ...filteredItems.map(item => [
        item.product.name,
        item.product.price.toString(),
        item.categoryId,
        item.dateAdded.toLocaleDateString(),
        item.priceThreshold?.toString() || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist.csv';
    a.click();
  };

  const shareWishlist = (platform: string) => {
    const shareText = `Check out my wishlist on RetailVerse! ${filteredItems.length} amazing products I'm watching.`;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Smart Wishlist
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Track prices, get alerts, and organize your favorite products
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
              <button
                onClick={exportWishlist}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Price Alerts Banner */}
          {priceAlerts.filter(alert => !alert.read).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="animate-pulse" size={24} />
                  <div>
                    <h3 className="font-semibold">Price Drop Alerts!</h3>
                    <p className="text-sm opacity-90">
                      {priceAlerts.filter(alert => !alert.read).length} items have dropped in price
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                  View All
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Categories
                </h3>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCategory(category.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {category.itemCount}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {enhancedWishlist.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price Drops</span>
                  <span className="font-semibold text-green-600">
                    {enhancedWishlist.filter(item => item.priceDropPercentage).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Low Stock</span>
                  <span className="font-semibold text-orange-600">
                    {enhancedWishlist.filter(item => item.stockAlert).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${enhancedWishlist.reduce((sum, item) => sum + item.product.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Price Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Alerts
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {priceAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.read 
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingDown className="text-green-500" size={16} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.dropPercentage}% off
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {alert.productName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.timestamp.toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 line-through">
                          ${alert.oldPrice}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ${alert.newPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="dateAdded">Date Added</option>
                    <option value="price">Price</option>
                    <option value="priceChange">Price Change</option>
                    <option value="priority">Priority</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            {filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start adding products you love to track prices and get alerts
                </p>
                <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                  Browse Products
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-move hover:shadow-xl transition-all ${
                      viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        {/* Grid View */}
                        <div className="relative mb-4">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col space-y-1">
                            {item.priceDropPercentage && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                -{item.priceDropPercentage}%
                              </span>
                            )}
                            {item.stockAlert && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                Low Stock
                              </span>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              onClick={() => setShowPriceHistory(showPriceHistory === item.id ? null : item.id)}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                            >
                              <BarChart3 size={16} />
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.productId)}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {item.product.name}
                          </h3>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${
                                    i < Math.floor(item.product.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({item.product.reviews})
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-bold text-gray-900 dark:text-white">
                                ${item.product.price}
                              </span>
                              {item.product.originalPrice && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  ${item.product.originalPrice}
                                </span>
                              )}
                            </div>
                            {item.priceDropPercentage && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <TrendingDown size={16} />
                                <span className="text-sm font-medium">
                                  {item.priceDropPercentage}%
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Price Threshold */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Price Alert: ${item.priceThreshold?.toFixed(2) || item.product.price}
                            </label>
                            <input
                              type="range"
                              min={item.product.price * 0.5}
                              max={item.product.price}
                              step="0.01"
                              value={item.priceThreshold || item.product.price}
                              onChange={(e) => handleSetPriceThreshold(item.id, parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleMoveToCart(item)}
                              className="flex-1 flex items-center justify-center space-x-2 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                            >
                              <ShoppingCart size={16} />
                              <span>Add to Cart</span>
                            </button>
                            <button
                              onClick={() => setShowPriceAlertModal(item.id)}
                              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Bell size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Price History Chart */}
                        <AnimatePresence>
                          {showPriceHistory === item.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            >
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Price History (30 days)
                              </h4>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={item.priceHistory}>
                                    <defs>
                                      <linearGradient id={`gradient-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <XAxis 
                                      dataKey="date" 
                                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                      fontSize={10}
                                    />
                                    <YAxis fontSize={10} />
                                    <Tooltip 
                                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                      formatter={(value) => [`$${value}`, 'Price']}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="price"
                                      stroke="#3B82F6"
                                      fillOpacity={1}
                                      fill={`url(#gradient-${item.id})`}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <>
                        {/* List View */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg mr-6"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.product.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {item.priceDropPercentage && (
                                <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                                  -{item.priceDropPercentage}%
                                </span>
                              )}
                              <button
                                onClick={() => removeFromWishlist(item.productId)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                  ${item.product.price}
                                </span>
                                {item.product.originalPrice && (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ${item.product.originalPrice}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Star className="text-yellow-400 fill-current" size={16} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.product.rating} ({item.product.reviews})
                                </span>
                              </div>
                              
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Added {item.dateAdded.toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setShowPriceHistory(showPriceHistory === item.id ? null : item.id)}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <BarChart3 size={16} />
                              </button>
                              <button
                                onClick={() => setShowPriceAlertModal(item.id)}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Bell size={16} />
                              </button>
                              <button
                                onClick={() => handleMoveToCart(item)}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Share Your Wishlist
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => shareWishlist('facebook')}
                  className="flex items-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Facebook size={20} />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => shareWishlist('twitter')}
                  className="flex items-center space-x-3 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  <Twitter size={20} />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => shareWishlist('copy')}
                  className="flex items-center space-x-3 p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors col-span-2"
                >
                  <Copy size={20} />
                  <span>Copy Link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};