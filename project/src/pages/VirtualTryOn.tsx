import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  Share2, 
  Download, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Glasses,
  Shirt,
  Palette,
  Heart,
  ShoppingCart,
  Facebook,
  Twitter,
  Instagram,
  Link,
  Save,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';

interface TryOnResult {
  id: string;
  originalImage: string;
  overlayImage: string;
  productId: string;
  category: string;
  timestamp: Date;
}

export const VirtualTryOn: React.FC = () => {
  const { user, products, addToCart, addToWishlist } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<'eyewear' | 'apparel' | 'makeup'>('eyewear');
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [tryOnResults, setTryOnResults] = useState<TryOnResult[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const categories = [
    { id: 'eyewear', label: 'Eyewear', icon: Glasses, color: 'from-blue-500 to-cyan-500' },
    { id: 'apparel', label: 'Apparel', icon: Shirt, color: 'from-purple-500 to-pink-500' },
    { id: 'makeup', label: 'Makeup', icon: Palette, color: 'from-orange-500 to-red-500' },
  ];
  
  const categoryProducts = products.filter(p => {
    if (selectedCategory === 'eyewear') return p.category === 'Electronics' || p.tags.includes('eyewear');
    if (selectedCategory === 'apparel') return p.category === 'Fashion';
    if (selectedCategory === 'makeup') return p.tags.includes('makeup') || p.tags.includes('beauty');
    return false;
  });
  
  const styleSuggestions = products.filter(p => 
    selectedProduct && p.category === selectedProduct.category && p.id !== selectedProduct.id
  ).slice(0, 4);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setUploadedImage(imageData);
        setIsCapturing(true);
        
        setTimeout(() => {
          setIsCapturing(false);
          stopCamera();
        }, 500);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateTryOn = (product: Product) => {
    setSelectedProduct(product);
    
    if (uploadedImage) {
      const newResult: TryOnResult = {
        id: Date.now().toString(),
        originalImage: uploadedImage,
        overlayImage: product.image,
        productId: product.id,
        category: selectedCategory,
        timestamp: new Date(),
      };
      
      setTryOnResults(prev => [newResult, ...prev.slice(0, 4)]);
    }
  };

  const saveTryOnResult = () => {
    if (selectedProduct && uploadedImage) {
      // In a real app, this would save to user profile
      alert('Try-on result saved to your profile!');
    }
  };

  const shareToSocial = (platform: string) => {
    // In a real app, this would integrate with social media APIs
    const shareText = `Check out how I look in ${selectedProduct?.name} on RetailVerse! #VirtualTryOn #RetailVerse`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`);
        break;
      case 'instagram':
        alert('Instagram sharing would open the mobile app with the image');
        break;
      default:
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
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
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Virtual Try-On Studio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See how products look on you with our AI-powered virtual try-on technology
          </p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera/Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Photo
                  </h2>
                  <div className="flex space-x-2">
                    {!isUsingCamera && (
                      <button
                        onClick={startCamera}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                      >
                        <Camera size={18} />
                        <span>Use Camera</span>
                      </button>
                    )}
                    {isUsingCamera && (
                      <button
                        onClick={stopCamera}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <X size={18} />
                        <span>Stop Camera</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Camera View */}
                {isUsingCamera && (
                  <div className="relative mb-6">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-96 object-cover rounded-lg bg-gray-900"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* AR Overlay Simulation */}
                    {selectedProduct && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                          <img
                            src={selectedProduct.image}
                            alt="Try-on overlay"
                            className="w-32 h-32 object-contain opacity-70"
                            style={{
                              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
                              transform: selectedCategory === 'eyewear' ? 'translateY(-20px)' : 
                                        selectedCategory === 'makeup' ? 'translateY(-10px)' : 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                        <Camera className="text-white" size={24} />
                      </div>
                    </button>
                  </div>
                )}

                {/* Upload Area */}
                {!isUsingCamera && !uploadedImage && (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Upload your photo
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Drag and drop or click to select
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Uploaded Image with Try-On Overlay */}
                {uploadedImage && (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Your photo"
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    
                    {/* Try-On Overlay */}
                    {selectedProduct && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative"
                        >
                          <img
                            src={selectedProduct.image}
                            alt="Try-on overlay"
                            className="w-40 h-40 object-contain opacity-80"
                            style={{
                              filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))',
                              transform: selectedCategory === 'eyewear' ? 'translateY(-30px)' : 
                                        selectedCategory === 'makeup' ? 'translateY(-20px)' : 'none'
                            }}
                          />
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                      >
                        {showComparison ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Comparison View */}
                {showComparison && uploadedImage && selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 grid grid-cols-2 gap-4"
                  >
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Before</h3>
                      <img
                        src={uploadedImage}
                        alt="Before"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">After</h3>
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="After"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={selectedProduct.image}
                            alt="Overlay"
                            className="w-20 h-20 object-contain opacity-80"
                            style={{
                              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
                              transform: selectedCategory === 'eyewear' ? 'translateY(-15px)' : 
                                        selectedCategory === 'makeup' ? 'translateY(-10px)' : 'none'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                {uploadedImage && selectedProduct && (
                  <div className="flex justify-center space-x-4 mt-6">
                    <button
                      onClick={saveTryOnResult}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <Save size={18} />
                      <span>Save Result</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => addToCart({ productId: selectedProduct.id, quantity: 1, addedAt: new Date() })}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Products & Suggestions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Product Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Product to Try
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categoryProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => simulateTryOn(product)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedProduct?.id === product.id
                        ? 'bg-primary-100 dark:bg-primary-900/50 border-2 border-primary-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.price}
                      </p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Sparkles className="text-primary-500" size={20} />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Style Suggestions */}
            {styleSuggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Style Suggestions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {styleSuggestions.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => simulateTryOn(product)}
                      className="cursor-pointer group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-24 object-cover rounded-lg group-hover:shadow-lg transition-shadow"
                      />
                      <p className="text-xs font-medium text-gray-900 dark:text-white mt-2 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ${product.price}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Try-Ons */}
            {tryOnResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Try-Ons
                </h3>
                <div className="space-y-3">
                  {tryOnResults.slice(0, 3).map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <img
                        src={result.originalImage}
                        alt="Try-on result"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.category} Try-On
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {result.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  Share Your Try-On
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
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Facebook size={20} />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center space-x-3 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  <Twitter size={20} />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => shareToSocial('instagram')}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
                >
                  <Instagram size={20} />
                  <span>Instagram</span>
                </button>
                <button
                  onClick={() => shareToSocial('link')}
                  className="flex items-center space-x-3 p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Link size={20} />
                  <span>Copy Link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Flash Effect */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};