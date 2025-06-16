import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  MessageCircle,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Heart,
  Frown,
  Meh,
  Smile
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SentimentData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

interface ReviewSentiment {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: Date;
  helpful: number;
  responded: boolean;
  category: string;
  keywords: string[];
}

interface ComplaintCompliment {
  id: string;
  type: 'complaint' | 'compliment';
  text: string;
  count: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

interface AdminResponse {
  reviewId: string;
  response: string;
  timestamp: Date;
  adminName: string;
}

export const SentimentDashboard: React.FC = () => {
  const { user, reviews, setReviews, addReview } = useStore();
  
  // State management
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    category: 'general',
    comment: '',
    anonymous: false
  });
  
  // Mock data
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [reviewSentiments, setReviewSentiments] = useState<ReviewSentiment[]>([]);
  const [complaintsCompliments, setComplaintsCompliments] = useState<ComplaintCompliment[]>([]);
  const [adminResponses, setAdminResponses] = useState<AdminResponse[]>([]);

  // Initialize mock data
  useEffect(() => {
    // Generate sentiment trend data
    const generateSentimentData = () => {
      const data: SentimentData[] = [];
      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 365;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const positive = Math.floor(Math.random() * 50) + 30;
        const negative = Math.floor(Math.random() * 20) + 5;
        const neutral = Math.floor(Math.random() * 30) + 10;
        
        data.push({
          date: date.toISOString().split('T')[0],
          positive,
          negative,
          neutral,
          total: positive + negative + neutral
        });
      }
      return data;
    };

    // Generate review sentiments
    const generateReviewSentiments = () => {
      const sentiments: ReviewSentiment[] = [
        {
          id: '1',
          productId: '1',
          productName: 'Eco-Friendly Wireless Headphones',
          customerName: 'Sarah Johnson',
          customerAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          rating: 5,
          comment: 'Absolutely love these headphones! The sound quality is incredible and the eco-friendly materials make me feel good about my purchase. Battery life is amazing too!',
          sentiment: 'positive',
          confidence: 0.95,
          timestamp: new Date('2024-01-20T10:30:00'),
          helpful: 12,
          responded: false,
          category: 'Electronics',
          keywords: ['sound quality', 'eco-friendly', 'battery life', 'amazing']
        },
        {
          id: '2',
          productId: '2',
          productName: 'Sustainable Cotton T-Shirt',
          customerName: 'Mike Chen',
          customerAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          rating: 2,
          comment: 'The shirt arrived with a stain and the fabric feels cheaper than expected. Very disappointed with the quality for the price.',
          sentiment: 'negative',
          confidence: 0.87,
          timestamp: new Date('2024-01-19T15:45:00'),
          helpful: 8,
          responded: true,
          category: 'Fashion',
          keywords: ['stain', 'cheap', 'disappointed', 'quality', 'price']
        },
        {
          id: '3',
          productId: '3',
          productName: 'Smart Home Security Camera',
          customerName: 'Emily Rodriguez',
          customerAvatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          rating: 4,
          comment: 'Good camera overall. Setup was easy and video quality is decent. Could use better night vision though.',
          sentiment: 'neutral',
          confidence: 0.72,
          timestamp: new Date('2024-01-18T09:20:00'),
          helpful: 5,
          responded: false,
          category: 'Electronics',
          keywords: ['good', 'easy setup', 'decent', 'night vision']
        }
      ];
      return sentiments;
    };

    // Generate complaints and compliments
    const generateComplaintsCompliments = () => {
      const data: ComplaintCompliment[] = [
        { id: '1', type: 'complaint', text: 'Slow shipping times', count: 23, category: 'Shipping', trend: 'up' },
        { id: '2', type: 'complaint', text: 'Product quality issues', count: 18, category: 'Quality', trend: 'down' },
        { id: '3', type: 'complaint', text: 'Difficult return process', count: 12, category: 'Service', trend: 'stable' },
        { id: '4', type: 'compliment', text: 'Excellent customer service', count: 45, category: 'Service', trend: 'up' },
        { id: '5', type: 'compliment', text: 'Fast delivery', count: 38, category: 'Shipping', trend: 'up' },
        { id: '6', type: 'compliment', text: 'Great product quality', count: 52, category: 'Quality', trend: 'stable' }
      ];
      return data;
    };

    setSentimentData(generateSentimentData());
    setReviewSentiments(generateReviewSentiments());
    setComplaintsCompliments(generateComplaintsCompliments());
  }, [timeFilter]);

  // Calculate metrics
  const totalReviews = sentimentData.reduce((sum, day) => sum + day.total, 0);
  const positiveReviews = sentimentData.reduce((sum, day) => sum + day.positive, 0);
  const negativeReviews = sentimentData.reduce((sum, day) => sum + day.negative, 0);
  const neutralReviews = sentimentData.reduce((sum, day) => sum + day.neutral, 0);
  
  const positivePercentage = totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;
  const averageRating = reviewSentiments.length > 0 
    ? reviewSentiments.reduce((sum, review) => sum + review.rating, 0) / reviewSentiments.length 
    : 0;

  // Pie chart data
  const pieData = [
    { name: 'Positive', value: positiveReviews, color: '#10B981' },
    { name: 'Neutral', value: neutralReviews, color: '#F59E0B' },
    { name: 'Negative', value: negativeReviews, color: '#EF4444' }
  ];

  const handleSubmitFeedback = () => {
    const newReview = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      productId: 'general',
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      sentiment: newFeedback.rating >= 4 ? 'positive' as const : newFeedback.rating <= 2 ? 'negative' as const : 'neutral' as const,
      date: new Date(),
      helpful: 0,
      verified: !newFeedback.anonymous
    };
    
    addReview(newReview);
    setNewFeedback({ rating: 5, category: 'general', comment: '', anonymous: false });
    alert('Thank you for your feedback!');
  };

  const handleAdminResponse = () => {
    if (selectedReview && adminResponse.trim()) {
      const response: AdminResponse = {
        reviewId: selectedReview,
        response: adminResponse,
        timestamp: new Date(),
        adminName: user?.name || 'Admin'
      };
      
      setAdminResponses(prev => [...prev, response]);
      setReviewSentiments(prev => prev.map(review => 
        review.id === selectedReview ? { ...review, responded: true } : review
      ));
      
      setSelectedReview(null);
      setAdminResponse('');
      alert('Response sent successfully!');
    }
  };

  const exportData = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvContent = [
        ['Date', 'Positive', 'Negative', 'Neutral', 'Total'],
        ...sentimentData.map(row => [row.date, row.positive, row.negative, row.neutral, row.total])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentiment-data.csv';
      a.click();
    } else {
      alert('PDF export functionality would be implemented with a PDF library');
    }
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
                Customer Sentiment Dashboard
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Real-time analysis of customer feedback and sentiment trends
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={() => exportData('csv')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                <span>Export CSV</span>
              </button>
              
              <button
                onClick={() => exportData('pdf')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                <span>Export PDF</span>
              </button>
              
              {user?.tier === 'Platinum' && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <Settings size={18} />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalReviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="text-green-500" size={16} />
              <span className="text-sm text-green-600 ml-1">+12% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Positive Sentiment</p>
                <p className="text-3xl font-bold text-green-600">{positivePercentage.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <ThumbsUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="text-green-500" size={16} />
              <span className="text-sm text-green-600 ml-1">+5% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Negative Sentiment</p>
                <p className="text-3xl font-bold text-red-600">{((negativeReviews / totalReviews) * 100).toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <ThumbsDown className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown className="text-red-500" size={16} />
              <span className="text-sm text-red-600 ml-1">-2% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="text-green-500" size={16} />
              <span className="text-sm text-green-600 ml-1">+0.3 from last period</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Sentiment Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sentiment Trends
                </h3>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <RefreshCw size={18} />
                </button>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentData}>
                    <defs>
                      <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stackId="1"
                      stroke="#10B981"
                      fill="url(#positiveGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="neutral"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="url(#neutralGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stackId="1"
                      stroke="#EF4444"
                      fill="url(#negativeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sentiment Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Sentiment Distribution
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col justify-center space-y-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {((item.value / totalReviews) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Reviews
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviewSentiments.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.customerAvatar}
                          alt={review.customerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.customerName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {review.productName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          review.sentiment === 'positive' 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                            : review.sentiment === 'negative'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {review.sentiment === 'positive' ? <Smile size={12} /> : 
                           review.sentiment === 'negative' ? <Frown size={12} /> : <Meh size={12} />}
                          <span>{review.sentiment}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{review.timestamp.toLocaleDateString()}</span>
                        <span>{review.helpful} helpful</span>
                        <span>Confidence: {(review.confidence * 100).toFixed(0)}%</span>
                      </div>
                      
                      {user?.tier === 'Platinum' && !review.responded && (
                        <button
                          onClick={() => setSelectedReview(review.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <MessageCircle size={14} />
                          <span>Respond</span>
                        </button>
                      )}
                      
                      {review.responded && (
                        <div className="flex items-center space-x-1 text-green-600 text-sm">
                          <CheckCircle size={14} />
                          <span>Responded</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Complaints & Compliments */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Top Issues & Praise
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    Top Complaints
                  </h4>
                  <div className="space-y-2">
                    {complaintsCompliments
                      .filter(item => item.type === 'complaint')
                      .slice(0, 3)
                      .map((complaint) => (
                        <div key={complaint.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {complaint.text}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {complaint.category} • {complaint.count} mentions
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {complaint.trend === 'up' ? (
                              <TrendingUp className="text-red-500" size={14} />
                            ) : complaint.trend === 'down' ? (
                              <TrendingDown className="text-green-500" size={14} />
                            ) : (
                              <div className="w-3 h-3 bg-gray-400 rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center">
                    <Heart size={16} className="mr-2" />
                    Top Compliments
                  </h4>
                  <div className="space-y-2">
                    {complaintsCompliments
                      .filter(item => item.type === 'compliment')
                      .slice(0, 3)
                      .map((compliment) => (
                        <div key={compliment.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {compliment.text}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {compliment.category} • {compliment.count} mentions
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {compliment.trend === 'up' ? (
                              <TrendingUp className="text-green-500" size={14} />
                            ) : compliment.trend === 'down' ? (
                              <TrendingDown className="text-red-500" size={14} />
                            ) : (
                              <div className="w-3 h-3 bg-gray-400 rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Response Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round((reviewSentiments.filter(r => r.responded).length / reviewSentiments.length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">2.3 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Satisfaction Score</span>
                  <span className="font-semibold text-green-600">8.7/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pending Reviews</span>
                  <span className="font-semibold text-orange-600">
                    {reviewSentiments.filter(r => !r.responded && r.sentiment === 'negative').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Feedback Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Submit Feedback
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={`${
                            star <= newFeedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newFeedback.category}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="general">General</option>
                    <option value="product">Product Quality</option>
                    <option value="shipping">Shipping</option>
                    <option value="service">Customer Service</option>
                    <option value="website">Website Experience</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Share your thoughts..."
                  />
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFeedback.anonymous}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Submit anonymously
                  </span>
                </label>
                
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!newFeedback.comment.trim()}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send size={16} />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Admin Response Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Respond to Review
                </h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Review Details */}
              {(() => {
                const review = reviewSentiments.find(r => r.id === selectedReview);
                return review ? (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={review.customerAvatar}
                        alt={review.customerName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {review.customerName}
                        </h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                ) : null;
              })()}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Write a professional response to address the customer's concerns..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminResponse}
                    disabled={!adminResponse.trim()}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};