import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  Eye, 
  ShoppingCart, 
  Heart, 
  Star, 
  Loader, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Shirt, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Target,
  Scan,
  Image as ImageIcon,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Filter,
  Grid,
  List,
  Search,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';

interface DetectedItem {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OutfitAnalysis {
  detectedItems: DetectedItem[];
  totalItems: number;
  confidence: number;
  style: string;
  occasion: string;
  colors: string[];
  suggestions: string[];
}

interface ProductCard {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  brand: string;
  url: string;
}

export const VisualOutfitScanner: React.FC = () => {
  const { products, addToCart, addToWishlist } = useStore();
  
  // State management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [detectedProducts, setDetectedProducts] = useState<ProductCard[]>([]);
  const [similarOutfits, setSimilarOutfits] = useState<ProductCard[]>([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Roboflow API configuration
  const ROBOFLOW_API_KEY = 'YOUR_API_KEY'; // Replace with actual API key
  const PROJECT_NAME = 'clothing-detection-model';
  const MODEL_VERSION = '1';
  const API_ENDPOINT = `https://detect.roboflow.com/${PROJECT_NAME}/${MODEL_VERSION}?api_key=${ROBOFLOW_API_KEY}`;

  // Clothing item mappings
  const clothingItemMappings: { [key: string]: string } = {
    'T-Shirt': 'T-Shirt',
    'Shirt': 'Shirt',
    'Dress': 'Dress',
    'Jeans': 'Jeans',
    'Pants': 'Pants',
    'Shorts': 'Shorts',
    'Skirt': 'Skirt',
    'Jacket': 'Jacket',
    'Sweater': 'Sweater',
    'Hoodie': 'Hoodie',
    'Coat': 'Coat',
    'Shoes': 'Shoes',
    'Sneakers': 'Sneakers',
    'Boots': 'Boots',
    'Hat': 'Hat',
    'Cap': 'Cap',
    'Bag': 'Bag',
    'Backpack': 'Backpack',
    'Watch': 'Watch',
    'Sunglasses': 'Sunglasses',
    'Belt': 'Belt',
    'Scarf': 'Scarf'
  };

  const analyzeOutfitWithRoboflow = async (imageFile: File): Promise<OutfitAnalysis> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.predictions || data.predictions.length === 0) {
        throw new Error('No clothing items detected in the image');
      }

      // Process predictions
      const detectedItems: DetectedItem[] = data.predictions.map((prediction: any) => ({
        class: prediction.class,
        confidence: prediction.confidence,
        x: prediction.x,
        y: prediction.y,
        width: prediction.width,
        height: prediction.height
      }));

      // Analyze style and occasion based on detected items
      const { style, occasion, colors } = analyzeStyleAndOccasion(detectedItems);
      
      return {
        detectedItems,
        totalItems: detectedItems.length,
        confidence: detectedItems.reduce((sum, item) => sum + item.confidence, 0) / detectedItems.length,
        style,
        occasion,
        colors,
        suggestions: generateSuggestions(detectedItems, style, occasion)
      };
    } catch (error) {
      console.error('Roboflow API error:', error);
      throw error;
    }
  };

  // Fallback analysis for demo purposes
  const simulateOutfitAnalysis = async (imageData: string): Promise<OutfitAnalysis> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock detected items
    const mockDetectedItems: DetectedItem[] = [
      { class: 'T-Shirt', confidence: 0.92, x: 150, y: 100, width: 120, height: 180 },
      { class: 'Jeans', confidence: 0.88, x: 140, y: 280, width: 140, height: 200 },
      { class: 'Sneakers', confidence: 0.85, x: 130, y: 480, width: 160, height: 80 }
    ];

    const { style, occasion, colors } = analyzeStyleAndOccasion(mockDetectedItems);

    return {
      detectedItems: mockDetectedItems,
      totalItems: mockDetectedItems.length,
      confidence: 0.88,
      style,
      occasion,
      colors,
      suggestions: generateSuggestions(mockDetectedItems, style, occasion)
    };
  };

  const analyzeStyleAndOccasion = (items: DetectedItem[]) => {
    const itemTypes = items.map(item => item.class.toLowerCase());
    
    // Determine style
    let style = 'Casual';
    if (itemTypes.includes('dress') || itemTypes.includes('suit')) {
      style = 'Formal';
    } else if (itemTypes.includes('hoodie') || itemTypes.includes('sneakers')) {
      style = 'Streetwear';
    } else if (itemTypes.includes('jacket') && itemTypes.includes('jeans')) {
      style = 'Smart Casual';
    }

    // Determine occasion
    let occasion = 'Everyday';
    if (style === 'Formal') {
      occasion = 'Business/Formal';
    } else if (itemTypes.includes('shorts') || itemTypes.includes('t-shirt')) {
      occasion = 'Casual/Weekend';
    } else if (itemTypes.includes('coat') || itemTypes.includes('boots')) {
      occasion = 'Outdoor/Weather';
    }

    // Mock colors (in real implementation, this would come from image analysis)
    const colors = ['Navy Blue', 'White', 'Black', 'Denim Blue'];

    return { style, occasion, colors };
  };

  const generateSuggestions = (items: DetectedItem[], style: string, occasion: string): string[] => {
    const suggestions = [];
    const itemTypes = items.map(item => item.class.toLowerCase());

    if (!itemTypes.includes('shoes')) {
      suggestions.push('Add matching shoes to complete the look');
    }
    if (!itemTypes.includes('bag') && !itemTypes.includes('backpack')) {
      suggestions.push('Consider adding a bag or accessory');
    }
    if (style === 'Casual' && !itemTypes.includes('jacket')) {
      suggestions.push('A light jacket would enhance this casual outfit');
    }
    if (!itemTypes.includes('watch') && !itemTypes.includes('jewelry')) {
      suggestions.push('Accessories like a watch could elevate the style');
    }

    suggestions.push(`Perfect for ${occasion.toLowerCase()} occasions`);
    suggestions.push(`This ${style.toLowerCase()} style is trending this season`);

    return suggestions;
  };

  const generateMockProducts = (detectedItems: DetectedItem[]): ProductCard[] => {
    const mockProducts: ProductCard[] = [];
    
    detectedItems.forEach((item, index) => {
      const basePrice = Math.floor(Math.random() * 200) + 30;
      const hasDiscount = Math.random() > 0.7;
      
      mockProducts.push({
        id: `detected-${index}`,
        name: `${item.class} - ${['Premium', 'Classic', 'Modern', 'Trendy'][Math.floor(Math.random() * 4)]} Style`,
        price: hasDiscount ? Math.floor(basePrice * 0.8) : basePrice,
        originalPrice: hasDiscount ? basePrice : undefined,
        image: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviews: Math.floor(Math.random() * 500) + 50,
        category: item.class,
        inStock: Math.random() > 0.1,
        brand: ['StyleCo', 'FashionHub', 'TrendWear', 'UrbanStyle'][Math.floor(Math.random() * 4)],
        url: `https://retailverse.com/product/detected-${index}`
      });
    });

    return mockProducts;
  };

  const generateSimilarOutfits = (style: string, occasion: string): ProductCard[] => {
    const similarProducts: ProductCard[] = [];
    
    for (let i = 0; i < 8; i++) {
      const basePrice = Math.floor(Math.random() * 300) + 50;
      const hasDiscount = Math.random() > 0.6;
      
      similarProducts.push({
        id: `similar-${i}`,
        name: `${style} ${occasion} Outfit ${i + 1}`,
        price: hasDiscount ? Math.floor(basePrice * 0.85) : basePrice,
        originalPrice: hasDiscount ? basePrice : undefined,
        image: `https://images.pexels.com/photos/${2000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${2000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        reviews: Math.floor(Math.random() * 300) + 25,
        category: 'Complete Outfit',
        inStock: Math.random() > 0.05,
        brand: ['OutfitPro', 'StyleSet', 'LookBook', 'FashionForward'][Math.floor(Math.random() * 4)],
        url: `https://retailverse.com/outfit/similar-${i}`
      });
    }

    return similarProducts;
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);
      setIsAnalyzing(true);
      setShowError(false);
      setAnalysis(null);

      try {
        let analysisResult: OutfitAnalysis;
        
        if (ROBOFLOW_API_KEY !== 'YOUR_API_KEY') {
          // Use real Roboflow API
          analysisResult = await analyzeOutfitWithRoboflow(file);
        } else {
          // Use simulation for demo
          analysisResult = await simulateOutfitAnalysis(imageData);
        }

        setAnalysis(analysisResult);
        
        // Generate product recommendations
        const products = generateMockProducts(analysisResult.detectedItems);
        setDetectedProducts(products);
        
        // Generate similar outfits
        const similar = generateSimilarOutfits(analysisResult.style, analysisResult.occasion);
        setSimilarOutfits(similar);
        
        showSuccessToast('Outfit analysis completed successfully!');
      } catch (error) {
        console.error('Analysis error:', error);
        showErrorToast(error instanceof Error ? error.message : 'Failed to analyze outfit. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
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
      showErrorToast('Unable to access camera. Please check permissions.');
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
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            await handleImageUpload(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const showErrorToast = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  const showSuccessToast = (message: string) => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const nextCarouselSlide = () => {
    setCurrentCarouselIndex((prev) => 
      prev + 4 >= similarOutfits.length ? 0 : prev + 4
    );
  };

  const prevCarouselSlide = () => {
    setCurrentCarouselIndex((prev) => 
      prev - 4 < 0 ? Math.max(0, similarOutfits.length - 4) : prev - 4
    );
  };

  const addToCartHandler = (product: ProductCard) => {
    addToCart({
      productId: product.id,
      quantity: 1,
      addedAt: new Date()
    });
    showSuccessToast(`${product.name} added to cart!`);
  };

  const addToWishlistHandler = (product: ProductCard) => {
    addToWishlist({
      productId: product.id,
      dateAdded: new Date(),
      priceHistory: [{ date: new Date(), price: product.price }],
      inStock: product.inStock
    });
    showSuccessToast(`${product.name} added to wishlist!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Scan className="text-cyan-400 mr-3" size={40} />
            Visual Outfit Scanner
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload an image to detect outfit items and discover similar products with AI-powered analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <ImageIcon className="text-cyan-400 mr-2" size={24} />
                Upload Outfit Image
              </h2>
              
              {!isUsingCamera && !uploadedImage && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-cyan-400/50 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium mb-2">
                    Drop your image here
                  </p>
                  <p className="text-gray-300 text-sm">
                    or click to browse
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

              {!isUsingCamera && !uploadedImage && (
                <div className="mt-4">
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all transform hover:scale-105"
                  >
                    <Camera size={20} />
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
                    className="w-full h-64 object-cover rounded-xl bg-gray-900"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex space-x-2">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all"
                    >
                      <Camera size={18} />
                      <span>Capture</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              {uploadedImage && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded outfit"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    
                    {/* Analysis Overlay */}
                    {analysis && (
                      <div className="absolute inset-0 rounded-xl">
                        {analysis.detectedItems.map((item, index) => (
                          <div
                            key={index}
                            className="absolute border-2 border-cyan-400 bg-cyan-400/20 backdrop-blur-sm rounded"
                            style={{
                              left: `${(item.x - item.width/2) / 4}px`,
                              top: `${(item.y - item.height/2) / 4}px`,
                              width: `${item.width / 4}px`,
                              height: `${item.height / 4}px`
                            }}
                          >
                            <div className="absolute -top-6 left-0 bg-cyan-400 text-black text-xs px-2 py-1 rounded">
                              {item.class} ({Math.round(item.confidence * 100)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                          <Loader className="animate-spin text-cyan-400 mx-auto mb-2" size={32} />
                          <p className="text-white text-sm">Analyzing outfit...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setAnalysis(null);
                      setDetectedProducts([]);
                      setSimilarOutfits([]);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                  >
                    <RefreshCw size={18} />
                    <span>Upload New Image</span>
                  </button>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <Target className="text-cyan-400 mr-2" size={18} />
                      Analysis Results
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Items Detected:</span>
                        <span className="text-white font-medium">{analysis.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Confidence:</span>
                        <span className="text-cyan-400 font-medium">{Math.round(analysis.confidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Style:</span>
                        <span className="text-white font-medium">{analysis.style}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Occasion:</span>
                        <span className="text-white font-medium">{analysis.occasion}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
                      className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
                    >
                      <Eye size={14} className="mr-1" />
                      {showAnalysisDetails ? 'Hide' : 'Show'} Details
                    </button>
                    
                    <AnimatePresence>
                      {showAnalysisDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 space-y-2"
                        >
                          <div>
                            <p className="text-gray-300 text-xs mb-1">Detected Items:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.detectedItems.map((item, index) => (
                                <span
                                  key={index}
                                  className="bg-cyan-400/20 text-cyan-300 text-xs px-2 py-1 rounded-full"
                                >
                                  {item.class}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-gray-300 text-xs mb-1">Suggestions:</p>
                            <div className="space-y-1">
                              {analysis.suggestions.map((suggestion, index) => (
                                <p key={index} className="text-gray-300 text-xs">
                                  • {suggestion}
                                </p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Detected Products */}
            {detectedProducts.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Shirt className="text-cyan-400 mr-2" size={24} />
                    Detected Outfit Items
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-white/10 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-400 text-black' : 'text-gray-300'}`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-cyan-400 text-black' : 'text-gray-300'}`}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                  : 'space-y-4'
                }>
                  {detectedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all group"
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-white mb-2 line-clamp-2">
                              {product.name}
                            </h4>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={`${
                                      i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-300 text-xs">
                                ({product.reviews})
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-bold">
                                  ${product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-gray-400 line-through text-sm">
                                    ${product.originalPrice}
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                product.inStock 
                                  ? 'bg-green-400/20 text-green-300' 
                                  : 'bg-red-400/20 text-red-300'
                              }`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => addToCartHandler(product)}
                                disabled={!product.inStock}
                                className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg text-sm transition-all"
                              >
                                <ShoppingCart size={14} />
                                <span>Add to Cart</span>
                              </button>
                              <button
                                onClick={() => addToWishlistHandler(product)}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                              >
                                <Heart size={14} />
                              </button>
                              <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center p-4 space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={`${
                                      i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-300 text-xs">
                                ({product.reviews})
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-bold">
                                  ${product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-gray-400 line-through text-sm">
                                    ${product.originalPrice}
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => addToCartHandler(product)}
                                  disabled={!product.inStock}
                                  className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded text-sm transition-all"
                                >
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => addToWishlistHandler(product)}
                                  className="p-1 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
                                >
                                  <Heart size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Outfits Carousel */}
            {similarOutfits.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <TrendingUp className="text-cyan-400 mr-2" size={24} />
                    Similar Outfits
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevCarouselSlide}
                      className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextCarouselSlide}
                      className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <motion.div
                    className="flex space-x-4"
                    animate={{ x: -currentCarouselIndex * 280 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {similarOutfits.map((outfit) => (
                      <motion.div
                        key={outfit.id}
                        className="flex-shrink-0 w-64 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all group"
                      >
                        <img
                          src={outfit.image}
                          alt={outfit.name}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-white mb-2 line-clamp-2">
                            {outfit.name}
                          </h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={`${
                                    i < Math.floor(outfit.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-300 text-xs">
                              ({outfit.reviews})
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-bold">
                                ${outfit.price}
                              </span>
                              {outfit.originalPrice && (
                                <span className="text-gray-400 line-through text-sm">
                                  ${outfit.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => addToCartHandler(outfit)}
                              className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm transition-all"
                            >
                              <ShoppingCart size={14} />
                              <span>Add</span>
                            </button>
                            <a
                              href={outfit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            )}

            {/* No Results State */}
            {!isAnalyzing && uploadedImage && !analysis && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
                <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Outfits Detected
                </h3>
                <p className="text-gray-300 mb-6">
                  We couldn't detect any clothing items in this image. Please try uploading a clearer image with visible outfit items.
                </p>
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setAnalysis(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all"
                >
                  Try Another Image
                </button>
              </div>
            )}

            {/* Getting Started State */}
            {!uploadedImage && !isUsingCamera && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
                <Sparkles className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ready to Analyze Your Outfit?
                </h3>
                <p className="text-gray-300 mb-6">
                  Upload an image or take a photo to get started with AI-powered outfit analysis and product recommendations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="text-cyan-400" size={24} />
                    </div>
                    <p className="text-white text-sm">Upload Image</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="text-cyan-400" size={24} />
                    </div>
                    <p className="text-white text-sm">AI Analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShoppingCart className="text-cyan-400" size={24} />
                    </div>
                    <p className="text-white text-sm">Shop Products</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          </motion.div>
        )}
        
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Analysis completed successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};