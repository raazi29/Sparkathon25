import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, CartItem, WishlistItem, ChatMessage, Notification, SocialPost, Review } from '../types';

// Initialize theme from localStorage immediately to prevent flickering
const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem('retailverse-store');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.isDarkMode || false;
    }
  } catch (error) {
    console.warn('Failed to parse stored theme:', error);
  }
  
  return false;
};

// Apply initial theme immediately
if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  if (initialTheme) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
interface StoreState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Theme state
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Products state
  products: Product[];
  setProducts: (products: Product[]) => void;
  
  // Cart state
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  
  // Wishlist state
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  
  // Chat state
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  
  // Notifications state
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Social state
  socialPosts: SocialPost[];
  setSocialPosts: (posts: SocialPost[]) => void;
  likeSocialPost: (postId: string) => void;
  
  // Reviews state
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  
  // Visual search state
  visualSearchResults: any[];
  setVisualSearchResults: (results: any[]) => void;
  isVisualSearching: boolean;
  setIsVisualSearching: (searching: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // Theme state
      isDarkMode: getInitialTheme(),
      toggleDarkMode: () => set((state) => {
        const newTheme = !state.isDarkMode;
        
        // Apply theme immediately to prevent flickering
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        return { isDarkMode: newTheme };
      }),
      
      // Products state
      products: [],
      setProducts: (products) => set({ products }),
      
      // Cart state
      cartItems: [],
      addToCart: (item) => set((state) => {
        const existingItem = state.cartItems.find(
          (cartItem) => 
            cartItem.productId === item.productId &&
            cartItem.selectedSize === item.selectedSize &&
            cartItem.selectedColor === item.selectedColor
        );
        
        if (existingItem) {
          return {
            cartItems: state.cartItems.map((cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.selectedSize === item.selectedSize &&
              cartItem.selectedColor === item.selectedColor
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            )
          };
        }
        
        return { cartItems: [...state.cartItems, item] };
      }),
      
      removeFromCart: (productId, size, color) => set((state) => ({
        cartItems: state.cartItems.filter(
          (item) => 
            !(item.productId === productId &&
              item.selectedSize === size &&
              item.selectedColor === color)
        )
      })),
      
      updateCartItemQuantity: (productId, quantity, size, color) => set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.productId === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, quantity }
            : item
        )
      })),
      
      clearCart: () => set({ cartItems: [] }),
      
      // Wishlist state
      wishlistItems: [],
      addToWishlist: (item) => set((state) => {
        const exists = state.wishlistItems.find(w => w.productId === item.productId);
        if (exists) return state;
        return { wishlistItems: [...state.wishlistItems, item] };
      }),
      
      removeFromWishlist: (productId) => set((state) => ({
        wishlistItems: state.wishlistItems.filter(item => item.productId !== productId)
      })),
      
      // Chat state
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      
      clearChatHistory: () => set({ chatMessages: [] }),
      
      // Notifications state
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Social state
      socialPosts: [],
      setSocialPosts: (posts) => set({ socialPosts: posts }),
      likeSocialPost: (postId) => set((state) => ({
        socialPosts: state.socialPosts.map(post =>
          post.id === postId 
            ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      })),
      
      // Search state
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchHistory: [],
      addToSearchHistory: (query) => set((state) => {
        const filtered = state.searchHistory.filter(h => h !== query);
        return { searchHistory: [query, ...filtered].slice(0, 10) };
      }),
      
      // Visual search state
      visualSearchResults: [],
      setVisualSearchResults: (results) => set({ visualSearchResults: results }),
      isVisualSearching: false,
      setIsVisualSearching: (searching) => set({ isVisualSearching: searching }),
    }),
    {
      name: 'retailverse-store',
      partialize: (state) => ({
        user: state.user,
        isDarkMode: state.isDarkMode,
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
        searchHistory: state.searchHistory,
      }),
    }
  )
);