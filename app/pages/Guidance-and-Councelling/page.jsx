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
  FiBell,FiUserPlus 
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

// Modern Modal Component with Glass Morphism (Same as events)
const ModernModal = ({ children, open, onClose, maxWidth = '800px', blur = true }) => {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${blur ? 'backdrop-blur-md' : 'bg-black/50'}`}>
      <div 
        className="relative bg-white/95 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/40"
        style={{ 
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white cursor-pointer border border-gray-200 shadow-sm"
          >
            <FiX className="text-gray-600 w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Modern Card Component
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-black/5 ${className}`}>
    {children}
  </div>
);

// Modern Counseling Card with Enhanced Design
const ModernCounselingCard = ({ session, onView, onBookmark, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
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

  // Modern Grid View (Modernized & Static)
  if (viewMode === 'grid') {
    const theme = getCategoryStyle(session.category);
    
    return (
      <div 
        onClick={() => onView(session)}
        className="relative bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden cursor-pointer"
      >
        {/* 1. Static Image Header */}
        <div className="relative h-52 w-full shrink-0">
          {session.image ? (
            <img
              src={session.image}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient}`} />
          )}
          
          {/* Permanent Badges (Top Left) */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${theme.bg} ${theme.text} ${theme.border}`}>
              {session.category || 'Counseling'}
            </span>
            {session.featured && (
              <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <IoSparkles className="text-amber-400" /> Featured
              </span>
            )}
            {session.isSupport && (
              <span className="px-3 py-1 bg-emerald-900/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <FiPhoneCall className="text-emerald-300" /> 24/7 Support
              </span>
            )}
          </div>

          {/* Permanent Bookmark Button (Top Right) */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(session);
              }}
              className={`p-2.5 rounded-xl backdrop-blur-md border shadow-sm ${
                isBookmarked 
                  ? 'bg-amber-500 border-amber-500 text-white' 
                  : 'bg-white/90 border-white/10 text-slate-700'
              }`}
            >
              <FiBookmark className={isBookmarked ? 'fill-current' : ''} size={16} />
            </button>
          </div>

          {/* Counselor Info (Bottom) */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              {session.counselor || 'School Counselor'}
            </span>
          </div>
        </div>

        {/* 2. Content Area */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
            {session.title}
          </h3>
          
          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
            {session.description || 'Professional counseling and support session for students.'}
          </p>

          {/* 3. Bento-Style Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/50">
              <div className={`p-1.5 rounded-lg ${theme.iconBg}`}>
                <FiCalendar className={`${theme.iconColor}`} size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                {formatDate(session.date)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/50">
              <div className={`p-1.5 rounded-lg ${theme.iconBg}`}>
                <FiClock className={`${theme.iconColor}`} size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                {session.time || 'Flexible'}
              </span>
            </div>

            <div className="col-span-2 flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/50">
              <div className={`p-1.5 rounded-lg ${theme.iconBg}`}>
                <FiUser className={`${theme.iconColor}`} size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                {session.type || 'Counseling Session'}
              </span>
            </div>
          </div>

          {/* 4. Priority Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                session.priority === 'high' ? 'bg-red-500 animate-pulse' :
                session.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {session.priority || 'medium'} priority
              </span>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              session.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
              session.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {session.status || 'Upcoming'}
            </div>
          </div>

          {/* 5. Final Action Button */}
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            View Details
            <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div 
      onClick={() => onView(session)}
      className="relative bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm cursor-pointer transition-colors active:bg-slate-50"
    >
      <div className="flex gap-5">
        {/* Image Container */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm">
          {session.image ? (
            <img
              src={session.image}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(session.category).gradient}`} />
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Metadata Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  getCategoryStyle(session.category).bg
                } ${getCategoryStyle(session.category).text} ${
                  getCategoryStyle(session.category).border
                }`}>
                  {session.category || 'Support'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {formatDate(session.date)}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(session);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                  }`}
                >
                  <FiBookmark className={isBookmarked ? 'fill-current' : ''} size={14} />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
              {session.title}
            </h3>

            <p className="text-slate-500 text-xs line-clamp-2 mb-3">
              {session.description}
            </p>
          </div>

          {/* Footer: Details & Action */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <FiUser className="text-slate-400" size={12} />
                <span className="font-semibold">{session.counselor}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="text-slate-400" size={12} />
                <span>{session.time}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-blue-600 font-bold text-[11px] uppercase tracking-wider">
              View
              <FiArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Support Team Card
const ModernSupportTeamCard = ({ member, onView, onContact, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getRoleStyle = (role) => {
    const styles = {
      'teacher': { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        label: 'Teacher'
      },
      'matron': { 
        gradient: 'from-purple-500 to-pink-500', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        label: 'Matron'
      },
      'patron': { 
        gradient: 'from-emerald-500 to-green-500', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        label: 'Patron'
      },
      'Guidance Teacher': { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        label: 'Guidance Teacher'
      },
      'HOD Guidance and councelling teacher': { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        label: 'HOD Guidance'
      }
    };
    return styles[role] || { 
      gradient: 'from-slate-500 to-slate-600', 
      bg: 'bg-slate-50', 
      text: 'text-slate-700',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      label: role || 'Team Member'
    };
  };

  const roleStyle = getRoleStyle(member.role);
  
  // Grid View (EXACTLY like the Event Card)
  if (viewMode === 'grid') {
    return (
      <div 
        onClick={() => onView(member)}
        className="relative bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. Static Image Header - EXACTLY like Event Card */}
        <div className="relative h-52 w-full shrink-0 overflow-hidden">
          <img
            src={member.image || '/default-avatar.jpg'}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-100 transition-transform duration-500"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Permanent Badges (Top Left) - EXACTLY like Event Card */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border backdrop-blur-sm ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
              {roleStyle.label}
            </span>
            
            {/* Priority Badge for Support Staff */}
            {(member.role === 'teacher' || member.role === 'matron' || member.role === 'patron') && (
              <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm border border-emerald-300/20">
                <FiClock className="text-white" size={12} /> 24/7 Available
              </span>
            )}
          </div>

          {/* Bookmark Button (Top Right) - EXACTLY like Event Card */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
                // You can add bookmark functionality for staff if needed
              }}
              className={`p-2.5 rounded-xl backdrop-blur-md border shadow-sm transition-all ${
                isBookmarked 
                  ? 'bg-amber-500 border-amber-500 text-white' 
                  : 'bg-white/90 border-white/10 text-slate-700 hover:bg-white'
              }`}
            >
              <FiUserPlus className={isBookmarked ? 'fill-current' : ''} size={16} />
            </button>
          </div>

          {/* Staff Title (Bottom) */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              {member.title || roleStyle.label}
            </span>
          </div>
        </div>

        {/* 2. Content Area - EXACTLY like Event Card */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 leading-tight">
            {member.name}
          </h3>
          
          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
            {member.bio || 'Dedicated professional providing guidance and support to students.'}
          </p>

          {/* 3. Bento-Style Info Grid - EXACTLY like Event Card */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {member.phone && (
              <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className={`p-1.5 rounded-lg ${roleStyle.iconBg}`}>
                  <FiPhone className={`${roleStyle.iconColor}`} size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                  {member.phone}
                </span>
              </div>
            )}

            {member.email && (
              <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className={`p-1.5 rounded-lg ${roleStyle.iconBg}`}>
                  <FiMail className={`${roleStyle.iconColor}`} size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                  Email
                </span>
              </div>
            )}

            <div className="col-span-2 flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100/50">
              <div className={`p-1.5 rounded-lg ${roleStyle.iconBg}`}>
                <FiUser className={`${roleStyle.iconColor}`} size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                {member.role || 'Support Staff'}
              </span>
            </div>
          </div>

          {/* 4. Status Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                (member.role === 'teacher' || member.role === 'matron' || member.role === 'patron') 
                  ? 'bg-emerald-500 animate-pulse' 
                  : 'bg-blue-500'
              }`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {(member.role === 'teacher' || member.role === 'matron' || member.role === 'patron') 
                  ? '24/7 Support' 
                  : 'Available'}
              </span>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200`}>
              Active
            </div>
          </div>

          {/* 5. Final Action Button - EXACTLY like Event Card */}
          <button 
                 onClick={() => onView(member)}

            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:shadow-lg"
          >
View profile    </button>
        </div>
      </div>
    );
  }

  // List View (if needed, matches Event Card list view)
  return (
    <div 
      onClick={() => onView(member)}
      className="relative bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm cursor-pointer transition-colors active:bg-slate-50"
    >
      <div className="flex gap-5">
        {/* Image Container */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm">
          <img
            src={member.image || '/default-avatar.jpg'}
            alt={member.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Metadata Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                  {roleStyle.label}
                </span>
                {(member.role === 'teacher' || member.role === 'matron' || member.role === 'patron') && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold">
                    24/7
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
              {member.name}
            </h3>
            
            <p className="text-slate-500 text-xs line-clamp-1 mb-2">
              {member.title || roleStyle.label}
            </p>

            <p className="text-slate-500 text-xs line-clamp-2 mb-3">
              {member.bio?.substring(0, 100) || 'Dedicated professional providing guidance and support to students.'}
            </p>
          </div>

          {/* Footer: Details & Action */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {member.phone && (
                <div className="flex items-center gap-1">
                  <FiPhone className="text-slate-400" size={12} />
                  <span className="font-semibold">{member.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-blue-600 font-bold text-[11px] uppercase tracking-wider">
              Contact
              <FiArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Team Member Modal (when clicked)
const TeamMemberModal = ({ member, isOpen, onClose, onContact }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !member) return null;

  const getRoleStyle = (role) => {
    const styles = {
      'teacher': { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Teacher'
      },
      'matron': { 
        gradient: 'from-purple-500 to-pink-500', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        label: 'Matron'
      },
      'patron': { 
        gradient: 'from-emerald-500 to-green-500', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Patron'
      }
    };
    return styles[role] || { 
      gradient: 'from-slate-500 to-slate-600', 
      bg: 'bg-slate-50', 
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: role || 'Team Member'
    };
  };

  const roleStyle = getRoleStyle(member.role);
  const isSupportStaff = member.role === 'teacher' || member.role === 'matron' || member.role === 'patron';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal - EXACTLY like Event Card Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`relative h-64 bg-gradient-to-r ${roleStyle.gradient} p-8`}>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <FiX size={20} />
            </button>
            
            <div className="flex items-start gap-6 h-full">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src={member.image || '/default-avatar.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isSupportStaff && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border-2 border-white">
                    <FiClock size={10} /> 24/7
                  </div>
                )}
              </div>
              
              {/* Header Info */}
              <div className="flex-1 pt-8">
                <div className="flex items-center gap-4 mb-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                    {roleStyle.label}
                  </span>
                  {isSupportStaff && (
                    <span className="px-3 py-1 bg-emerald-500/90 text-white rounded-full text-xs font-bold flex items-center gap-1">
                      <FiClock size={12} /> 24/7 Available
                    </span>
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">{member.name}</h2>
                <p className="text-white/90 text-lg">{member.title || roleStyle.label}</p>
                
                <div className="flex items-center gap-6 mt-6">
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
            <div className="flex px-8 pt-6 gap-8">
              <button
                className={`pb-3 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'overview' 
                    ? `border-blue-500 text-blue-600` 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                <FiUser className="inline mr-2" />
                Overview
              </button>
              <button
                className={`pb-3 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'contact' 
                    ? `border-blue-500 text-blue-600` 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('contact')}
              >
                <FiPhone className="inline mr-2" />
                Contact Info
              </button>
              <button
                className={`pb-3 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'availability' 
                    ? `border-blue-500 text-blue-600` 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('availability')}
              >
                <FiClock className="inline mr-2" />
                Availability
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[400px] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">About</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {member.bio || `As a dedicated ${roleStyle.label}, ${member.name.split(' ')[0]} provides comprehensive support and guidance to students. With a focus on student wellbeing and success, they offer personalized assistance and resources.`}
                  </p>
                </div>
                
                {isSupportStaff && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Support Services</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3 text-slate-600">
                        <div className={`w-2 h-2 rounded-full ${roleStyle.bg}`} />
                        24/7 emergency support and counseling
                      </li>
                      <li className="flex items-center gap-3 text-slate-600">
                        <div className={`w-2 h-2 rounded-full ${roleStyle.bg}`} />
                        Academic guidance and mentorship
                      </li>
                      <li className="flex items-center gap-3 text-slate-600">
                        <div className={`w-2 h-2 rounded-full ${roleStyle.bg}`} />
                        Personal development and wellbeing support
                      </li>
                      <li className="flex items-center gap-3 text-slate-600">
                        <div className={`w-2 h-2 rounded-full ${roleStyle.bg}`} />
                        Crisis intervention and conflict resolution
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {member.phone && (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <FiPhone className="text-blue-500 mb-3" size={24} />
                      <h4 className="font-bold text-slate-900 mb-1">Phone</h4>
                      <p className="text-slate-700 font-medium">{member.phone}</p>
                      <p className="text-slate-500 text-sm mt-2">Direct line for immediate assistance</p>
                    </div>
                  )}
                  
                  {member.email && (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <FiMail className="text-purple-500 mb-3" size={24} />
                      <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                      <p className="text-slate-700 font-medium truncate">{member.email}</p>
                      <p className="text-slate-500 text-sm mt-2">Response within 24 hours</p>
                    </div>
                  )}
                  
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <FiUser className="text-emerald-500 mb-3" size={24} />
                    <h4 className="font-bold text-slate-900 mb-1">Role</h4>
                    <p className="text-slate-700 font-medium">{member.title || roleStyle.label}</p>
                    <p className="text-slate-500 text-sm mt-2">Support Staff Member</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <FiShield className="text-amber-500 mb-3" size={24} />
                    <h4 className="font-bold text-slate-900 mb-1">Status</h4>
                    <p className="text-slate-700 font-medium">
                      {isSupportStaff ? '24/7 Available' : 'Available'}
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      {isSupportStaff ? 'Always available for emergencies' : 'Regular working hours'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                  <h4 className="font-bold text-slate-900 mb-3">Availability Schedule</h4>
                  <div className="space-y-3">
                    {isSupportStaff ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                          <div>
                            <span className="font-medium text-slate-900">24/7 Emergency Support</span>
                            <span className="text-slate-500 text-sm ml-3">Always Available</span>
                          </div>
                          <span className="font-bold text-emerald-600">Active Now</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                          <div>
                            <span className="font-medium text-slate-900">Regular Consultation</span>
                            <span className="text-slate-500 text-sm ml-3">Scheduled</span>
                          </div>
                          <span className="font-bold text-slate-700">8:00 AM - 5:00 PM</span>
                        </div>
                      </>
                    ) : (
                      [
                        { day: 'Monday', time: '8:00 AM - 5:00 PM' },
                        { day: 'Tuesday', time: '8:00 AM - 5:00 PM' },
                        { day: 'Wednesday', time: '8:00 AM - 5:00 PM' },
                        { day: 'Thursday', time: '8:00 AM - 5:00 PM' },
                        { day: 'Friday', time: '8:00 AM - 4:00 PM' }
                      ].map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                          <div>
                            <span className="font-medium text-slate-900">{schedule.day}</span>
                          </div>
                          <span className="font-bold text-slate-700">{schedule.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {isSupportStaff && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <FiAlertTriangle className="text-emerald-600" />
                      <p className="text-sm text-emerald-800">
                        <strong>24/7 Emergency Support:</strong> For urgent matters, always available via the phone number above.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  // Copy contact info to clipboard
                  const contactInfo = `${member.name}\n${member.title}\nPhone: ${member.phone}\nEmail: ${member.email}`;
                  navigator.clipboard.writeText(contactInfo);
                  toast.success('Contact info copied to clipboard');
                }}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-50"
              >
                <FiCopy size={16} />
                Copy Contact
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
                >
                  Close
                </button>
        
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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

  // Function to add session to Google Calendar
  const addSessionToGoogleCalendar = () => {
    if (!session) return;
    
    // Format date and time for Google Calendar
    const formatDateForGoogle = (dateString, timeString) => {
      if (dateString === 'Always Available' || dateString === 'Monday - Friday') {
        // For always available sessions, use today's date with 1 hour duration
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
        return {
          start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
          end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        };
      }
      
      try {
        // Parse the date and time
        const date = new Date(dateString);
        const timeParts = timeString?.match(/(\d+):(\d+)\s*(AM|PM)/i);
        
        if (timeParts) {
          let [_, hours, minutes, period] = timeParts;
          hours = parseInt(hours);
          minutes = parseInt(minutes);
          
          // Convert to 24-hour format
          if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
          if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
          
          date.setHours(hours, minutes, 0, 0);
          
          // Assume 1 hour duration if no end time specified
          const endDate = new Date(date.getTime() + 60 * 60 * 1000);
          
          return {
            start: date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
            end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
          };
        }
        
        // Default: use the date with current time for 1 hour
        const startDate = new Date(dateString);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        return {
          start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
          end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        };
      } catch (error) {
        console.error('Error parsing date:', error);
        // Fallback to current date/time
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        return {
          start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
          end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        };
      }
    };

    const { start, end } = formatDateForGoogle(session.date, session.time);
    
    // Create Google Calendar URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(session.title)}&dates=${start}/${end}&details=${encodeURIComponent(session.description || 'Join this counseling session')}&location=${encodeURIComponent(session.location || 'Guidance Office')}&sf=true&output=xml`;
    
    // Open Google Calendar in a new tab
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    
    // Show success message
    toast.success('Opening Google Calendar to add this session...');
  };

return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/90 backdrop-blur-sm">
    <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
      
      {/* Close Button - Scaled for mobile */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50 p-2 bg-black/20 backdrop-blur-md text-white rounded-full border border-white/20 transition-all active:scale-90"
      >
        <IoClose size={20} className="sm:size-[24px]" />
      </button>

      {/* 1. Hero Image - Reduced height on mobile */}
      <div className="relative h-[30vh] sm:h-[350px] w-full shrink-0">
        {session.image ? (
          <img
            src={session.image}
            alt={session.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${categoryStyle.gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        
        {/* Badge Overlays - Smaller on mobile */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap gap-2">
          <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white shadow-xl rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-900">
            {session.category || 'Counseling'}
          </span>
          {session.featured && (
            <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-slate-900 text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <IoSparkles className="text-amber-400" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* 2. Content Area - Adjusted padding */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-10 bg-white">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Title & Category - Scaled text */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r ${categoryStyle.gradient}`}>
                <CategoryIcon className="text-white text-xl sm:text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                  {session.title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-lg">{session.type || 'Counseling Session'}</p>
              </div>
            </div>

            {/* Quick Info Bar - Compact on mobile */}
            <div className="flex flex-wrap gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <IoCalendarClearOutline className="text-blue-500 text-base sm:text-lg" />
                {formatFullDate(session.date)}
              </div>
              <div className="flex items-center gap-1.5">
                <IoTimeOutline className="text-emerald-500 text-base sm:text-lg" />
                {session.time || 'Flexible'}
              </div>
              <div className="flex items-center gap-1.5">
                <IoPersonOutline className="text-purple-500 text-base sm:text-lg" />
                <span className="truncate max-w-[120px] sm:max-w-none">{session.counselor || 'Counselor'}</span>
              </div>
            </div>
          </section>

          {/* Description Block - Scaled text */}
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">About this session</h3>
            <div className="text-slate-700 leading-relaxed text-sm sm:text-lg">
              {session.description || 'Professional counseling and support session.'}
            </div>
          </section>

          {/* Session Stats Grid - Smaller cards on mobile */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {[
              { label: 'Priority', val: session.priority || 'medium', icon: null, color: session.priority === 'high' ? 'bg-red-500' : 'bg-green-500' },
              { label: 'Status', val: session.status || 'scheduled', icon: <FiCalendar size={14} />, color: 'bg-green-100 text-green-600' },
              { label: 'Security', val: 'Secure', icon: <FiShield size={14} />, color: 'bg-purple-100 text-purple-600' },
              { label: 'Rating', val: '4.8/5.0', icon: <FiStar size={14} />, color: 'bg-amber-100 text-amber-600' }
            ].map((stat, i) => (
              <div key={i} className="p-3 sm:p-4 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  {stat.icon ? (
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${stat.color} flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                  )}
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">{stat.label}</p>
                </div>
                <p className="font-bold text-xs sm:text-base text-slate-900 capitalize">{stat.val}</p>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* 3. Action Footer - Fluid buttons */}
      <div className="shrink-0 p-4 sm:p-6 bg-slate-50/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
          <button
            onClick={session.isSupport ? onContact : addSessionToGoogleCalendar}
            className="flex-[2] h-12 sm:h-14 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {session.isSupport ? <FiPhoneCall size={18} /> : <FiCalendar size={18} />}
            {session.isSupport ? 'Contact Support' : 'Join Session'}
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 h-12 sm:h-14 bg-white border-2 border-slate-200 text-slate-900 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <IoClose size={18} />
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

// Stats Card Component (Modernized)
const ModernStatCard = ({ stat }) => {
  const Icon = stat.icon;
  
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-white border border-slate-100 p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm">
      {/* Top Section: Icon & Badge */}
      <div className="flex items-start justify-between mb-4 md:mb-8">
        <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.gradient} bg-opacity-[0.08] text-slate-700`}>
          <Icon className="text-lg md:text-2xl" />
        </div>
        
        {/* Status Dot */}
        <div className="hidden xs:block h-2 w-2 rounded-full bg-slate-200" />
      </div>

      {/* Content Section */}
      <div className="space-y-1">
        {/* Label */}
        <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {stat.label}
        </p>
        
        <div className="flex items-baseline gap-1">
          {/* Number */}
          <h3 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            {stat.number}
          </h3>
        </div>

        {/* Sublabel */}
        <p className="text-[10px] md:text-sm font-medium text-slate-500 leading-tight line-clamp-1 md:line-clamp-none">
          {stat.sublabel}
        </p>
      </div>

      {/* Decorative Background Element */}
      <div className={`absolute -bottom-2 -right-2 w-12 h-12 md:w-20 md:h-20 opacity-[0.03] rounded-full bg-gradient-to-br ${stat.gradient} hidden md:block`} />
    </div>
  );
};

// Helper functions for default sessions
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

// API utility functions
const fetchGuidanceSessions = async () => {
  try {
    const response = await fetch('/api/guidance');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.success && data.events) {
      return data.events;
    }
    return [];
  } catch (error) {
    console.error('Error fetching guidance sessions:', error);
    toast.error('Failed to load guidance sessions');
    return [];
  }
};

// Fetch team members from API
const fetchTeamMembers = async () => {
  try {
    const response = await fetch('/api/guidanceteam');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.success && data.members) {
      // Process team members to ensure image paths are complete
      return data.members.map(member => ({
        ...member,
        image: member.image ? member.image.startsWith('/') ? member.image : `/${member.image}` : null,
        isSupport: member.role === 'teacher' || member.role === 'matron' || member.role === 'patron'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    toast.error('Failed to load team members');
    return [];
  }
};

// Transform API data to match session format
const transformApiDataToSessions = (apiEvents) => {
  return apiEvents.map(event => ({
    id: event.id,
    title: `${event.counselor} - ${event.category} Session`,
    counselor: event.counselor,
    date: event.date.split('T')[0], // Extract date part
    time: event.time || 'Flexible',
    type: event.type || 'Guidance Session',
    category: event.category?.toLowerCase() || 'academic',
    status: 'scheduled',
    description: event.description || 'Professional guidance and counseling session.',
    notes: event.notes || '',
    priority: event.priority?.toLowerCase() || 'medium',
    image: event.image || null,
    featured: false,
    location: 'Guidance Office',
    isSupport: false
  }));
};

// Default Devotion sessions (static, not from API)
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
    description: 'Weekly devotion session to strengthen students in religious study and worship. Strengthen your faith and build spiritual resilience.',
    notes: 'Focus on spiritual growth and moral development. Bring your Bible and notebook.',
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
    description: 'Youth worship session with CU and YCS active worship groups. Experience powerful praise and worship with fellow students.',
    notes: 'Music, praise, and fellowship. All students welcome.',
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
  const [counselingSessions, setCounselingSessions] = useState([]);
  const [guidanceSessions, setGuidanceSessions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarkedSessions, setBookmarkedSessions] = useState(new Set());
  const [selectedMember, setSelectedMember] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);


  // Dynamic stats based on team data
  const [stats, setStats] = useState([
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

  // Categories for filtering
  const categoryOptions = [
    { id: 'all', name: 'All Sessions', icon: FiBookOpen, gradient: 'from-slate-500 to-slate-600' },
    { id: 'academic', name: 'Academic', icon: FiTarget, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'emotional', name: 'Emotional', icon: FiHeart, gradient: 'from-purple-500 to-pink-500' },
    { id: 'devotion', name: 'Devotion', icon: FiHeart, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'worship', name: 'Worship', icon: FiMusic, gradient: 'from-amber-500 to-orange-500' },
    { id: 'support', name: '24/7 Support', icon: FiPhoneCall, gradient: 'from-emerald-500 to-green-500' },
    { id: 'drugs', name: 'Drug Awareness', icon: FiAlertTriangle, gradient: 'from-red-500 to-rose-500' }
  ];

  // Load guidance sessions and team members from API
  const loadData = async () => {
    try {
      // Load guidance sessions from API
      const apiSessions = await fetchGuidanceSessions();
      const transformedSessions = transformApiDataToSessions(apiSessions);
      setGuidanceSessions(transformedSessions);
      
      // Combine default sessions with API sessions and support sessions
      const allSessions = [
        ...DEFAULT_SESSIONS,
        ...transformedSessions
      ];
      setCounselingSessions(allSessions);
      
      // Extract unique categories from combined sessions
      const uniqueCategories = [...new Set(allSessions.map(s => s.category))];
      setCategories(uniqueCategories);
      
      // Load team members from API
      const teamData = await fetchTeamMembers();
      setTeamMembers(teamData);
      
      // Update stats with dynamic data from team
      const teacherCount = teamData.filter(m => m.role === 'teacher').length;
      const matronCount = teamData.filter(m => m.role === 'matron').length;
      const patronCount = teamData.filter(m => m.role === 'patron').length;
      
      // Update stats with dynamic information
      setStats([
        { 
          icon: FiCalendar, 
          number: allSessions.length.toString(), 
          label: 'Total Sessions', 
          sublabel: 'All categories',
          gradient: 'from-blue-500 to-cyan-500'
        },
        { 
          icon: FiPhoneCall, 
          number: (matronCount + patronCount).toString(), 
          label: 'Support Staff', 
          sublabel: 'Matrons & Patrons',
          gradient: 'from-emerald-500 to-green-500'
        },
        { 
          icon: FiShield, 
          number: teacherCount.toString(), 
          label: 'Teachers', 
          sublabel: 'Guidance Counselors',
          gradient: 'from-purple-500 to-pink-500'
        },
        { 
          icon: FiUsers, 
          number: teamData.length.toString(), 
          label: 'Team Members', 
          sublabel: 'Total support team',
          gradient: 'from-amber-500 to-orange-500'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to default sessions only
      const allSessions = [...DEFAULT_SESSIONS];
      setCounselingSessions(allSessions);
      setGuidanceSessions([]);
      setTeamMembers([]);
    }
  };

  // Simulate data loading
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await loadData();
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load some data');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Filter sessions
  const filteredSessions = counselingSessions.filter(session => {
    const matchesTab = activeTab === 'all' || session.category === activeTab;
    const matchesSearch = searchTerm === '' || 
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.counselor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase());
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
    toast.success(`viewing ${member.name} profile`);
    // Implement actual contact logic here
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadData();
      toast.success('Data refreshed!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Function to add new session from modal
  const addSessionToCalendar = (newSessionData) => {
    // Transform the new session data to match our format
    const newSession = {
      id: `guidance-${Date.now()}`, // Generate unique ID
      title: `${newSessionData.counselor} - ${newSessionData.category} Session`,
      counselor: newSessionData.counselor,
      date: newSessionData.date || new Date().toISOString().split('T')[0],
      time: newSessionData.time || 'Flexible',
      type: newSessionData.type || 'Guidance Session',
      category: newSessionData.category?.toLowerCase() || 'academic',
      status: 'scheduled',
      description: newSessionData.description || 'Professional guidance and counseling session.',
      notes: newSessionData.notes || '',
      priority: newSessionData.priority?.toLowerCase() || 'medium',
      image: newSessionData.image || null,
      featured: false,
      location: newSessionData.location || 'Guidance Office',
      isSupport: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to guidance sessions
    setGuidanceSessions(prev => [newSession, ...prev]);
    
    // Add to combined counseling sessions
    setCounselingSessions(prev => [newSession, ...prev]);
    
    toast.success('Session added to calendar!');
  };

if (loading) {
  return (
    <Box 
      className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6"
    >
      <Stack 
        spacing={3} 
        alignItems="center"
        className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100"
      >
        {/* Modern Layered Loader */}
        <Box className="relative flex items-center justify-center">
          {/* Background Ring */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={64}
            thickness={4}
            sx={{ color: '#f1f5f9' }} // Very light gray track
          />
          {/* Actual Animated Loader */}
          <CircularProgress
            variant="indeterminate"
            disableShrink
            size={64}
            thickness={4}
            sx={{
              color: '#2563eb', // Modern Blue
              animationDuration: '800ms',
              position: 'absolute',
              left: 0,
              [`& .MuiCircularProgress-circle`]: {
                strokeLinecap: 'round',
              },
            }}
          />
          {/* Center Icon */}
          <Box className="absolute">
            <IoSparkles className="text-blue-500 text-xl animate-pulse" />
          </Box>
        </Box>

        {/* Clean Typography */}
        <Stack spacing={0.5} alignItems="center">
          <Typography 
            variant="body1" 
            fontWeight="600" 
            color="text.primary"
            sx={{ letterSpacing: '-0.01em' }}
          >
            Loading Guidance and Counseling sessions...
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            className="flex items-center gap-1"
          >
            Fetching latest sessions and team information
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}


const GuidanceHeroBanner = ({ stats, onRefresh }) => {
  return (
    <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 text-white overflow-hidden shadow-2xl border border-white/5 mb-8">
      {/* Abstract Mesh Gradient Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-teal-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            {/* Institutional Branding */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-6 sm:h-8 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              <div>
                <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                 Katwanyaa High School
                </h2>
                <p className="text-[8px] sm:text-[10px] italic font-medium text-white/60 tracking-widest uppercase">
                  "Guiding Future Leaders"               
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 w-fit">
                <FiUsers className="text-xl sm:text-2xl md:text-3xl text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Guidance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-teal-200">Counseling</span>
              </h1>
            </div>
          </div>
          
          {/* Modern Action Button */}
          <button
            onClick={onRefresh}
            className="flex items-center justify-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all hover:bg-white/20 w-full sm:w-fit"
          >
            <FiBookOpen className="text-base sm:text-lg" />
            <span>SCHEDULE SESSION</span>
          </button>
        </div>
        
        {/* Summary Text */}
        <div className="mb-6 sm:mb-8">
          <p className="text-emerald-100/80 text-sm sm:text-base md:text-md font-medium leading-relaxed">
            Get personalized support from <span className="text-white font-bold underline decoration-emerald-500/50 decoration-2 underline-offset-4">{stats.counselors || 5} certified counselors</span> 
            across <span className="text-white font-bold underline decoration-teal-500/50 decoration-2 underline-offset-4 mx-1 sm:mx-2">{stats.specialties || 8} specialties</span> 
            to navigate academic and personal growth. This month: <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-0.5 rounded-md sm:rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/20 mx-1">{stats.availableSlots || 24} available slots</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-4 md:p-6">
      <Toaster position="top-right" richColors />
<div className="max-w-7xl mx-auto space-y-8">
  {/* Header - Overhauled with Emerald Branding */}
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
    <div>
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-4 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-800 font-black text-xs uppercase tracking-[0.2em]">
          Katwanyaa High Support
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-3">
        Guidance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Counseling</span>
      </h1>
      <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
        Empowering students through <span className="text-emerald-600 font-bold">academic excellence</span>, emotional resilience, and spiritual growth.
      </p>
    </div>
    
    <div className="flex items-center gap-4">
      <button
        onClick={refreshData}
        disabled={refreshing}
        className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-emerald-900 border-2 border-emerald-50 font-black text-sm shadow-xl shadow-emerald-900/5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {refreshing ? (
          <CircularProgress size={18} thickness={6} sx={{ color: "#059669" }} />
        ) : <FiZap className="text-emerald-500" />}
        <span className="tracking-widest uppercase">{refreshing ? "Syncing..." : "Refresh"}</span>
      </button>
      
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FiGrid size={20} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FiList size={20} />
        </button>
      </div>
    </div>
  </div>

  {/* Dynamic Stats - Emerald Themed */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
    {stats.map((stat, index) => (
      <ModernStatCard key={index} stat={stat} color="emerald" />
    ))}
  </div>

  {/* 24/7 Support Team Section - Refined Glassmorphism */}
  <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden mb-12">
    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 blur-[100px] pointer-events-none" />
    
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between mb-10">
      <div className="flex items-center gap-6">
        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
          <FiPhoneCall className="text-emerald-300 text-3xl" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Support Team</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-black bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded uppercase tracking-tighter">
              {teamMembers.length} Professionals
            </span>
            <span className="text-emerald-200/50 text-[10px] uppercase font-bold tracking-widest">API Endpoint Active</span>
          </div>
        </div>
      </div>
    </div>
    
    {teamMembers.length === 0 ? (
      <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-12 text-center border border-white/10 border-dashed">
        <FiUsers className="mx-auto text-emerald-400/30 text-5xl mb-4" />
        <h3 className="text-lg font-bold text-white/80 tracking-widest uppercase">Initializing Team Data...</h3>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <ModernSupportTeamCard
            key={member.id}
            member={member}
            onView={() => { setSelectedMember(member); setIsTeamModalOpen(true); }}
            onContact={handleContactSupport}
          />
        ))}
      </div>
    )}
  </div>

  {/* Main Content Layout */}
  <div className="flex flex-col lg:flex-row gap-10">
    <div className="flex-1 min-w-0 space-y-8">
      {/* Sessions Header */}
      <div className="flex items-center gap-5 px-1">
        <div className="p-3.5 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
          <FiHeart className="text-emerald-400 text-2xl" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Counseling Sessions</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            {filteredSessions.length} Available Slots
          </p>
        </div>
      </div>

      {/* Modern Search & Filter Section */}
      <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full flex-1 group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search sessions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500/20 focus:bg-white transition-all"
          />
        </div>

        <select 
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full md:w-56 px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer focus:ring-4 focus:ring-emerald-500/5 transition-all"
        >
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <button
          onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
        >
          Reset
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="relative">
        {filteredSessions.length === 0 ? (
          <div className="bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 py-20 text-center">
            <FiSearch className="mx-auto text-slate-200 text-6xl mb-4" />
            <h3 className="text-xl font-black text-slate-400 tracking-widest uppercase">No Match Found</h3>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-6'}>
            {filteredSessions.map((session, index) => (
              <ModernCounselingCard 
                key={session.id || index} 
                session={session} 
                onView={setSelectedSession}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Right Column: Sidebar Actions */}
    <div className="lg:w-[400px] space-y-6">
      <div className="lg:sticky lg:top-8 space-y-6">
        
        {/* Quick Actions Card - Dark UI */}
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <FiZap className="text-emerald-400 text-2xl" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Quick Actions</h2>
          </div>

          <div className="space-y-4">
            <SidebarAction icon={FiPhoneCall} label="Emergency" sub="Immediate Response" color="red" />
            <SidebarAction icon={FiCalendar} label="Book Session" sub="Schedule Appointment" color="emerald" />
            <SidebarAction icon={FiBookOpen} label="Guides" sub="Mental Health Library" color="teal" />
          </div>
        </div>

        {/* Data Source Summary - Tech Info */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
            System Status
          </h4>
          <div className="space-y-4">
            <StatusRow label="Guidance Sessions" value={`API (${guidanceSessions.length})`} color="emerald" />
            <StatusRow label="Support Team" value={`API (${teamMembers.length})`} color="teal" />
            <StatusRow label="Devotion Content" value="Static" color="slate" />
          </div>
        </div>

        {/* Professional Ethics Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <FiShield className="text-emerald-400 text-4xl mb-6" />
          <h4 className="text-xl font-black mb-3 tracking-tight">100% Confidential</h4>
          <p className="text-emerald-100/40 text-sm leading-relaxed mb-6 font-medium">
            At Katwanyaa High, your privacy is our sacred trust. All sessions adhere to international counseling ethics.
          </p>
          <div className="space-y-3">
            {['End-to-End Privacy', 'No Judgment Policy', 'Expert Counselors'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Feature Banner - Bottom CTA */}
  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl">
    <div className="relative z-10 max-w-3xl mx-auto">
      <div className="inline-flex p-5 bg-white/10 rounded-3xl border border-white/10 mb-8 backdrop-blur-xl">
        <FiHeart className="text-emerald-300 text-5xl" />
      </div>
      <h3 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
        Your Well-being Matters.
      </h3>
      <p className="text-emerald-100/60 text-lg md:text-xl font-medium mb-10">
        Holistic support for your academic journey and personal growth.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {['Secure', 'Professional', 'Available 24/7'].map((tag) => (
          <div key={tag} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
            {tag}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <ModernDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onContact={() => {
            setSelectedSession(null);
            toast.success('Connecting you to support...');
          }}
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