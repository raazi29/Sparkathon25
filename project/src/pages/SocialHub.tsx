import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Camera,
  Upload,
  Filter,
  TrendingUp,
  Award,
  Users,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  Plus,
  Search,
  Settings,
  Crown,
  Star,
  Zap,
  Target,
  Calendar,
  MapPin,
  Link,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Flag,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Video,
  Smile,
  Hash,
  AtSign,
  Globe,
  Lock,
  CheckCircle,
  Clock,
  Flame,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';

interface SocialUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  location?: string;
  website?: string;
  joinDate: Date;
  isFollowing?: boolean;
  badges: string[];
}

interface SocialPost {
  id: string;
  user: SocialUser;
  content: string;
  images: string[];
  products?: Product[];
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  timestamp: Date;
  liked: boolean;
  bookmarked: boolean;
  tags: string[];
  location?: string;
  type: 'outfit' | 'review' | 'haul' | 'style-tip' | 'challenge';
  challenge?: {
    id: string;
    title: string;
    hashtag: string;
  };
}

interface StylePoll {
  id: string;
  user: SocialUser;
  question: string;
  options: Array<{
    id: string;
    text: string;
    image: string;
    votes: number;
  }>;
  totalVotes: number;
  timestamp: Date;
  userVote?: string;
  expiresAt: Date;
}

interface StyleChallenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  prize: string;
  rules: string[];
  featured: boolean;
  image: string;
  posts: SocialPost[];
}

interface Comment {
  id: string;
  user: SocialUser;
  content: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

export const SocialHub: React.FC = () => {
  const { user, products } = useStore();
  
  // State management
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'challenges' | 'polls'>('feed');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [polls, setPolls] = useState<StylePoll[]>([]);
  const [challenges, setChallenges] = useState<StyleChallenge[]>([]);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [selectedUser, setSelectedUser] = useState<SocialUser | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'outfit' | 'review' | 'haul' | 'style-tip'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Create post state
  const [newPost, setNewPost] = useState({
    content: '',
    images: [] as string[],
    products: [] as Product[],
    type: 'outfit' as SocialPost['type'],
    location: '',
    tags: [] as string[]
  });
  
  const feedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock users
    const mockUsers: SocialUser[] = [
      {
        id: '1',
        username: 'fashionista_emma',
        displayName: 'Emma Style',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bio: 'Fashion enthusiast | Sustainable style advocate | NYC 🌟',
        followers: 15420,
        following: 892,
        posts: 234,
        verified: true,
        location: 'New York, NY',
        website: 'emmastyle.com',
        joinDate: new Date('2023-01-15'),
        badges: ['Trendsetter', 'Eco Warrior']
      },
      {
        id: '2',
        username: 'style_maven_alex',
        displayName: 'Alex Chen',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bio: 'Minimalist wardrobe | Capsule collection expert | Less is more ✨',
        followers: 8930,
        following: 445,
        posts: 156,
        verified: false,
        location: 'San Francisco, CA',
        joinDate: new Date('2023-03-20'),
        badges: ['Minimalist Master']
      },
      {
        id: '3',
        username: 'vintage_vibes_sarah',
        displayName: 'Sarah Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bio: 'Vintage collector | Thrift finds | Sustainable fashion lover 🌿',
        followers: 12340,
        following: 678,
        posts: 189,
        verified: true,
        location: 'Austin, TX',
        joinDate: new Date('2022-11-10'),
        badges: ['Vintage Expert', 'Thrift Queen']
      }
    ];

    // Mock posts
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        user: mockUsers[0],
        content: 'Loving this sustainable outfit combo! 🌱 The organic cotton tee paired with these recycled denim jeans creates the perfect casual-chic look. What do you think? #SustainableFashion #OOTD',
        images: [
          'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        products: products.slice(0, 2),
        likes: 342,
        comments: 28,
        shares: 15,
        bookmarks: 67,
        timestamp: new Date('2024-01-20T14:30:00'),
        liked: false,
        bookmarked: true,
        tags: ['sustainable', 'ootd', 'casual'],
        type: 'outfit'
      },
      {
        id: '2',
        user: mockUsers[1],
        content: 'Minimalist capsule wardrobe essentials ✨ These 5 pieces can create 20+ different outfits! Swipe to see the combinations. #MinimalistStyle #CapsuleWardrobe',
        images: [
          'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        products: products.slice(2, 4),
        likes: 189,
        comments: 45,
        shares: 32,
        bookmarks: 89,
        timestamp: new Date('2024-01-19T16:45:00'),
        liked: true,
        bookmarked: false,
        tags: ['minimalist', 'capsule', 'essentials'],
        type: 'style-tip'
      },
      {
        id: '3',
        user: mockUsers[2],
        content: 'Thrift haul from this weekend! 🛍️ Found these amazing vintage pieces for under $50 total. The power of sustainable shopping! #ThriftHaul #VintageFinds',
        images: [
          'https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        likes: 256,
        comments: 67,
        shares: 23,
        bookmarks: 45,
        timestamp: new Date('2024-01-18T12:20:00'),
        liked: false,
        bookmarked: false,
        tags: ['thrift', 'vintage', 'haul'],
        type: 'haul'
      }
    ];

    // Mock polls
    const mockPolls: StylePoll[] = [
      {
        id: '1',
        user: mockUsers[0],
        question: 'Which outfit would you wear for a first date?',
        options: [
          {
            id: 'a',
            text: 'Casual chic dress',
            image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=200',
            votes: 145
          },
          {
            id: 'b',
            text: 'Smart casual blazer',
            image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=200',
            votes: 89
          }
        ],
        totalVotes: 234,
        timestamp: new Date('2024-01-20T10:00:00'),
        expiresAt: new Date('2024-01-22T10:00:00')
      }
    ];

    // Mock challenges
    const mockChallenges: StyleChallenge[] = [
      {
        id: '1',
        title: '30-Day Sustainable Style Challenge',
        description: 'Create outfits using only sustainable and eco-friendly pieces for 30 days',
        hashtag: '#SustainableStyle30',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        participants: 1250,
        prize: '$500 sustainable fashion voucher',
        rules: [
          'Use only sustainable/eco-friendly clothing items',
          'Post daily outfit photos with the hashtag',
          'Include sustainability details in your caption',
          'Engage with other participants'
        ],
        featured: true,
        image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
        posts: mockPosts.slice(0, 1)
      }
    ];

    setPosts(mockPosts);
    setPolls(mockPolls);
    setChallenges(mockChallenges);

    // Initialize comments
    const mockComments: Record<string, Comment[]> = {
      '1': [
        {
          id: '1',
          user: mockUsers[1],
          content: 'Love this sustainable approach! Where did you get the jeans?',
          timestamp: new Date('2024-01-20T15:00:00'),
          likes: 12,
          liked: false
        },
        {
          id: '2',
          user: mockUsers[2],
          content: 'Such a cute combo! The colors work so well together 💚',
          timestamp: new Date('2024-01-20T15:30:00'),
          likes: 8,
          liked: true
        }
      ]
    };
    setComments(mockComments);
  };

  // Infinite scroll
  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch more posts
      setIsLoading(false);
      // For demo, we'll just stop loading after first load
      setHasMore(false);
    }, 1000);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          loadMorePosts();
        }
      }
    };

    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll);
      return () => feedElement.removeEventListener('scroll', handleScroll);
    }
  }, [loadMorePosts]);

  // Post interactions
  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            bookmarked: !post.bookmarked,
            bookmarks: post.bookmarked ? post.bookmarks - 1 : post.bookmarks + 1
          }
        : post
    ));
  };

  const addComment = (postId: string) => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'current',
        username: user?.name.toLowerCase().replace(' ', '_') || 'user',
        displayName: user?.name || 'Current User',
        avatar: user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bio: '',
        followers: 0,
        following: 0,
        posts: 0,
        verified: false,
        joinDate: new Date(),
        badges: []
      },
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      liked: false
    };
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }));
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
    
    setNewComment('');
  };

  const voteInPoll = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(option => ({
          ...option,
          votes: option.id === optionId ? option.votes + 1 : option.votes
        }));
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          userVote: optionId
        };
      }
      return poll;
    }));
  };

  const followUser = (userId: string) => {
    // In a real app, this would make an API call
    console.log(`Following user ${userId}`);
  };

  const sharePost = (platform: string, postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const shareText = `Check out this amazing post by @${post.user.username} on RetailVerse! ${post.content.slice(0, 100)}...`;
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'instagram':
        alert('Instagram sharing would open the mobile app');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareModal(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setNewPost(prev => ({
          ...prev,
          images: [...prev.images, imageData]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const createPost = () => {
    if (!newPost.content.trim() && newPost.images.length === 0) return;
    
    const post: SocialPost = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'current',
        username: user?.name.toLowerCase().replace(' ', '_') || 'user',
        displayName: user?.name || 'Current User',
        avatar: user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bio: '',
        followers: 0,
        following: 0,
        posts: 0,
        verified: false,
        joinDate: new Date(),
        badges: []
      },
      content: newPost.content,
      images: newPost.images,
      products: newPost.products,
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      timestamp: new Date(),
      liked: false,
      bookmarked: false,
      tags: newPost.tags,
      location: newPost.location,
      type: newPost.type
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost({
      content: '',
      images: [],
      products: [],
      type: 'outfit',
      location: '',
      tags: []
    });
    setShowCreatePost(false);
  };

  const filteredPosts = posts.filter(post => {
    if (filterType !== 'all' && post.type !== filterType) return false;
    if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Users className="text-primary-500 mr-3" size={40} />
                Social Shopping Hub
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Connect, share, and discover amazing styles with the community
              </p>
            </div>
            
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Create Post</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg">
            {[
              { id: 'feed', label: 'Feed', icon: Globe },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'challenges', label: 'Challenges', icon: Target },
              { id: 'polls', label: 'Polls', icon: ThumbsUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Search & Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search posts, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Posts</option>
                    <option value="outfit">Outfits</option>
                    <option value="review">Reviews</option>
                    <option value="haul">Hauls</option>
                    <option value="style-tip">Style Tips</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Hash className="mr-2" size={20} />
                Trending Hashtags
              </h3>
              <div className="space-y-2">
                {['#OOTD', '#SustainableFashion', '#ThriftFinds', '#MinimalistStyle', '#VintageVibes'].map((hashtag, index) => (
                  <div key={hashtag} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">{hashtag}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor(Math.random() * 1000) + 100}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserPlus className="mr-2" size={20} />
                Suggested for You
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Style Guru Maya', username: '@maya_styles', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
                  { name: 'Fashion Forward', username: '@fashion_fwd', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
                  { name: 'Eco Style Queen', username: '@eco_queen', avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }
                ].map((suggestedUser) => (
                  <div key={suggestedUser.username} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={suggestedUser.avatar}
                        alt={suggestedUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {suggestedUser.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {suggestedUser.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => followUser(suggestedUser.username)}
                      className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Follow
                    </button>
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
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                  ref={feedRef}
                  style={{ maxHeight: '80vh', overflowY: 'auto' }}
                >
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Post Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={post.user.avatar}
                              alt={post.user.displayName}
                              className="w-12 h-12 rounded-full object-cover cursor-pointer"
                              onClick={() => setSelectedUser(post.user)}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-500">
                                  {post.user.displayName}
                                </h3>
                                {post.user.verified && (
                                  <CheckCircle className="text-blue-500" size={16} />
                                )}
                                {post.user.badges.map((badge) => (
                                  <span key={badge} className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                                    {badge}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>@{post.user.username}</span>
                                <span>•</span>
                                <span>{post.timestamp.toLocaleDateString()}</span>
                                {post.location && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center space-x-1">
                                      <MapPin size={12} />
                                      <span>{post.location}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              post.type === 'outfit' ? 'bg-purple-100 text-purple-700' :
                              post.type === 'review' ? 'bg-blue-100 text-blue-700' :
                              post.type === 'haul' ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {post.type.replace('-', ' ')}
                            </span>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Post Content */}
                        <p className="text-gray-900 dark:text-white mb-4 leading-relaxed">
                          {post.content}
                        </p>
                        
                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <span key={tag} className="text-primary-600 dark:text-primary-400 text-sm hover:underline cursor-pointer">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Post Images */}
                      {post.images.length > 0 && (
                        <div className={`grid gap-2 px-6 mb-4 ${
                          post.images.length === 1 ? 'grid-cols-1' :
                          post.images.length === 2 ? 'grid-cols-2' :
                          'grid-cols-2'
                        }`}>
                          {post.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedPost(post)}
                              />
                              {index === 3 && post.images.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                  <span className="text-white font-semibold text-lg">
                                    +{post.images.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Tagged Products */}
                      {post.products && post.products.length > 0 && (
                        <div className="px-6 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <Bookmark className="mr-2" size={16} />
                            Tagged Products
                          </h4>
                          <div className="flex space-x-3 overflow-x-auto pb-2">
                            {post.products.map((product) => (
                              <div key={product.id} className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-w-[200px]">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                      ${product.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Post Actions */}
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={() => toggleLike(post.id)}
                              className={`flex items-center space-x-2 transition-colors ${
                                post.liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
                              <span className="font-medium">{post.likes}</span>
                            </button>
                            
                            <button
                              onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                            >
                              <MessageCircle size={20} />
                              <span className="font-medium">{post.comments}</span>
                            </button>
                            
                            <button
                              onClick={() => setShowShareModal(post.id)}
                              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
                            >
                              <Share2 size={20} />
                              <span className="font-medium">{post.shares}</span>
                            </button>
                          </div>
                          
                          <button
                            onClick={() => toggleBookmark(post.id)}
                            className={`transition-colors ${
                              post.bookmarked ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Bookmark size={20} fill={post.bookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        
                        {/* Comments Section */}
                        <AnimatePresence>
                          {showComments === post.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              {/* Existing Comments */}
                              {comments[post.id]?.map((comment) => (
                                <div key={comment.id} className="flex space-x-3">
                                  <img
                                    src={comment.user.avatar}
                                    alt={comment.user.displayName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                          {comment.user.displayName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {comment.timestamp.toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-gray-900 dark:text-white text-sm">
                                        {comment.content}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-2">
                                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                                        Like ({comment.likes})
                                      </button>
                                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add Comment */}
                              <div className="flex space-x-3">
                                <img
                                  src={user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                                  alt="Your avatar"
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1 flex space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                  />
                                  <button
                                    onClick={() => addComment(post.id)}
                                    disabled={!newComment.trim()}
                                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                                  >
                                    <Send size={16} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'polls' && (
                <motion.div
                  key="polls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {polls.map((poll) => (
                    <div key={poll.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={poll.user.avatar}
                          alt={poll.user.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {poll.user.displayName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {poll.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {poll.question}
                      </h4>
                      
                      <div className="space-y-3 mb-4">
                        {poll.options.map((option) => {
                          const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                          const isSelected = poll.userVote === option.id;
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => !poll.userVote && voteInPoll(poll.id, option.id)}
                              disabled={!!poll.userVote}
                              className={`w-full p-4 rounded-lg border-2 transition-all ${
                                isSelected 
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                  : poll.userVote 
                                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <img
                                  src={option.image}
                                  alt={option.text}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {option.text}
                                  </p>
                                  {poll.userVote && (
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <span>{percentage.toFixed(1)}%</span>
                                        <span>{option.votes} votes</span>
                                      </div>
                                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <div
                                          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{poll.totalVotes} total votes</span>
                        <span>Expires {poll.expiresAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'challenges' && (
                <motion.div
                  key="challenges"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                      <div className="relative">
                        <img
                          src={challenge.image}
                          alt={challenge.title}
                          className="w-full h-48 object-cover"
                        />
                        {challenge.featured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Crown size={16} className="mr-1" />
                            Featured
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {challenge.hashtag}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {challenge.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {challenge.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary-500">
                              {challenge.participants.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              participants
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Start Date</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {challenge.startDate.toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">End Date</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {challenge.endDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Prize</div>
                          <div className="font-medium text-green-600 dark:text-green-400 flex items-center">
                            <Award size={16} className="mr-2" />
                            {challenge.prize}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rules</div>
                          <ul className="space-y-1">
                            {challenge.rules.map((rule, index) => (
                              <li key={index} className="text-sm text-gray-900 dark:text-white flex items-start">
                                <span className="text-primary-500 mr-2">•</span>
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                            Join Challenge
                          </button>
                          <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            View Posts
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'trending' && (
                <motion.div
                  key="trending"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Flame className="text-orange-500 mr-2" size={24} />
                      Trending Now
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPosts.slice(0, 6).map((post, index) => (
                        <div key={post.id} className="relative group cursor-pointer">
                          <div className="aspect-square rounded-lg overflow-hidden">
                            <img
                              src={post.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt="Trending post"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            #{index + 1} Trending
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <img
                                src={post.user.avatar}
                                alt={post.user.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-white text-sm font-medium">
                                @{post.user.username}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-white text-sm">
                              <div className="flex items-center space-x-1">
                                <Heart size={14} />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle size={14} />
                                <span>{post.comments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Post
                  </h3>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Post Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Type
                  </label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="outfit">Outfit</option>
                    <option value="review">Review</option>
                    <option value="haul">Haul</option>
                    <option value="style-tip">Style Tip</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="What's on your mind? Share your style story..."
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images
                  </label>
                  <div className="space-y-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors flex flex-col items-center"
                    >
                      <ImageIcon className="text-gray-400 mb-2" size={32} />
                      <span className="text-gray-600 dark:text-gray-400">Click to upload images</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {newPost.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {newPost.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setNewPost(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPost.location}
                    onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add location..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    disabled={!newPost.content.trim() && newPost.images.length === 0}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(null)}
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
                  Share Post
                </h3>
                <button
                  onClick={() => setShowShareModal(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => sharePost('facebook', showShareModal)}
                  className="flex items-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Facebook size={20} />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => sharePost('twitter', showShareModal)}
                  className="flex items-center space-x-3 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  <Twitter size={20} />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => sharePost('instagram', showShareModal)}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
                >
                  <Instagram size={20} />
                  <span>Instagram</span>
                </button>
                <button
                  onClick={() => sharePost('copy', showShareModal)}
                  className="flex items-center space-x-3 p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Copy size={20} />
                  <span>Copy Link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
                <div className="absolute -bottom-12 left-6">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.displayName}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                </div>
              </div>

              <div className="pt-16 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedUser.displayName}
                      </h2>
                      {selectedUser.verified && (
                        <CheckCircle className="text-blue-500" size={20} />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                    {selectedUser.location && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin size={14} />
                        <span>{selectedUser.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => followUser(selectedUser.id)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    {selectedUser.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>

                <p className="text-gray-900 dark:text-white mb-4">{selectedUser.bio}</p>

                {selectedUser.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedUser.badges.map((badge) => (
                      <span key={badge} className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.posts}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.following.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                </div>

                {selectedUser.website && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={`https://${selectedUser.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <Link size={16} />
                      <span>{selectedUser.website}</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};