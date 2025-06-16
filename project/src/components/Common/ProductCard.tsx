import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Eye, Leaf } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../store/useStore';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  showEcoRating?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default',
  showEcoRating = true 
}) => {
  const { addToCart, addToWishlist, wishlistItems } = useStore();
  
  const isInWishlist = wishlistItems.some(item => item.productId === product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      quantity: 1,
      addedAt: new Date(),
    });
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInWishlist) {
      addToWishlist({
        productId: product.id,
        dateAdded: new Date(),
        priceHistory: [{ date: new Date(), price: product.price }],
        inStock: product.inStock,
      });
    }
  };
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              New
            </span>
          )}
          {product.isTrending && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Trending
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{discountPercentage}%
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col space-y-2">
          <button
            onClick={handleAddToWishlist}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
          <button className="p-2 bg-white/80 backdrop-blur-md text-gray-700 rounded-full hover:bg-primary-500 hover:text-white transition-colors">
            <Eye size={16} />
          </button>
        </div>
        
        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {product.category}
          </span>
          {showEcoRating && product.ecoRating > 8 && (
            <div className="flex items-center space-x-1 text-green-500">
              <Leaf size={12} />
              <span className="text-xs font-medium">{product.ecoRating}/10</span>
            </div>
          )}
        </div>
        
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({product.reviews})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 dark:text-white">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          {product.stockCount < 10 && product.inStock && (
            <span className="text-xs text-orange-500 font-medium">
              Only {product.stockCount} left
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
            product.inStock
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
          <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </motion.div>
  );
};