import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Star, 
  Gift, 
  Crown, 
  Trophy, 
  Medal, 
  Zap, 
  Target, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Heart, 
  Coins, 
  Gem, 
  Flame, 
  Shield, 
  Leaf, 
  Camera, 
  MessageCircle, 
  Eye, 
  RefreshCw,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Upload,
  Link,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ArrowRight,
  Plus,
  Minus,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingDown
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'discount' | 'freebie' | 'exclusive' | 'experience';
  image: string;
  available: boolean;
  limited?: boolean;
  expiresAt?: Date;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  tier: string;
  streak: number;
  location: string;
}

interface SpinWheelSegment {
  id: string;
  label: string;
  points: number;
  color: string;
  probability: number;
}

export const RewardsLoyalty: React.FC = () => {
  const { user } = useStore();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'rewards' | 'leaderboard' | 'referrals'>('overview');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinWheelSegment | null>(null);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [referralCode, setReferralCode] = useState('ALEX2024');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mock data
  const [userPoints, setUserPoints] = useState(user?.loyaltyPoints || 2450);
  const [userTier, setUserTier] = useState(user?.tier || 'Gold');
  const [nextTierPoints, setNextTierPoints] = useState(3000);
  const [dailySpinsLeft, setDailySpinsLeft] = useState(2);

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Purchase',
      description: 'Make your first purchase',
      icon: 'shopping-bag',
      points: 100,
      rarity: 'common',
      earned: true,
      earnedDate: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Eco Warrior',
      description: 'Purchase 10 eco-friendly products',
      icon: 'leaf',
      points: 500,
      rarity: 'rare',
      earned: true,
      earnedDate: new Date('2024-01-20'),
      progress: 10,
      maxProgress: 10
    },
    {
      id: '3',
      title: 'Social Butterfly',
      description: 'Share 25 products on social media',
      icon: 'share-2',
      points: 300,
      rarity: 'common',
      earned: false,
      progress: 18,
      maxProgress: 25
    },
    {
      id: '4',
      title: 'Review Master',
      description: 'Write 50 product reviews',
      icon: 'star',
      points: 750,
      rarity: 'epic',
      earned: false,
      progress: 32,
      maxProgress: 50
    },
    {
      id: '5',
      title: 'Loyalty Legend',
      description: 'Maintain a 365-day shopping streak',
      icon: 'crown',
      points: 2000,
      rarity: 'legendary',
      earned: false,
      progress: 127,
      maxProgress: 365
    }
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      title: '20% Off Next Purchase',
      description: 'Get 20% discount on your next order',
      cost: 500,
      type: 'discount',
      image: 'https://images.pexels.com/photos/1332189/pexels-photo-1332189.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true
    },
    {
      id: '2',
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
      cost: 200,
      type: 'freebie',
      image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true
    },
    {
      id: '3',
      title: 'Exclusive Product Access',
      description: 'Early access to new product launches',
      cost: 1000,
      type: 'exclusive',
      image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      limited: true
    },
    {
      id: '4',
      title: 'VIP Shopping Experience',
      description: 'Personal shopping session with style expert',
      cost: 2500,
      type: 'experience',
      image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      limited: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Emma Rodriguez',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      points: 15420,
      rank: 1,
      tier: 'Platinum',
      streak: 89,
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      points: 12850,
      rank: 2,
      tier: 'Platinum',
      streak: 67,
      location: 'New York, NY'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      points: 9630,
      rank: 3,
      tier: 'Gold',
      streak: 45,
      location: 'Los Angeles, CA'
    },
    {
      id: '4',
      name: 'You',
      avatar: user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      points: userPoints,
      rank: 4,
      tier: userTier,
      streak: 23,
      location: 'Your City'
    }
  ];

  const spinWheelSegments: SpinWheelSegment[] = [
    { id: '1', label: '50 Points', points: 50, color: '#3B82F6', probability: 0.3 },
    { id: '2', label: '100 Points', points: 100, color: '#10B981', probability: 0.25 },
    { id: '3', label: '25 Points', points: 25, color: '#F59E0B', probability: 0.2 },
    { id: '4', label: '200 Points', points: 200, color: '#8B5CF6', probability: 0.15 },
    { id: '5', label: '500 Points', points: 500, color: '#EF4444', probability: 0.08 },
    { id: '6', label: '1000 Points', points: 1000, color: '#F97316', probability: 0.02 }
  ];

  const tierBenefits = {
    Bronze: { multiplier: 1, perks: ['Basic rewards', 'Standard support'] },
    Silver: { multiplier: 1.2, perks: ['20% bonus points', 'Priority support', 'Free shipping'] },
    Gold: { multiplier: 1.5, perks: ['50% bonus points', 'VIP support', 'Free shipping', 'Early access'] },
    Platinum: { multiplier: 2, perks: ['100% bonus points', 'Dedicated support', 'Free shipping', 'Exclusive products', 'Personal shopper'] }
  };

  const specialOffers = [
    {
      id: '1',
      title: 'Double Points Weekend',
      description: 'Earn 2x points on all purchases this weekend',
      image: 'https://images.pexels.com/photos/1332189/pexels-photo-1332189.jpeg?auto=compress&cs=tinysrgb&w=400',
      validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      active: true
    },
    {
      id: '2',
      title: 'Refer a Friend Bonus',
      description: 'Get 500 points for each successful referral',
      image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true
    }
  ];

  const handleSpin = () => {
    if (!canSpin || dailySpinsLeft <= 0) return;

    setIsSpinning(true);
    setShowSpinModal(true);

    // Calculate result based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedSegment = spinWheelSegments[0];

    for (const segment of spinWheelSegments) {
      cumulativeProbability += segment.probability;
      if (random <= cumulativeProbability) {
        selectedSegment = segment;
        break;
      }
    }

    // Calculate rotation (multiple full rotations + segment position)
    const segmentAngle = 360 / spinWheelSegments.length;
    const segmentIndex = spinWheelSegments.findIndex(s => s.id === selectedSegment.id);
    const targetAngle = segmentIndex * segmentAngle;
    const fullRotations = 5; // 5 full spins
    const finalRotation = wheelRotation + (fullRotations * 360) + (360 - targetAngle);

    setWheelRotation(finalRotation);

    // Show result after animation
    setTimeout(() => {
      setSpinResult(selectedSegment);
      setUserPoints(prev => prev + selectedSegment.points);
      setDailySpinsLeft(prev => prev - 1);
      setIsSpinning(false);
      
      if (dailySpinsLeft <= 1) {
        setCanSpin(false);
      }
    }, 3000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://retailverse.com/ref/${referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const redeemReward = (reward: Reward) => {
    if (userPoints >= reward.cost) {
      setUserPoints(prev => prev - reward.cost);
      alert(`Successfully redeemed: ${reward.title}`);
    } else {
      alert('Insufficient points for this reward');
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'shopping-bag': ShoppingBag,
      'leaf': Leaf,
      'share-2': Share2,
      'star': Star,
      'crown': Crown,
      'trophy': Trophy,
      'medal': Medal,
      'gift': Gift,
      'award': Award
    };
    return iconMap[iconName] || Award;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'from-orange-400 to-orange-600';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Gold': return 'from-yellow-400 to-yellow-600';
      case 'Platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
              <Trophy className="text-yellow-500 mr-3" size={40} />
              Rewards & Loyalty
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Earn points, unlock achievements, and enjoy exclusive rewards
            </p>
          </div>

          {/* Points & Tier Overview */}
          <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 text-white mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Points Balance */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative w-32 h-32 mx-auto mb-4"
                >
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - userPoints / nextTierPoints)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Coins size={24} className="mx-auto mb-1" />
                      <div className="text-sm opacity-90">Points</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold mb-2"
                >
                  {userPoints.toLocaleString()}
                </motion.div>
                <p className="opacity-90">Available Points</p>
              </div>

              {/* Current Tier */}
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${getTierColor(userTier)} flex items-center justify-center`}>
                  {userTier === 'Bronze' && <Medal size={32} />}
                  {userTier === 'Silver' && <Award size={32} />}
                  {userTier === 'Gold' && <Trophy size={32} />}
                  {userTier === 'Platinum' && <Crown size={32} />}
                </div>
                <div className="text-2xl font-bold mb-2">{userTier}</div>
                <p className="opacity-90">Current Tier</p>
                <div className="mt-2 text-sm opacity-75">
                  {nextTierPoints - userPoints} points to next tier
                </div>
              </div>

              {/* Daily Spin */}
              <div className="text-center">
                <button
                  onClick={() => setShowSpinModal(true)}
                  disabled={!canSpin || dailySpinsLeft <= 0}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <RotateCcw size={32} className={dailySpinsLeft > 0 ? 'animate-pulse' : 'opacity-50'} />
                </button>
                <div className="text-2xl font-bold mb-2">{dailySpinsLeft}</div>
                <p className="opacity-90">Spins Left</p>
                <div className="mt-2 text-sm opacity-75">
                  Resets daily at midnight
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 mb-8 shadow-lg overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'referrals', label: 'Referrals', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
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
              {/* Special Offers */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Sparkles className="text-yellow-500 mr-2" size={24} />
                  Special Offers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specialOffers.map((offer) => (
                    <motion.div
                      key={offer.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white"
                    >
                      <div className="relative z-10">
                        <h4 className="text-lg font-semibold mb-2">{offer.title}</h4>
                        <p className="text-sm opacity-90 mb-4">{offer.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs opacity-75">
                            Valid until {offer.validUntil.toLocaleDateString()}
                          </span>
                          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                            Claim Now
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                        <Gift size={128} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Recent Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <IconComponent size={24} />
                          <div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-xs opacity-90">+{achievement.points} points</p>
                          </div>
                        </div>
                        <p className="text-sm opacity-90">{achievement.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Tier Benefits */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Your {userTier} Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Points Multiplier: {tierBenefits[userTier as keyof typeof tierBenefits].multiplier}x
                    </h4>
                    <div className="space-y-2">
                      {tierBenefits[userTier as keyof typeof tierBenefits].perks.map((perk, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="text-gray-600 dark:text-gray-400">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Progress to Next Tier
                    </h4>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userPoints / nextTierPoints) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userPoints} / {nextTierPoints} points
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Achievement Collection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => {
                  const IconComponent = getIconComponent(achievement.icon);
                  return (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        achievement.earned
                          ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white border-transparent`
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {achievement.rarity === 'legendary' && achievement.earned && (
                        <div className="absolute -top-2 -right-2">
                          <Crown className="text-yellow-400" size={24} />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-lg ${
                          achievement.earned ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          <IconComponent size={24} className={achievement.earned ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${achievement.earned ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${achievement.earned ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                            +{achievement.points} points
                          </p>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-4 ${achievement.earned ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                        {achievement.description}
                      </p>
                      
                      {!achievement.earned && achievement.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-gray-900 dark:text-white">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(achievement.progress / achievement.maxProgress!) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {achievement.earned && (
                        <div className="flex items-center space-x-2 text-white/90">
                          <CheckCircle size={16} />
                          <span className="text-sm">
                            Earned {achievement.earnedDate?.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
                        achievement.rarity === 'common' ? 'bg-gray-500' :
                        achievement.rarity === 'rare' ? 'bg-blue-500' :
                        achievement.rarity === 'epic' ? 'bg-purple-500' :
                        'bg-yellow-500'
                      } text-white`}>
                        {achievement.rarity}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Redeem Rewards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <motion.div
                    key={reward.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                  >
                    <img
                      src={reward.image}
                      alt={reward.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {reward.title}
                        </h4>
                        {reward.limited && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Limited
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Coins className="text-yellow-500" size={16} />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {reward.cost}
                          </span>
                        </div>
                        <button
                          onClick={() => redeemReward(reward)}
                          disabled={userPoints < reward.cost || !reward.available}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          {userPoints >= reward.cost ? 'Redeem' : 'Insufficient Points'}
                        </button>
                      </div>
                      {reward.expiresAt && (
                        <p className="text-xs text-red-500 mt-2">
                          Expires: {reward.expiresAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Points Leaderboard
              </h3>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      entry.name === 'You' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800' 
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
                          <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{entry.location}</span>
                        <span>•</span>
                        <span>{entry.tier} Tier</span>
                        <span>•</span>
                        <span>{entry.streak} day streak</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {entry.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        points
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Referral Program */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Refer Friends & Earn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      How it works:
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Share your referral link
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Friend signs up and makes first purchase
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          You both get 500 points!
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Your Referral Link:
                    </h4>
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        value={`https://retailverse.com/ref/${referralCode}`}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
                      />
                      <button
                        onClick={copyReferralCode}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                      >
                        {copiedReferral ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                        <Facebook size={16} />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm transition-colors">
                        <Twitter size={16} />
                        <span>Tweet</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Your Referral Stats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-500 mb-2">12</div>
                    <p className="text-gray-600 dark:text-gray-400">Friends Referred</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">6,000</div>
                    <p className="text-gray-600 dark:text-gray-400">Points Earned</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-2">8</div>
                    <p className="text-gray-600 dark:text-gray-400">Active Referrals</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {showSpinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isSpinning && setShowSpinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full text-center"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Daily Spin Wheel
              </h3>
              
              {/* Spin Wheel */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg
                  className="w-64 h-64 transition-transform duration-3000 ease-out"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                  viewBox="0 0 200 200"
                >
                  {spinWheelSegments.map((segment, index) => {
                    const angle = (360 / spinWheelSegments.length) * index;
                    const nextAngle = (360 / spinWheelSegments.length) * (index + 1);
                    const midAngle = (angle + nextAngle) / 2;
                    
                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 100 100 L ${100 + 90 * Math.cos((angle * Math.PI) / 180)} ${100 + 90 * Math.sin((angle * Math.PI) / 180)} A 90 90 0 0 1 ${100 + 90 * Math.cos((nextAngle * Math.PI) / 180)} ${100 + 90 * Math.sin((nextAngle * Math.PI) / 180)} Z`}
                          fill={segment.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={100 + 60 * Math.cos((midAngle * Math.PI) / 180)}
                          y={100 + 60 * Math.sin((midAngle * Math.PI) / 180)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                          transform={`rotate(${midAngle}, ${100 + 60 * Math.cos((midAngle * Math.PI) / 180)}, ${100 + 60 * Math.sin((midAngle * Math.PI) / 180)})`}
                        >
                          {segment.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
                </div>
              </div>
              
              {spinResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <div className="text-2xl font-bold text-green-500 mb-2">
                    Congratulations!
                  </div>
                  <div className="text-lg text-gray-900 dark:text-white">
                    You won {spinResult.points} points!
                  </div>
                </motion.div>
              )}
              
              <div className="flex space-x-4">
                {!spinResult && (
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning || !canSpin || dailySpinsLeft <= 0}
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isSpinning ? 'Spinning...' : dailySpinsLeft > 0 ? 'Spin!' : 'No Spins Left'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowSpinModal(false)}
                  disabled={isSpinning}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {spinResult ? 'Claim' : 'Close'}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                {dailySpinsLeft} spins remaining today
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};