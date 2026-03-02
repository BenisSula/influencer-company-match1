/**
 * Centralized Icon Configuration - Single Source of Truth
 * 
 * This file provides a unified icon system using lucide-react.
 * All components should import icons from this file to ensure consistency.
 */

import {
  // Navigation & UI
  Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowRight, ArrowLeft, Home, Search, Filter, Plus, Minus,
  
  // User & Profile
  User, Users, UserPlus, UserCircle, Building, Building2,
  
  // Communication
  Mail, MessageCircle, Bell, Send,
  
  // Actions
  Heart, Share2, Bookmark, Eye, EyeOff, Edit, Trash2,
  Check, CheckCircle, AlertCircle, Info, HelpCircle,
  
  // Stats & Analytics
  TrendingUp, TrendingDown, BarChart3, Activity, Target,
  
  // Location & Geography
  MapPin, Globe,
  
  // Money & Business
  DollarSign, CreditCard, Briefcase,
  
  // Social & Engagement
  ThumbsUp, Star, Award, Zap, Sparkles,
  
  // Media
  Image, Upload, Download, File, Folder,
  
  // Settings & Config
  Settings, Lock, Unlock, Shield, Key,
  
  // Time
  Clock, Calendar,
  
  // Admin & Branding
  Palette, FileText, Code, Megaphone, Handshake,
  
  // Misc
  MousePointerClick, ExternalLink, Link, Copy,
  Loader2, RefreshCw
} from 'lucide-react';

/**
 * Icon size constants for consistent sizing across the app
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

/**
 * Icon color palette for consistent theming
 */
export const ICON_COLORS = {
  primary: '#1877F2',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  neutral: '#65676B',
  muted: '#9CA3AF',
} as const;

/**
 * Match Card specific icons - organized by category
 */
export const MatchCardIcons = {
  // Stats
  location: MapPin,
  followers: Users,
  engagement: TrendingUp,
  budget: DollarSign,
  
  // Actions
  message: Mail,
  profile: User,
  collaborate: UserPlus,
  details: BarChart3,
  
  // Analytics
  views: Eye,
  interactions: MousePointerClick,
  success: CheckCircle,
  
  // Tiers
  perfect: Sparkles,
  excellent: Star,
  good: Award,
  default: Zap,
  
  // AI Enhanced
  aiIndicator: Sparkles,
  trend: TrendingUp,
} as const;

/**
 * Dashboard specific icons
 */
export const DashboardIcons = {
  stats: {
    trending: TrendingUp,
    users: Users,
    lightning: Zap,
    news: MessageCircle,
    userCircle: UserCircle,
  },
  analytics: {
    eye: Eye,
    users: Users,
    chart: BarChart3,
    trendUp: TrendingUp,
    trendDown: TrendingDown,
  },
} as const;

/**
 * Sidebar specific icons
 */
export const SidebarIcons = {
  star: Star,
  mapPin: MapPin,
  sparkles: Sparkles,
  users: Users,
  trending: TrendingUp,
  dollar: DollarSign,
  building: Building2,
  award: Award,
  zap: Zap,
} as const;

/**
 * Common action icons
 */
export const ActionIcons = {
  like: Heart,
  comment: MessageCircle,
  share: Share2,
  bookmark: Bookmark,
  message: Mail,
  collaborate: UserPlus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
} as const;

/**
 * Helper function to get tier icon based on tier name
 */
export const getTierIcon = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'perfect':
      return MatchCardIcons.perfect;
    case 'excellent':
      return MatchCardIcons.excellent;
    case 'good':
      return MatchCardIcons.good;
    default:
      return MatchCardIcons.default;
  }
};

/**
 * Helper function to get icon color based on tier
 */
export const getTierColor = (tier: string): string => {
  switch (tier.toLowerCase()) {
    case 'perfect':
      return ICON_COLORS.success;
    case 'excellent':
      return ICON_COLORS.info;
    case 'good':
      return ICON_COLORS.warning;
    default:
      return ICON_COLORS.neutral;
  }
};

/**
 * Helper function to get score color
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return ICON_COLORS.success;
  if (score >= 75) return ICON_COLORS.info;
  if (score >= 60) return ICON_COLORS.warning;
  return ICON_COLORS.neutral;
};

// Export all icons for direct use
export {
  // Re-export all icons for components that need direct access
  Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowRight, ArrowLeft, Home, Search, Filter, Plus, Minus,
  User, Users, UserPlus, UserCircle, Building, Building2,
  Mail, MessageCircle, Bell, Send,
  Heart, Share2, Bookmark, Eye, EyeOff, Edit, Trash2,
  Check, CheckCircle, AlertCircle, Info, HelpCircle,
  TrendingUp, TrendingDown, BarChart3, Activity, Target,
  MapPin, Globe,
  DollarSign, CreditCard, Briefcase,
  ThumbsUp, Star, Award, Zap, Sparkles,
  Image, Upload, Download, File, Folder,
  Settings, Lock, Unlock, Shield, Key,
  Clock, Calendar,
  Palette, FileText, Code, Megaphone, Handshake,
  MousePointerClick, ExternalLink, Link, Copy,
  Loader2, RefreshCw
};
