import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  TreePine, 
  Recycle, 
  Zap, 
  Droplets, 
  Car, 
  Package, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Users, 
  Globe, 
  Heart, 
  Star, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Download, 
  Share2, 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  BarChart3, 
  PieChart, 
  Activity, 
  Plus, 
  Minus, 
  RefreshCw,
  Info,
  X,
  Play,
  Pause,
  RotateCcw,
  Calculator,
  ShoppingBag,
  Truck,
  Factory,
  Wind,
  Sun,
  Mountain
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  RadialBarChart, 
  RadialBar 
} from 'recharts';
import { useStore } from '../store/useStore';
import { Product } from '../types';

interface EcoMetrics {
  carbonFootprint: number; // kg CO2
  waterSaved: number; // liters
  wasteReduced: number; // kg
  energySaved: number; // kWh
  treesPlanted: number;
  recycledMaterials: number; // kg
}

interface SustainabilityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  unit: string;
  reward: number; // eco points
  deadline: Date;
  completed: boolean;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  badge: string;
  streak: number;
  location: string;
}

interface MonthlyReport {
  month: string;
  carbonFootprint: number;
  ecoScore: number;
  achievements: number;
  topCategory: string;
  improvement: number;
  recommendations: string[];
}

export const SustainabilityTracker: React.FC = () => {
  const { user, products } = useStore();
  
  // State management
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'leaderboard' | 'products'>('overview');
  const [calculatorInputs, setCalculatorInputs] = useState({
    transport: { car: 0, bus: 0, bike: 0, walk: 0 },
    energy: { electricity: 0, gas: 0, renewable: 0 },
    consumption: { newItems: 0, secondHand: 0, recycled: 0 },
    waste: { recycled: 0, composted: 0, landfill: 0 }
  });

  // Mock data
  const [ecoMetrics, setEcoMetrics] = useState<EcoMetrics>({
    carbonFootprint: 245.8,
    waterSaved: 1250,
    wasteReduced: 45.2,
    energySaved: 180,
    treesPlanted: 12,
    recycledMaterials: 28.5
  });

  const [sustainabilityBadges, setSustainabilityBadges] = useState<SustainabilityBadge[]>([
    {
      id: '1',
      name: 'Eco Warrior',
      description: 'Purchase 25 eco-friendly products',
      icon: 'leaf',
      color: 'bg-green-500',
      earned: true,
      earnedDate: new Date('2024-01-15'),
      progress: 25,
      maxProgress: 25,
      rarity: 'epic'
    },
    {
      id: '2',
      name: 'Carbon Neutral',
      description: 'Offset 100kg of CO2 emissions',
      icon: 'wind',
      color: 'bg-blue-500',
      earned: true,
      earnedDate: new Date('2024-01-10'),
      progress: 100,
      maxProgress: 100,
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Recycling Champion',
      description: 'Recycle 50kg of materials',
      icon: 'recycle',
      color: 'bg-purple-500',
      earned: false,
      progress: 28,
      maxProgress: 50,
      rarity: 'common'
    },
    {
      id: '4',
      name: 'Water Guardian',
      description: 'Save 5000 liters of water',
      icon: 'droplets',
      color: 'bg-cyan-500',
      earned: false,
      progress: 1250,
      maxProgress: 5000,
      rarity: 'legendary'
    }
  ]);

  const [ecoChallenges, setEcoChallenges] = useState<EcoChallenge[]>([
    {
      id: '1',
      title: 'Zero Waste Week',
      description: 'Avoid single-use plastics for 7 days',
      type: 'weekly',
      target: 7,
      current: 4,
      unit: 'days',
      reward: 150,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completed: false,
      icon: 'recycle',
      difficulty: 'medium'
    },
    {
      id: '2',
      title: 'Green Commute',
      description: 'Use eco-friendly transport for 5 trips',
      type: 'weekly',
      target: 5,
      current: 5,
      unit: 'trips',
      reward: 100,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed: true,
      icon: 'car',
      difficulty: 'easy'
    },
    {
      id: '3',
      title: 'Sustainable Shopping',
      description: 'Buy 10 eco-rated products this month',
      type: 'monthly',
      target: 10,
      current: 7,
      unit: 'products',
      reward: 300,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      completed: false,
      icon: 'shopping-bag',
      difficulty: 'hard'
    }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      name: 'Emma Green',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      score: 2850,
      rank: 1,
      badge: 'Eco Legend',
      streak: 45,
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Alex Thompson',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      score: 2450,
      rank: 2,
      badge: 'Green Guardian',
      streak: 32,
      location: 'Portland, OR'
    },
    {
      id: '3',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      score: 2180,
      rank: 3,
      badge: 'Sustainability Star',
      streak: 28,
      location: 'Seattle, WA'
    },
    {
      id: '4',
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      score: 1920,
      rank: 4,
      badge: 'Eco Warrior',
      streak: 21,
      location: 'Austin, TX'
    },
    {
      id: '5',
      name: 'You',
      avatar: user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      score: user?.sustainabilityScore || 1750,
      rank: 5,
      badge: 'Green Enthusiast',
      streak: 18,
      location: 'Your City'
    }
  ]);

  // Generate time-series data
  const generateTimeSeriesData = () => {
    const data = [];
    const days = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        carbonFootprint: Math.random() * 10 + 5,
        ecoScore: Math.random() * 20 + 70,
        waterSaved: Math.random() * 50 + 20,
        wasteReduced: Math.random() * 5 + 2
      });
    }
    return data;
  };

  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());

  useEffect(() => {
    setTimeSeriesData(generateTimeSeriesData());
  }, [selectedTimeframe]);

  // Eco-friendly products
  const ecoProducts = products.filter(p => p.ecoRating > 8);

  // Calculate carbon footprint
  const calculateCarbonFootprint = () => {
    const { transport, energy, consumption, waste } = calculatorInputs;
    
    // Carbon factors (kg CO2 per unit)
    const factors = {
      transport: { car: 0.21, bus: 0.089, bike: 0, walk: 0 },
      energy: { electricity: 0.5, gas: 2.3, renewable: 0 },
      consumption: { newItems: 10, secondHand: 2, recycled: 1 },
      waste: { recycled: -0.5, composted: -0.3, landfill: 0.5 }
    };
    
    let total = 0;
    total += transport.car * factors.transport.car;
    total += transport.bus * factors.transport.bus;
    total += energy.electricity * factors.energy.electricity;
    total += energy.gas * factors.energy.gas;
    total += consumption.newItems * factors.consumption.newItems;
    total += consumption.secondHand * factors.consumption.secondHand;
    total += consumption.recycled * factors.consumption.recycled;
    total += waste.recycled * factors.waste.recycled;
    total += waste.composted * factors.waste.composted;
    total += waste.landfill * factors.waste.landfill;
    
    return Math.max(0, total);
  };

  const completeChallenge = (challengeId: string) => {
    setEcoChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, current: challenge.target }
        : challenge
    ));
  };

  const generateMonthlyReport = (): MonthlyReport => {
    return {
      month: 'January 2024',
      carbonFootprint: ecoMetrics.carbonFootprint,
      ecoScore: user?.sustainabilityScore || 78,
      achievements: sustainabilityBadges.filter(b => b.earned).length,
      topCategory: 'Sustainable Products',
      improvement: 15,
      recommendations: [
        'Consider using public transport more often',
        'Look for products with higher eco-ratings',
        'Participate in local recycling programs',
        'Switch to renewable energy sources'
      ]
    };
  };

  const exportReport = () => {
    const report = generateMonthlyReport();
    const csvContent = [
      ['Metric', 'Value'],
      ['Carbon Footprint (kg CO2)', ecoMetrics.carbonFootprint.toString()],
      ['Water Saved (L)', ecoMetrics.waterSaved.toString()],
      ['Waste Reduced (kg)', ecoMetrics.wasteReduced.toString()],
      ['Energy Saved (kWh)', ecoMetrics.energySaved.toString()],
      ['Trees Planted', ecoMetrics.treesPlanted.toString()],
      ['Eco Score', (user?.sustainabilityScore || 0).toString()]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sustainability-report.csv';
    a.click();
  };

  // Impact visualization data
  const impactData = [
    { name: 'Carbon Saved', value: ecoMetrics.carbonFootprint, color: '#10B981', icon: Wind },
    { name: 'Water Saved', value: ecoMetrics.waterSaved, color: '#06B6D4', icon: Droplets },
    { name: 'Waste Reduced', value: ecoMetrics.wasteReduced, color: '#8B5CF6', icon: Recycle },
    { name: 'Energy Saved', value: ecoMetrics.energySaved, color: '#F59E0B', icon: Zap }
  ];

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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Leaf className="text-green-500 mr-3" size={40} />
                Sustainability Tracker
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Monitor your environmental impact and join the green revolution
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCalculator(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Calculator size={18} />
                <span>Carbon Calculator</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <BarChart3 size={18} />
                <span>Monthly Report</span>
              </button>
              <button
                onClick={exportReport}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Eco Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (user?.sustainabilityScore || 78) / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{user?.sustainabilityScore || 78}</div>
                      <div className="text-sm opacity-90">Eco Score</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Impact</h3>
                <p className="opacity-90">Keep up the great work!</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <TreePine size={32} className="mx-auto mb-2" />
                  <div className="text-2xl font-bold">{ecoMetrics.treesPlanted}</div>
                  <div className="text-sm opacity-90">Trees Planted</div>
                </div>
                <div className="text-center">
                  <Recycle size={32} className="mx-auto mb-2" />
                  <div className="text-2xl font-bold">{ecoMetrics.recycledMaterials}kg</div>
                  <div className="text-sm opacity-90">Recycled</div>
                </div>
                <div className="text-center">
                  <Droplets size={32} className="mx-auto mb-2" />
                  <div className="text-2xl font-bold">{ecoMetrics.waterSaved}L</div>
                  <div className="text-sm opacity-90">Water Saved</div>
                </div>
                <div className="text-center">
                  <Zap size={32} className="mx-auto mb-2" />
                  <div className="text-2xl font-bold">{ecoMetrics.energySaved}kWh</div>
                  <div className="text-sm opacity-90">Energy Saved</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{user?.loyaltyPoints || 2450}</div>
                <div className="text-lg mb-4">Eco Points</div>
                <div className="flex items-center justify-center space-x-2">
                  <Award className="text-yellow-300" size={20} />
                  <span className="font-medium">{user?.tier || 'Gold'} Member</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 mb-8 shadow-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'challenges', label: 'Challenges', icon: Target },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'products', label: 'Eco Products', icon: Leaf }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Impact Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Environmental Impact
                    </h3>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="ecoScore"
                          stroke="#10B981"
                          fillOpacity={1}
                          fill="url(#ecoGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Impact Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {impactData.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.name}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
                        >
                          <Icon 
                            size={32} 
                            className="mx-auto mb-2" 
                            style={{ color: item.color }}
                          />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {item.value}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sustainability Badges */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Sustainability Badges
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sustainabilityBadges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.05 }}
                      className={`relative p-6 rounded-xl text-center ${
                        badge.earned 
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {badge.rarity === 'legendary' && badge.earned && (
                        <div className="absolute -top-2 -right-2">
                          <Crown className="text-yellow-400" size={24} />
                        </div>
                      )}
                      
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        badge.earned ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {badge.icon === 'leaf' && <Leaf size={32} />}
                        {badge.icon === 'wind' && <Wind size={32} />}
                        {badge.icon === 'recycle' && <Recycle size={32} />}
                        {badge.icon === 'droplets' && <Droplets size={32} />}
                      </div>
                      
                      <h4 className="font-semibold mb-2">{badge.name}</h4>
                      <p className="text-sm opacity-90 mb-4">{badge.description}</p>
                      
                      {!badge.earned && badge.progress !== undefined && (
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(badge.progress / badge.maxProgress!) * 100}%` }}
                          />
                        </div>
                      )}
                      
                      {badge.earned && (
                        <div className="flex items-center justify-center space-x-1">
                          <CheckCircle size={16} />
                          <span className="text-sm">
                            Earned {badge.earnedDate?.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ecoChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${
                      challenge.completed 
                        ? 'border-green-500' 
                        : challenge.difficulty === 'easy' 
                        ? 'border-blue-500'
                        : challenge.difficulty === 'medium'
                        ? 'border-yellow-500'
                        : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        challenge.completed ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {challenge.icon === 'recycle' && <Recycle size={24} className={challenge.completed ? 'text-green-600' : 'text-gray-600'} />}
                        {challenge.icon === 'car' && <Car size={24} className={challenge.completed ? 'text-green-600' : 'text-gray-600'} />}
                        {challenge.icon === 'shopping-bag' && <ShoppingBag size={24} className={challenge.completed ? 'text-green-600' : 'text-gray-600'} />}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          challenge.type === 'daily' ? 'bg-blue-100 text-blue-700' :
                          challenge.type === 'weekly' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {challenge.type}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {challenge.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {challenge.current}/{challenge.target} {challenge.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            challenge.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="text-yellow-500" size={16} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {challenge.reward} points
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                      </div>
                    </div>
                    
                    {!challenge.completed && challenge.current < challenge.target && (
                      <button
                        onClick={() => completeChallenge(challenge.id)}
                        className="w-full mt-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Mark Progress
                      </button>
                    )}
                    
                    {challenge.completed && (
                      <div className="flex items-center justify-center space-x-2 mt-4 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Community Leaderboard
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Globe size={16} />
                  <span>Global Rankings</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      entry.name === 'You' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white ${
                      entry.rank === 1 ? 'bg-yellow-500' :
                      entry.rank === 2 ? 'bg-gray-400' :
                      entry.rank === 3 ? 'bg-orange-500' :
                      'bg-gray-600'
                    }`}>
                      {entry.rank === 1 && <Crown size={20} />}
                      {entry.rank === 2 && <Medal size={20} />}
                      {entry.rank === 3 && <Trophy size={20} />}
                      {entry.rank > 3 && entry.rank}
                    </div>
                    
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {entry.name}
                        </h4>
                        {entry.name === 'You' && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{entry.location}</span>
                        <span>•</span>
                        <span>{entry.badge}</span>
                        <span>•</span>
                        <span>{entry.streak} day streak</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        eco points
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Eco-Friendly Product Recommendations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ecoProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                          <Leaf size={12} />
                          <span>{product.ecoRating}/10</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${product.price}
                        </span>
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors">
                          View Product
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Carbon Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCalculator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Carbon Footprint Calculator
                </h3>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Transport */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Car className="mr-2" size={20} />
                    Transportation (km per week)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Car</label>
                      <input
                        type="number"
                        value={calculatorInputs.transport.car}
                        onChange={(e) => setCalculatorInputs(prev => ({
                          ...prev,
                          transport: { ...prev.transport, car: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Public Transport</label>
                      <input
                        type="number"
                        value={calculatorInputs.transport.bus}
                        onChange={(e) => setCalculatorInputs(prev => ({
                          ...prev,
                          transport: { ...prev.transport, bus: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Zap className="mr-2" size={20} />
                    Energy (kWh per month)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Electricity</label>
                      <input
                        type="number"
                        value={calculatorInputs.energy.electricity}
                        onChange={(e) => setCalculatorInputs(prev => ({
                          ...prev,
                          energy: { ...prev.energy, electricity: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Gas</label>
                      <input
                        type="number"
                        value={calculatorInputs.energy.gas}
                        onChange={(e) => setCalculatorInputs(prev => ({
                          ...prev,
                          energy: { ...prev.energy, gas: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                    Your Carbon Footprint
                  </h4>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {calculateCarbonFootprint().toFixed(1)} kg CO2/week
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    {calculateCarbonFootprint() < 50 ? 'Great job! You\'re below average.' : 'Consider reducing your footprint.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowCalculator(false)}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Save Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Monthly Sustainability Report
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {(() => {
                const report = generateMonthlyReport();
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {report.month}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your sustainability journey this month
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {report.ecoScore}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          Eco Score
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          +{report.improvement}%
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Improvement
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Recommendations for Next Month
                      </h5>
                      <ul className="space-y-2">
                        {report.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="text-green-500 mt-0.5" size={16} />
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              {rec}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={exportReport}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Export Report
                      </button>
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};