'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiArrowRight,
  FiSearch,
  FiBookOpen,
  FiTarget,
  FiUsers,
  FiAward,
  FiStar,
  FiShield,
  FiMusic,
  FiHeart,
  FiAlertTriangle,
  FiPhone,
  FiMail,
  FiPhoneCall,
  FiMapPin,
  FiPlus,
  FiX,
  FiFilter,
  FiRotateCw,
  FiEdit3,
  FiTrash2,
  FiMessageCircle,
  FiSave,
  FiImage,
  FiUpload,
  FiEye,
  FiChevronRight,
  FiChevronLeft,
  FiGrid,
  FiList,
  FiBookmark,
  FiShare2,
  FiDownload,
  FiExternalLink,
  FiZap,
  FiTrendingUp,
  FiGlobe,
  FiCopy,
  FiBell,
  FiUserPlus 
} from 'react-icons/fi';

import {
  IoCalendarClearOutline,
  IoSparkles,
  IoRibbonOutline,
  IoPeopleCircle,
  IoStatsChart,
  IoShareSocialOutline,
  IoClose,
  IoLocationOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoShareOutline,
  IoNewspaperOutline
} from 'react-icons/io5';
import { CircularProgress, Box, Typography, Stack } from '@mui/material';

// Modern color palette
const COLORS = {
  primary: '#1d4ed8',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  overlay: 'rgba(0, 0, 0, 0.85)'
};

// Modern Button Component
const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  onClick, 
  disabled, 
  className = '',
  type = 'button'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-sm rounded-lg',
    lg: 'px-6 py-4 text-base rounded-xl'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50',
    outline: 'border border-slate-200 text-slate-700 bg-transparent hover:bg-slate-50',
    ghost: 'text-slate-700 bg-transparent hover:bg-slate-100/50',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:shadow-lg',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:shadow-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-medium transition-all duration-200 
        flex items-center justify-center gap-2 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
        ${className}
      `}
    >
      {Icon && <Icon className="text-current" />}
      {children}
    </button>
  );
};

// Modern Card Component
const ModernCard = ({ children, className = '', elevation = 'md' }) => {
  const elevationClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div className={`bg-white rounded-xl ${elevationClasses[elevation]} border border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

// Modern Badge Component
const ModernBadge = ({ children, color = 'blue', className = '', icon: Icon }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}>
      {Icon && <Icon className="text-xs" />}
      {children}
    </span>
  );
};

// Modern Modal Component
const ModernModal = ({ children, open, onClose, maxWidth = '800px' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200"
        style={{ 
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white cursor-pointer border border-slate-200 shadow-sm"
          >
            <FiX className="text-slate-600 w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Modern Counseling Card
const ModernCounselingCard = ({ session, onView, onBookmark, viewMode = 'grid' }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryStyle = (category) => {
    const styles = {
      academic: { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      emotional: { 
        gradient: 'from-purple-500 to-pink-500', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      },
      devotion: { 
        gradient: 'from-indigo-500 to-purple-500', 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600'
      },
      worship: { 
        gradient: 'from-amber-500 to-orange-500', 
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
      },
      support: { 
        gradient: 'from-emerald-500 to-green-500', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      },
      drugs: { 
        gradient: 'from-red-500 to-rose-500', 
        bg: 'bg-red-50', 
        text: 'text-red-700',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      }
    };
    return styles[category] || styles.academic;
  };

  const formatDate = (dateString) => {
    try {
      if (dateString === 'Always Available' || dateString === 'Monday - Friday') {
        return dateString;
      }
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Available';
    }
  };

  // Grid View
  if (viewMode === 'grid') {
    const theme = getCategoryStyle(session.category);
    
    return (
      <ModernCard 
        elevation="sm" 
        className="overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        onClick={() => onView(session)}
      >
        {/* Image Header */}
        <div className="relative h-48 w-full">
          {session.image ? (
            <img
              src={session.image}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient}`} />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <ModernBadge 
              color={theme.text.includes('blue') ? 'blue' : 
                     theme.text.includes('purple') ? 'purple' : 
                     theme.text.includes('emerald') ? 'green' : 
                     theme.text.includes('amber') ? 'yellow' : 
                     theme.text.includes('red') ? 'red' : 'slate'}
              className="shadow-sm backdrop-blur-sm"
            >
              {session.category || 'Counseling'}
            </ModernBadge>
            {session.featured && (
              <ModernBadge color="yellow" icon={IoSparkles} className="shadow-sm">
                Featured
              </ModernBadge>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
              onBookmark(session);
            }}
            className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md border shadow-sm ${
              isBookmarked 
                ? 'bg-amber-500 border-amber-500 text-white' 
                : 'bg-white/90 border-white/10 text-slate-700 hover:bg-white'
            }`}
          >
            <FiBookmark className={isBookmarked ? 'fill-current' : ''} size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
            {session.title}
          </h3>
          
          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {session.description || 'Professional counseling and support session for students.'}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`p-1.5 rounded ${theme.iconBg}`}>
                <FiCalendar className={`${theme.iconColor}`} size={14} />
              </div>
              <span className="text-xs font-medium text-slate-700 truncate">
                {formatDate(session.date)}
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`p-1.5 rounded ${theme.iconBg}`}>
                <FiClock className={`${theme.iconColor}`} size={14} />
              </div>
              <span className="text-xs font-medium text-slate-700 truncate">
                {session.time || 'Flexible'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                session.priority === 'high' ? 'bg-red-500 animate-pulse' :
                session.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <span className="text-xs text-slate-500">
                {session.priority || 'medium'} priority
              </span>
            </div>
            
            <ModernButton
              variant="primary"
              size="sm"
              icon={FiArrowRight}
              className="px-3 py-2"
            >
              View
            </ModernButton>
          </div>
        </div>
      </ModernCard>
    );
  }

  // List View
  return (
    <ModernCard 
      elevation="sm" 
      className="cursor-pointer transition-all hover:bg-slate-50/50"
      onClick={() => onView(session)}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
          {session.image ? (
            <img
              src={session.image}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(session.category).gradient}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <ModernBadge 
                color={getCategoryStyle(session.category).text.includes('blue') ? 'blue' : 'slate'}
                className="text-xs"
              >
                {session.category || 'Support'}
              </ModernBadge>
              <span className="text-xs text-slate-500">
                {formatDate(session.date)}
              </span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
                onBookmark(session);
              }}
              className={`p-1.5 rounded-lg ${
                isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'
              }`}
            >
              <FiBookmark className={isBookmarked ? 'fill-current' : ''} size={14} />
            </button>
          </div>

          <h3 className="text-base font-semibold text-slate-800 line-clamp-1 mb-1">
            {session.title}
          </h3>

          <p className="text-slate-600 text-sm line-clamp-2 mb-3">
            {session.description}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <FiUser className="text-slate-400" size={12} />
                <span className="font-medium">{session.counselor}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="text-slate-400" size={12} />
                <span>{session.time}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              View
              <FiArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

// Modern Support Team Card
const ModernSupportTeamCard = ({ member, onView, onContact, viewMode = 'grid' }) => {
  const getRoleStyle = (role) => {
    const styles = {
      'teacher': { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      'matron': { 
        gradient: 'from-purple-500 to-pink-500', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      },
      'patron': { 
        gradient: 'from-emerald-500 to-green-500', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      }
    };
    return styles[role] || { 
      gradient: 'from-slate-500 to-slate-600', 
      bg: 'bg-slate-50', 
      text: 'text-slate-700',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600'
    };
  };

  const roleStyle = getRoleStyle(member.role);
  
  if (viewMode === 'grid') {
    return (
      <ModernCard 
        elevation="sm" 
        className="overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
        onClick={() => onView(member)}
      >
        {/* Image Header */}
        <div className="relative h-40 w-full">
          <img
            src={member.image || '/default-avatar.jpg'}
            alt={member.name}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Role Badge */}
          <div className="absolute top-3 left-3">
            <ModernBadge 
              color={roleStyle.text.includes('blue') ? 'blue' : 
                     roleStyle.text.includes('purple') ? 'purple' : 
                     roleStyle.text.includes('emerald') ? 'green' : 'slate'}
              className="shadow-sm backdrop-blur-sm"
            >
              {member.role || 'Team Member'}
            </ModernBadge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {member.name}
          </h3>
          
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
            {member.bio || 'Dedicated professional providing guidance and support to students.'}
          </p>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {member.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiPhone className="text-slate-400" size={14} />
                <span className="truncate">{member.phone}</span>
              </div>
            )}
            
            {member.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiMail className="text-slate-400" size={14} />
                <span className="truncate">{member.email}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <ModernButton
            variant="primary"
            size="sm"
            className="w-full"
          >
            View Profile
          </ModernButton>
        </div>
      </ModernCard>
    );
  }

  // List View
  return (
    <ModernCard 
      elevation="sm" 
      className="cursor-pointer transition-all hover:bg-slate-50/50"
      onClick={() => onView(member)}
    >
      <div className="flex gap-4 p-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <img
            src={member.image || '/default-avatar.jpg'}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <ModernBadge 
              color={roleStyle.text.includes('blue') ? 'blue' : 
                     roleStyle.text.includes('purple') ? 'purple' : 
                     roleStyle.text.includes('emerald') ? 'green' : 'slate'}
              className="text-xs"
            >
              {member.role || 'Team Member'}
            </ModernBadge>
          </div>

          <h3 className="text-base font-semibold text-slate-800 line-clamp-1 mb-1">
            {member.name}
          </h3>

          <p className="text-slate-600 text-sm line-clamp-2 mb-3">
            {member.bio?.substring(0, 100) || 'Dedicated professional providing guidance and support to students.'}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-500">
            {member.phone && (
              <div className="flex items-center gap-1">
                <FiPhone className="text-slate-400" size={12} />
                <span className="font-medium">{member.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              Contact
              <FiArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

// Modern Team Member Modal
const TeamMemberModal = ({ member, isOpen, onClose, onContact }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !member) return null;

  const getRoleStyle = (role) => {
    const styles = {
      'teacher': { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      'matron': { 
        gradient: 'from-purple-500 to-pink-500', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200'
      },
      'patron': { 
        gradient: 'from-emerald-500 to-green-500', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      }
    };
    return styles[role] || { 
      gradient: 'from-slate-500 to-slate-600', 
      bg: 'bg-slate-50', 
      text: 'text-slate-700',
      border: 'border-slate-200'
    };
  };

  const roleStyle = getRoleStyle(member.role);
  const isSupportStaff = member.role === 'teacher' || member.role === 'matron' || member.role === 'patron';

  return (
    <ModernModal open={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${roleStyle.gradient} p-8`}>
          <div className="flex items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={member.image || '/default-avatar.jpg'}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isSupportStaff && (
                <ModernBadge 
                  color="green" 
                  icon={FiClock}
                  className="absolute -bottom-2 -right-2 border-2 border-white"
                >
                  24/7
                </ModernBadge>
              )}
            </div>
            
            {/* Header Info */}
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-3 mb-3">
                <ModernBadge 
                  color={roleStyle.text.includes('blue') ? 'blue' : 
                         roleStyle.text.includes('purple') ? 'purple' : 
                         roleStyle.text.includes('emerald') ? 'green' : 'slate'}
                  className="px-4 py-2"
                >
                  {member.role || 'Team Member'}
                </ModernBadge>
                {isSupportStaff && (
                  <ModernBadge color="green" icon={FiClock}>
                    24/7 Available
                  </ModernBadge>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{member.name}</h2>
              <p className="text-white/90 text-lg mb-4">{member.title || member.role}</p>
              
              <div className="flex items-center gap-6">
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-white" size={18} />
                    <span className="text-white font-medium">{member.phone}</span>
                  </div>
                )}
                
                {member.email && (
                  <div className="flex items-center gap-2">
                    <FiMail className="text-white" size={18} />
                    <span className="text-white font-medium truncate max-w-[200px]">{member.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex px-8 pt-6 gap-6">
            {['overview', 'contact', 'availability'].map((tab) => (
              <button
                key={tab}
                className={`pb-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab 
                    ? `border-blue-600 text-blue-600` 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && <><FiUser className="inline mr-2" /> Overview</>}
                {tab === 'contact' && <><FiPhone className="inline mr-2" /> Contact</>}
                {tab === 'availability' && <><FiClock className="inline mr-2" /> Availability</>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">About</h3>
                <p className="text-slate-600 leading-relaxed">
                  {member.bio || `As a dedicated ${member.role}, ${member.name.split(' ')[0]} provides comprehensive support and guidance to students.`}
                </p>
              </div>
              
              {isSupportStaff && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Support Services</h3>
                  <ul className="space-y-2">
                    {['24/7 emergency support', 'Academic guidance', 'Personal development', 'Crisis intervention'].map((service, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600">
                        <div className={`w-2 h-2 rounded-full ${roleStyle.bg}`} />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-2 gap-4">
              {member.phone && (
                <ModernCard className="p-4">
                  <FiPhone className="text-blue-500 mb-3 text-xl" />
                  <h4 className="font-semibold text-slate-800 mb-1">Phone</h4>
                  <p className="text-slate-700 font-medium">{member.phone}</p>
                  <p className="text-slate-500 text-sm mt-2">Direct line for immediate assistance</p>
                </ModernCard>
              )}
              
              {member.email && (
                <ModernCard className="p-4">
                  <FiMail className="text-purple-500 mb-3 text-xl" />
                  <h4 className="font-semibold text-slate-800 mb-1">Email</h4>
                  <p className="text-slate-700 font-medium truncate">{member.email}</p>
                  <p className="text-slate-500 text-sm mt-2">Response within 24 hours</p>
                </ModernCard>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-4">
              <ModernCard className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h4 className="font-semibold text-slate-800 mb-4">Availability Schedule</h4>
                <div className="space-y-3">
                  {isSupportStaff ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-900">24/7 Emergency Support</span>
                          <span className="text-slate-500 text-sm ml-3">Always Available</span>
                        </div>
                        <span className="font-bold text-emerald-600">Active Now</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-900">Regular Consultation</span>
                          <span className="text-slate-500 text-sm ml-3">Scheduled</span>
                        </div>
                        <span className="font-bold text-slate-700">8:00 AM - 5:00 PM</span>
                      </div>
                    </>
                  ) : (
                    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <span className="font-medium text-slate-900">{day}</span>
                        <span className="font-bold text-slate-700">8:00 AM - 5:00 PM</span>
                      </div>
                    ))
                  )}
                </div>
              </ModernCard>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <ModernButton
              variant="secondary"
              size="md"
              icon={FiCopy}
              onClick={() => {
                const contactInfo = `${member.name}\n${member.title}\nPhone: ${member.phone}\nEmail: ${member.email}`;
                navigator.clipboard.writeText(contactInfo);
                toast.success('Contact info copied to clipboard');
              }}
            >
              Copy Contact
            </ModernButton>
            
            <div className="flex items-center gap-3">
              <ModernButton
                variant="outline"
                size="md"
                onClick={onClose}
              >
                Close
              </ModernButton>
              <ModernButton
                variant="primary"
                size="md"
                onClick={onContact}
              >
                Contact
              </ModernButton>
            </div>
          </div>
        </div>
      </div>
    </ModernModal>
  );
};

// Modern Detail Modal
const ModernDetailModal = ({ session, onClose, onContact }) => {
  if (!session) return null;

  const getCategoryStyle = (category) => {
    const styles = {
      academic: { gradient: 'from-blue-500 to-cyan-500', icon: FiTarget },
      emotional: { gradient: 'from-purple-500 to-pink-500', icon: FiHeart },
      devotion: { gradient: 'from-indigo-500 to-purple-500', icon: FiHeart },
      worship: { gradient: 'from-amber-500 to-orange-500', icon: FiMusic },
      support: { gradient: 'from-emerald-500 to-green-500', icon: FiPhoneCall },
      drugs: { gradient: 'from-red-500 to-rose-500', icon: FiAlertTriangle }
    };
    return styles[category] || { gradient: 'from-slate-500 to-slate-600', icon: FiBookOpen };
  };

  const categoryStyle = getCategoryStyle(session.category);
  const CategoryIcon = categoryStyle.icon;

  const formatFullDate = (dateString) => {
    if (dateString === 'Always Available' || dateString === 'Monday - Friday') {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ModernModal open={!!session} onClose={onClose} maxWidth="3xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${categoryStyle.gradient} p-8`}>
          <div className="flex items-start gap-6">
            <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-sm`}>
              <CategoryIcon className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <ModernBadge 
                  color="white"
                  className="bg-white/20 backdrop-blur-sm border-white/30"
                >
                  {session.category || 'Counseling'}
                </ModernBadge>
                {session.featured && (
                  <ModernBadge color="yellow" icon={IoSparkles}>
                    Featured
                  </ModernBadge>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">{session.title}</h2>
              <p className="text-white/90 text-lg">{session.type || 'Counseling Session'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ModernCard className="p-4 text-center">
                <FiCalendar className="text-blue-500 mx-auto mb-2 text-xl" />
                <p className="text-sm text-slate-500 mb-1">Date</p>
                <p className="font-semibold text-slate-800">{formatFullDate(session.date)}</p>
              </ModernCard>
              
              <ModernCard className="p-4 text-center">
                <FiClock className="text-emerald-500 mx-auto mb-2 text-xl" />
                <p className="text-sm text-slate-500 mb-1">Time</p>
                <p className="font-semibold text-slate-800">{session.time || 'Flexible'}</p>
              </ModernCard>
              
              <ModernCard className="p-4 text-center">
                <FiUser className="text-purple-500 mx-auto mb-2 text-xl" />
                <p className="text-sm text-slate-500 mb-1">Counselor</p>
                <p className="font-semibold text-slate-800">{session.counselor}</p>
              </ModernCard>
              
              <ModernCard className="p-4 text-center">
                <FiShield className="text-amber-500 mx-auto mb-2 text-xl" />
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <p className="font-semibold text-slate-800 capitalize">{session.status || 'scheduled'}</p>
              </ModernCard>
            </div>

            {/* Description */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">About this session</h3>
              <p className="text-slate-600 leading-relaxed">
                {session.description || 'Professional counseling and support session.'}
              </p>
            </ModernCard>

            {/* Support Info */}
            {session.isSupport && (
              <ModernCard className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <FiPhoneCall className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">24/7 Support Available</h3>
                    <p className="text-slate-600">Immediate assistance whenever you need it</p>
                  </div>
                </div>
                <div className="space-y-2 text-slate-700">
                  {['Available round the clock for emergencies', 'Confidential and secure conversations', 'Trained professional counselors'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </ModernCard>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-3">
            <ModernButton
              variant={session.isSupport ? 'success' : 'primary'}
              size="lg"
              icon={session.isSupport ? FiPhoneCall : FiCalendar}
              className="flex-1"
              onClick={session.isSupport ? onContact : () => {
                // Add to calendar logic
                toast.success('Opening Google Calendar...');
              }}
            >
              {session.isSupport ? 'Contact Support' : 'Join Session'}
            </ModernButton>
            
            <ModernButton
              variant="outline"
              size="lg"
              onClick={onClose}
            >
              Close
            </ModernButton>
          </div>
        </div>
      </div>
    </ModernModal>
  );
};

// Modern Stats Card
const ModernStatCard = ({ stat }) => {
  const Icon = stat.icon;
  
  return (
    <ModernCard className="p-5 text-center">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 mb-4`}>
        <Icon className={`text-xl ${stat.gradient.includes('blue') ? 'text-blue-600' : 
                            stat.gradient.includes('emerald') ? 'text-emerald-600' :
                            stat.gradient.includes('purple') ? 'text-purple-600' :
                            'text-amber-600'}`} />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.number}</h3>
      <p className="text-sm font-medium text-slate-700 mb-1">{stat.label}</p>
      <p className="text-xs text-slate-500">{stat.sublabel}</p>
    </ModernCard>
  );
};

// Helper functions
function getNextThursday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysUntilThursday);
  return nextThursday.toISOString().split('T')[0];
}

function getNextSunday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSunday = (0 - dayOfWeek + 7) % 7 || 7;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  return nextSunday.toISOString().split('T')[0];
}

// Default sessions
const DEFAULT_SESSIONS = [
  {
    id: 'devotion-thursday',
    title: 'Thursday Devotion Session',
    counselor: 'School Chaplain',
    date: getNextThursday(),
    time: '10:00 AM - 11:00 AM',
    type: 'Spiritual Session',
    category: 'devotion',
    status: 'scheduled',
    description: 'Weekly devotion session to strengthen students in religious study and worship.',
    priority: 'high',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    featured: true,
    location: 'School Chapel'
  },
  {
    id: 'devotion-sunday',
    title: 'Sunday Youth Worship',
    counselor: 'Youth Leaders & CU',
    date: getNextSunday(),
    time: '2:00 PM - 4:00 PM',
    type: 'Youth Worship',
    category: 'worship',
    status: 'scheduled',
    description: 'Youth worship session with CU and YCS active worship groups.',
    priority: 'high',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    featured: true,
    location: 'Katwanyaa Church'
  }
];

// Main Component
export default function StudentCounseling() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [counselingSessions, setCounselingSessions] = useState(DEFAULT_SESSIONS);
  const [teamMembers, setTeamMembers] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarkedSessions, setBookmarkedSessions] = useState(new Set());
  const [selectedMember, setSelectedMember] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Stats
  const [stats] = useState([
    { 
      icon: FiCalendar, 
      number: '15+', 
      label: 'Active Sessions', 
      sublabel: 'This month',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: FiPhoneCall, 
      number: '24/7', 
      label: 'Support', 
      sublabel: 'Always available',
      gradient: 'from-emerald-500 to-green-500'
    },
    { 
      icon: FiShield, 
      number: '100%', 
      label: 'Confidential', 
      sublabel: 'All sessions',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: FiUsers, 
      number: '8', 
      label: 'Categories', 
      sublabel: 'Available support',
      gradient: 'from-amber-500 to-orange-500'
    }
  ]);

  // Categories
  const categoryOptions = [
    { id: 'all', name: 'All Sessions', icon: FiBookOpen },
    { id: 'academic', name: 'Academic', icon: FiTarget },
    { id: 'emotional', name: 'Emotional', icon: FiHeart },
    { id: 'devotion', name: 'Devotion', icon: FiHeart },
    { id: 'worship', name: 'Worship', icon: FiMusic },
    { id: 'support', name: '24/7 Support', icon: FiPhoneCall },
    { id: 'drugs', name: 'Drug Awareness', icon: FiAlertTriangle }
  ];

  // Filter sessions
  const filteredSessions = counselingSessions.filter(session => {
    const matchesTab = activeTab === 'all' || session.category === activeTab;
    const matchesSearch = searchTerm === '' || 
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.counselor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleBookmark = (session) => {
    const newBookmarked = new Set(bookmarkedSessions);
    if (newBookmarked.has(session.id)) {
      newBookmarked.delete(session.id);
      toast.success('Removed from bookmarks');
    } else {
      newBookmarked.add(session.id);
      toast.success('Bookmarked session');
    }
    setBookmarkedSessions(newBookmarked);
  };

  const handleContactSupport = (member) => {
    toast.success(`Viewing ${member?.name || 'support'} profile`);
  };

  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      toast.success('Data refreshed!');
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <Box className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Stack spacing={3} alignItems="center" className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
          <Box className="relative flex items-center justify-center">
            <CircularProgress
              variant="determinate"
              value={100}
              size={64}
              thickness={4}
              sx={{ color: '#f1f5f9' }}
            />
            <CircularProgress
              variant="indeterminate"
              disableShrink
              size={64}
              thickness={4}
              sx={{
                color: '#2563eb',
                animationDuration: '800ms',
                position: 'absolute',
                left: 0,
              }}
            />
            <Box className="absolute">
              <IoSparkles className="text-blue-500 text-xl animate-pulse" />
            </Box>
          </Box>
          <Stack spacing={0.5} alignItems="center">
            <Typography variant="body1" fontWeight="600" color="text.primary">
              Loading Guidance and Counseling sessions...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fetching latest sessions and team information
            </Typography>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <ModernBadge color="purple" icon={FiHeart} className="mb-3">
              Student Support
            </ModernBadge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Guidance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Counseling</span>
            </h1>
            <p className="text-slate-600">
              Professional support for academic, emotional, and spiritual well-being
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ModernButton
              variant="secondary"
              icon={FiRotateCw}
              onClick={refreshData}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </ModernButton>
            
            <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <ModernStatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FiHeart className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Counseling Sessions</h2>
                <p className="text-sm text-slate-500">{filteredSessions.length} Sessions Available</p>
              </div>
            </div>

            {/* Search & Filter */}
            <ModernCard className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <ModernButton
                  variant="outline"
                  icon={FiX}
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                  }}
                >
                  Clear
                </ModernButton>
              </div>
            </ModernCard>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <ModernButton
                  key={category.id}
                  variant={activeTab === category.id ? 'primary' : 'outline'}
                  size="sm"
                  icon={category.icon}
                  onClick={() => setActiveTab(category.id)}
                >
                  {category.name}
                </ModernButton>
              ))}
            </div>

            {/* Sessions */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredSessions.map((session) => (
                <ModernCounselingCard 
                  key={session.id} 
                  session={session} 
                  onView={setSelectedSession}
                  onBookmark={handleBookmark}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-80 space-y-6">
            {/* Quick Actions */}
            <ModernCard className="p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <ModernButton
                  variant="danger"
                  icon={FiPhoneCall}
                  className="w-full"
                  onClick={() => toast.info('Emergency contact feature coming soon!')}
                >
                  Emergency Contact
                </ModernButton>
                
                <ModernButton
                  variant="primary"
                  icon={FiCalendar}
                  className="w-full"
                  onClick={() => toast.info('Schedule session feature coming soon!')}
                >
                  Schedule Session
                </ModernButton>
                
                <ModernButton
                  variant="success"
                  icon={FiBookOpen}
                  className="w-full"
                  onClick={() => toast.info('Resources feature coming soon!')}
                >
                  Resources
                </ModernButton>
              </div>
            </ModernCard>

            {/* Team Section */}
            <ModernCard className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <FiUsers className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Support Team</h3>
                  <p className="text-sm text-slate-500">Professional counselors</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {teamMembers.slice(0, 3).map((member) => (
                  <ModernSupportTeamCard
                    key={member.id}
                    member={member}
                    onView={() => {
                      setSelectedMember(member);
                      setIsTeamModalOpen(true);
                    }}
                    onContact={handleContactSupport}
                    viewMode="list"
                  />
                ))}
              </div>
            </ModernCard>

            {/* Confidentiality */}
            <ModernCard className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <FiShield className="text-white text-2xl" />
              </div>
              <h4 className="text-lg font-semibold mb-2">100% Confidential</h4>
              <p className="text-purple-200 text-sm">
                All sessions are private and secure. Your information is protected.
              </p>
            </ModernCard>
          </div>
        </div>

        {/* Feature Banner */}
        <ModernCard className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiHeart className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Your Well-being Matters</h3>
              <p className="text-blue-100">
                Professional support for academic success, emotional health, and personal growth.
              </p>
            </div>
            <ModernButton variant="secondary" className="bg-white text-blue-600">
              Learn More
            </ModernButton>
          </div>
        </ModernCard>
      </div>

      {/* Modals */}
      {selectedSession && (
        <ModernDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onContact={handleContactSupport}
        />
      )}

      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          isOpen={isTeamModalOpen}
          onClose={() => {
            setIsTeamModalOpen(false);
            setSelectedMember(null);
          }}
          onContact={handleContactSupport}
        />
      )}
    </div>
  );
}