export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  loyaltyPoints: number;
  sustainabilityScore: number;
  preferences: string[];
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinDate: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  ecoRating: number;
  description: string;
  features: string[];
  brand: string;
  sizes?: string[];
  colors?: string[];
  tags: string[];
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  addedAt: Date;
}

export interface WishlistItem {
  productId: string;
  dateAdded: Date;
  priceHistory: Array<{date: Date, price: number}>;
  priceThreshold?: number;
  inStock: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  products?: Product[];
  suggestions?: string[];
  image?: string;
  orderStatus?: {
    status: string;
    estimatedDelivery: string;
    trackingNumber: string;
    updates: Array<{ date: string; status: string; location: string }>;
  };
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: Date;
  helpful: number;
  verified: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  tags: string[];
  products?: Product[];
  liked?: boolean;
}

export interface Notification {
  id: string;
  type: 'price_drop' | 'stock_alert' | 'reward' | 'social' | 'order';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}