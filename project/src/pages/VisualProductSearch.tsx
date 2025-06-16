import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Search, 
  Filter, 
  X, 
  Eye, 
  Heart, 
  ShoppingCart, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Grid,
  List,
  Zap,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  Share2,
  Bookmark,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';
import { ProductCard } from '../components/Common/ProductCard';

interface SearchResult extends Product {
  similarity: number;
  source: string;
  scrapedAt: Date;
}

interface SearchHistory {
  id: string;
  image: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

interface WebScrapingSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  lastScrape: Date;
  productCount: number;
  status: 'active' | 'inactive' | 'error';
}

export const VisualProductSearch: React.FC = () => {
  const { products, addToCart, addToWishlist, searchHistory, addToSearchHistory } = useStore();
  
  // State management
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [searchHistoryList, setSearchHistoryList] = useState<SearchHistory[]>([]);
  const [scrapingSources, setScrapingSources] = useState<WebScrapingSource[]>([
    {
      id: '1',
      name: 'Amazon Products',
      url: 'https://amazon.com',
      enabled: true,
      lastScrape: new Date(),
      productCount: 15420,
      status: 'active'
    },
    {
      id: '2',
      name: 'eBay Listings',
      url: 'https://ebay.com',
      enabled: true,
      lastScrape: new Date(Date.now() - 3600000),
      productCount: 8930,
      status: 'active'
    },
    {
      id: '3',
      name: 'Etsy Marketplace',
      url: 'https://etsy.com',
      enabled: false,
      lastScrape: new Date(Date.now() - 86400000),
      productCount: 5670,
      status: 'inactive'
    },
    {
      id: '4',
      name: 'AliExpress',
      url: 'https://aliexpress.com',
      enabled: true,
      lastScrape: new Date(Date.now() - 1800000),
      productCount: 23450,
      status: 'error'
    }
  ]);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest'>('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get unique brands from products
  const availableBrands = Array.from(new Set(products.map(p => p.brand)));

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Web scraping simulation
  const simulateWebScraping = useCallback(async (imageData: string): Promise<SearchResult[]> => {
    setIsSearching(true);
    
    // Simulate API calls to different sources
    const enabledSources = scrapingSources.filter(source => source.enabled && source.status === 'active');
    
    // Simulate delay for scraping
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock results based on existing products with similarity scores
    const mockResults: SearchResult[] = products.map(product => ({
      ...product,
      similarity: Math.random() * 100,
      source: enabledSources[Math.floor(Math.random() * enabledSources.length)]?.name || 'RetailVerse',
      scrapedAt: new Date()
    })).sort((a, b) => b.similarity - a.similarity);
    
    setIsSearching(false);
    return mockResults.slice(0, 20); // Return top 20 results
  }, [products, scrapingSources]);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setSearchImage(imageData);
      
      // Perform visual search
      const results = await simulateWebScraping(imageData);
      setSearchResults(results);
      
      // Add to search history
      const historyItem: SearchHistory = {
        id: Date.now().toString(),
        image: imageData,
        query: 'Visual Search',
        timestamp: new Date(),
        resultsCount: results.length
      };
      setSearchHistoryList(prev => [historyItem, ...prev.slice(0, 9)]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsUsingCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setSearchImage(imageData);
        setIsUsingCamera(false);
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        
        // Perform visual search
        const results = await simulateWebScraping(imageData);
        setSearchResults(results);
        
        // Add to search history
        const historyItem: SearchHistory = {
          id: Date.now().toString(),
          image: imageData,
          query: 'Camera Search',
          timestamp: new Date(),
          resultsCount: results.length
        };
        setSearchHistoryList(prev => [historyItem, ...prev.slice(0, 9)]);
      }
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const filteredResults = searchResults.filter(product => {
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedBrands.size > 0 && !selectedBrands.has(product.brand)) return false;
    if (product.rating < minRating) return false;
    if (inStockOnly && !product.inStock) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default: return b.similarity - a.similarity;
    }
  });

  const toggleScrapingSource = (sourceId: string) => {
    setScrapingSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, enabled: !source.enabled }
        : source
    ));
  };

  const refreshScrapingSources = async () => {
    // Simulate refreshing scraping sources
    setScrapingSources(prev => prev.map(source => ({
      ...source,
      lastScrape: new Date(),
      productCount: source.productCount + Math.floor(Math.random() * 100),
      status: Math.random() > 0.1 ? 'active' : 'error'
    })));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Visual Product Search
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find products by uploading an image or taking a photo. Our AI will search across multiple sources.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search & Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Image Upload/Camera */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search by Image
              </h3>
              
              {!isUsingCamera && !searchImage && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Upload Image
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Drag & drop or click
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}

              {!isUsingCamera && !searchImage && (
                <div className="mt-4">
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    <Camera size={18} />
                    <span>Use Camera</span>
                  </button>
                </div>
              )}

              {isUsingCamera && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 object-cover rounded-lg bg-gray-900"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex space-x-2">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <Camera size={18} />
                      <span>Capture</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUsingCamera(false);
                        if (stream) {
                          stream.getTracks().forEach(track => track.stop());
                          setStream(null);
                        }
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              {searchImage && (
                <div className="space-y-4">
                  <img
                    src={searchImage}
                    alt="Search query"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSearchImage(null);
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw size={18} />
                    <span>New Search</span>
                  </button>
                </div>
              )}
            </div>

            {/* Web Scraping Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search Sources
                </h3>
                <button
                  onClick={refreshScrapingSources}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Refresh sources"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {scrapingSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        source.status === 'active' ? 'bg-green-500' :
                        source.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {source.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {source.productCount.toLocaleString()} products
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={() => toggleScrapingSource(source.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Brands */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Brands
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableBrands.map((brand) => (
                          <label key={brand} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedBrands.has(brand)}
                              onChange={(e) => {
                                const newBrands = new Set(selectedBrands);
                                if (e.target.checked) {
                                  newBrands.add(brand);
                                } else {
                                  newBrands.delete(brand);
                                }
                                setSelectedBrands(newBrands);
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {brand}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Minimum Rating: {minRating}★
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* In Stock Only */}
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        In stock only
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search History */}
            {searchHistoryList.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Search History
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {searchHistoryList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSearchImage(item.image)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <img
                        src={item.image}
                        alt="Search history"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.query}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.resultsCount} results • {item.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Results Header */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {isSearching ? 'Searching...' : `${filteredResults.length} Results Found`}
                    </h2>
                    {isSearching && (
                      <Loader className="animate-spin text-primary-500" size={20} />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="relevance">Most Relevant</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                    </select>

                    {/* View Mode Toggle */}
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

                {/* Selected Products Actions */}
                {selectedProducts.size > 0 && (
                  <div className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {selectedProducts.size} products selected
                    </span>
                    <button
                      onClick={() => setShowComparison(true)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Compare Selected
                    </button>
                    <button
                      onClick={() => setSelectedProducts(new Set())}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-500"></div>
                    <Search className="absolute inset-0 m-auto text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Searching across multiple sources...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This may take a few moments while we analyze your image
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Search Yet */}
            {!searchImage && !isSearching && searchResults.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start Your Visual Search
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload an image or take a photo to find similar products across the web
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    <Upload size={20} />
                    <span>Upload Image</span>
                  </button>
                  <button
                    onClick={startCamera}
                    className="flex items-center space-x-2 px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors"
                  >
                    <Camera size={20} />
                    <span>Use Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid/List */}
            {!isSearching && filteredResults.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredResults.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    {viewMode === 'grid' ? (
                      <div className="relative">
                        <ProductCard product={product} />
                        
                        {/* Similarity Badge */}
                        <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {Math.round(product.similarity)}% match
                        </div>
                        
                        {/* Source Badge */}
                        <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-full">
                          {product.source}
                        </div>
                        
                        {/* Selection Checkbox */}
                        <div className="absolute bottom-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-6">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full font-medium">
                                {Math.round(product.similarity)}% match
                              </span>
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                                {product.source}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                            <div className="flex items-center space-x-1">
                              <Star className="text-yellow-400 fill-current" size={16} />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {product.rating} ({product.reviews})
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              product.inStock 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => addToWishlist({
                                  productId: product.id,
                                  dateAdded: new Date(),
                                  priceHistory: [{ date: new Date(), price: product.price }],
                                  inStock: product.inStock
                                })}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                <Heart size={18} />
                              </button>
                              <button
                                onClick={() => addToCart({
                                  productId: product.id,
                                  quantity: 1,
                                  addedAt: new Date()
                                })}
                                disabled={!product.inStock}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                              >
                                <ShoppingCart size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isSearching && searchImage && filteredResults.length === 0 && searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Results Match Your Filters
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters or search with a different image
                </p>
                <button
                  onClick={() => {
                    setPriceRange([0, 1000]);
                    setSelectedBrands(new Set());
                    setMinRating(0);
                    setInStockOnly(false);
                  }}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && selectedProducts.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Product Comparison
                  </h3>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Product
                        </th>
                        {Array.from(selectedProducts).map((productId) => {
                          const product = searchResults.find(p => p.id === productId);
                          return product ? (
                            <th key={productId} className="text-center py-3 px-4 min-w-[200px]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                              />
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {product.name}
                              </p>
                            </th>
                          ) : null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {['price', 'rating', 'similarity', 'source', 'inStock'].map((field) => (
                        <tr key={field} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white capitalize">
                            {field === 'inStock' ? 'Availability' : field}
                          </td>
                          {Array.from(selectedProducts).map((productId) => {
                            const product = searchResults.find(p => p.id === productId);
                            if (!product) return null;
                            
                            let value;
                            switch (field) {
                              case 'price':
                                value = `$${product.price}`;
                                break;
                              case 'rating':
                                value = `${product.rating}★`;
                                break;
                              case 'similarity':
                                value = `${Math.round(product.similarity)}%`;
                                break;
                              case 'source':
                                value = product.source;
                                break;
                              case 'inStock':
                                value = product.inStock ? 'In Stock' : 'Out of Stock';
                                break;
                              default:
                                value = product[field as keyof Product];
                            }
                            
                            return (
                              <td key={productId} className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};