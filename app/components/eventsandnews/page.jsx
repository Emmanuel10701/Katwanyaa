'use client';

import React, { useState, useEffect } from 'react';

// Feather Icons (Consolidated)
import { 
  FiAlertCircle,
  FiAlertTriangle,
  FiAward,
  FiBell,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit,
  FiEye,
  FiGlobe,
  FiImage,
  FiInfo, 
  FiMapPin,
  FiPlus, 
  FiRotateCw,
  FiSearch, 
  FiShare2,
  FiStar,
  FiTag,
  FiTrash2,
  FiTrendingUp,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
  FiZap
} from 'react-icons/fi';

// IonIcons (Consolidated)
import { 
  IoNewspaperOutline, 
  IoCalendarClearOutline 
} from 'react-icons/io5';

// Material UI (Consolidated)
import { Modal, Box, CircularProgress } from '@mui/material';

// Modern Loading Spinner Component
const Spinner = ({ size = 40, color = 'inherit', thickness = 3.6, variant = 'indeterminate', value = 0 }) => {
  return (
    <div className="inline-flex items-center justify-center">
      <svg 
        className={`animate-spin ${variant === 'indeterminate' ? '' : ''}`} 
        width={size} 
        height={size} 
        viewBox="0 0 44 44"
      >
        {variant === 'determinate' ? (
          <>
            <circle 
              className="text-gray-200" 
              stroke="currentColor" 
              strokeWidth={thickness} 
              fill="none" 
              cx="22" 
              cy="22" 
              r="20"
            />
            <circle 
              className="text-blue-600" 
              stroke="currentColor" 
              strokeWidth={thickness} 
              strokeLinecap="round" 
              fill="none" 
              cx="22" 
              cy="22" 
              r="20" 
              strokeDasharray="125.6" 
              strokeDashoffset={125.6 - (125.6 * value) / 100}
              transform="rotate(-90 22 22)"
            />
          </>
        ) : (
          <circle 
            className="text-blue-600" 
            stroke="currentColor" 
            strokeWidth={thickness} 
            strokeLinecap="round" 
            fill="none" 
            cx="22" 
            cy="22" 
            r="20" 
            strokeDasharray="30 100"
          />
        )}
      </svg>
    </div>
  );
};

// Delete Confirmation Modal (Matching Staff Style)
function DeleteConfirmationModal({ 
  open, 
  onClose, 
  onConfirm, 
  type = 'single',
  itemName = '',
  itemType = 'item',
  loading = false 
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        bgcolor: 'background.paper',
        borderRadius: 3, boxShadow: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fef3f7 100%)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                <FiAlertTriangle className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Confirm Deletion</h2>
                <p className="text-red-100 opacity-90 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
            {!loading && (
              <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl cursor-pointer">
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
              <FiAlertTriangle className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete "{itemName}"?
              </h3>
              <p className="text-gray-600">
                This {itemType} will be permanently deleted. All associated data will be removed.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">
                <span className="font-bold">Warning:</span> This action cannot be undone. Please make sure you want to proceed.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            
            <button 
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <CircularProgress size={16} className="text-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 />
                  Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </>
              )}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

// Notification Component (Matching Staff Style)
function Notification({ 
  open, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 5000 
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (open) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (elapsed >= duration) {
          clearInterval(interval);
          onClose();
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [open, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          progress: 'bg-green-500',
          title: 'text-green-800'
        };
      case 'error':
        return {
          bg: 'from-red-50 to-orange-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          progress: 'bg-red-500',
          title: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          progress: 'bg-yellow-500',
          title: 'text-yellow-800'
        };
      case 'info':
        return {
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          progress: 'bg-blue-500',
          title: 'text-blue-800'
        };
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-100',
          progress: 'bg-gray-500',
          title: 'text-gray-800'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle className="text-xl" />;
      case 'error': return <FiAlertCircle className="text-xl" />;
      case 'warning': return <FiAlertTriangle className="text-xl" />;
      case 'info': return <FiInfo className="text-xl" />;
      default: return <FiInfo className="text-xl" />;
    }
  };

  const styles = getTypeStyles();

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-slide-in">
      <div className={`bg-gradient-to-r ${styles.bg} border-2 ${styles.border} rounded-2xl shadow-xl overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 ${styles.iconBg} rounded-xl ${styles.icon}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${styles.title} mb-1`}>{title}</h4>
              <p className="text-gray-700 text-sm">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-200 hover:bg-opacity-50 rounded-lg cursor-pointer text-gray-500"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Modern Item Detail Moda
function ModernItemDetailModal({ item, type, onClose, onEdit }) {
  if (!item) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return type === 'news' ? '/default-news.jpg' : '/default-event.jpg';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('data:image')) {
      return imagePath;
    }
    return `/${imagePath}`;
  };

  const categories = {
    news: {
      achievement: { label: 'Achievements', color: 'emerald' },
      sports: { label: 'Sports', color: 'blue' },
      academic: { label: 'Academic', color: 'purple' },
      infrastructure: { label: 'Infrastructure', color: 'orange' },
      community: { label: 'Community', color: 'rose' }
    },
    events: {
      academic: { label: 'Academic', color: 'purple' },
      sports: { label: 'Sports', color: 'blue' },
      cultural: { label: 'Cultural', color: 'emerald' },
      social: { label: 'Social', color: 'orange' }
    }
  };

  const categoryInfo = categories[type][item.category];
  const themeGradient = type === 'news' 
    ? 'from-indigo-600 via-purple-600 to-pink-600' 
    : 'from-blue-600 via-cyan-600 to-emerald-600';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-screen sm:max-h-[95vh] bg-slate-50 sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        
        {/* Modern Glass Header */}
        <div className={`relative p-6 sm:p-10 text-white bg-gradient-to-br ${themeGradient}`}>
          {/* Subtle Abstract Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-inner border border-white/20 shrink-0 hidden sm:block">
                {type === 'news' ? <IoNewspaperOutline size={32} /> : <IoCalendarClearOutline size={32} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Official {type}</span>
                  <div className="h-1 w-1 rounded-full bg-white/40" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Katwanyaa High</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tighter leading-tight italic uppercase">
                  {type === 'news' ? 'Article Insight' : 'Event Spotlight'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => onEdit(item)} 
                className="group flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95 shadow-xl"
              >
                <FiEdit className="group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button 
                onClick={onClose} 
                className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-all active:scale-90 border border-white/10"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm">
          <div className="p-6 sm:p-10 space-y-10">
            
            {/* Hero Section: Image & Title */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="relative group w-full lg:w-48 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2rem] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <img
               src={getImageUrl(item.image)}
                  alt={item.title}
                  className="relative w-full aspect-square lg:w-48 lg:h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    categoryInfo 
                      ? `bg-${categoryInfo.color}-50 text-${categoryInfo.color}-700 border-${categoryInfo.color}-200` 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {categoryInfo?.label || item.category}
                  </span>
                  {item.featured && (
                    <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md animate-pulse">
                      Featured Piece
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                  {item.title}
                </h1>

                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <FiClock className="text-blue-500" />
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Date', val: new Date(item.date).toLocaleDateString(), icon: <FiClock />, show: true },
                 { label: 'Time', val: item.time, icon: <FiInfo />, show: type === 'events' && item.time },
                 { label: 'Venue', val: item.location, icon: <FiMapPin />, show: type === 'events' && item.location },
                 { label: 'Author', val: item.author, icon: <FiUser />, show: type === 'news' && item.author },
                 { label: 'Speaker', val: item.speaker, icon: <FiUser />, show: type === 'events' && item.speaker },
                 { label: 'Target', val: item.attendees, icon: <FiUsers />, show: type === 'events' && item.attendees },
               ].filter(i => i.show).map((stat, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-1">
                      {stat.icon} {stat.label}
                    </div>
                    <div className="text-slate-800 font-bold truncate">{stat.val}</div>
                 </div>
               ))}
            </div>

            {/* Content Blocks */}
            <div className="space-y-8">
              {/* Description Block */}
              <div className="relative p-6 sm:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 text-white rounded-lg"><FiBook /></div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Brief Overview</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg font-medium italic">
                  "{item.description || item.excerpt || 'No description provided.'}"
                </p>
              </div>

              {/* Full Content Block (News Only) */}
              {type === 'news' && item.fullContent && (
                <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500 text-white rounded-lg"><FiBook /></div>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Full Story</h3>
                  </div>
                  <div className="text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-medium">
                    {item.fullContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-200 active:scale-95"
          >
            Close Details
          </button>
          <button 
            onClick={() => onEdit(item)} 
            className={`flex-[2] px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg bg-gradient-to-r ${themeGradient} hover:brightness-110`}
          >
            Edit {type === 'news' ? 'Article' : 'Event'} Entry
          </button>
        </div>
      </div>
    </div>
  );
}

// MODERN CARD COMPONENT (Matching Staff Style)
// Modern Item Card Component with better data handling
function ModernItemCard({ item, type, onEdit, onDelete, onView }) {
  const [imageError, setImageError] = useState(false)

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return type === 'news' ? '/default-news.jpg' : '/default-event.jpg';
    }
    
    // Handle Cloudinary URLs
    if (imagePath.includes('cloudinary.com')) {
      return imagePath;
    }
    
    // Handle local paths
    if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle base64 images
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }
    
    // Default fallback
    return type === 'news' ? '/default-news.jpg' : '/default-event.jpg';
  };

  // Safely get item properties with fallbacks
  const itemData = {
    id: item?.id || '',
    title: item?.title || 'Untitled',
    excerpt: item?.excerpt || item?.description || 'No description available.',
    description: item?.description || item?.excerpt || '',
    date: item?.date || new Date().toISOString(),
    category: item?.category || (type === 'news' ? 'general' : 'academic'),
    author: item?.author || 'School Admin',
    image: item?.image || '',
    featured: item?.featured || false,
    time: item?.time || '',
    location: item?.location || '',
    speaker: item?.speaker || '',
    attendees: item?.attendees || 'students'
  };

  const categories = {
    news: {
      'achievement': { label: 'Achievements', color: 'emerald' },
      'sports': { label: 'Sports', color: 'blue' },
      'academic': { label: 'Academic', color: 'purple' },
      'infrastructure': { label: 'Infrastructure', color: 'orange' },
      'community': { label: 'Community', color: 'rose' },
      'general': { label: 'General', color: 'gray' }
    },
    events: {
      'academic': { label: 'Academic', color: 'purple' },
      'sports': { label: 'Sports', color: 'blue' },
      'cultural': { label: 'Cultural', color: 'emerald' },
      'social': { label: 'Social', color: 'orange' },
      'general': { label: 'General', color: 'gray' }
    }
  };

  const categoryInfo = categories[type][itemData.category] || categories[type]['general'];
  const imageUrl = getImageUrl(itemData.image);

  // Rest of your ModernItemCard component remains the same...
  // Just replace all references to `item` with `itemData`
  
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 w-full max-w-md overflow-hidden transition-none">
      {/* Image Section */}
      <div className="relative h-64 w-full bg-gray-50 overflow-hidden">
        {!imageError ? (
    <img
  src={getImageUrl(item.image)}  // ✅ Correct - use the getImageUrl function
  alt={item.title}
  className="relative w-full aspect-square lg:w-48 lg:h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-[1.02]"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = type === 'news' ? '/default-news.jpg' : '/default-event.jpg';
  }}
/>
        ) : (
          <div 
            onClick={() => onView(itemData)} 
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 cursor-pointer"
          >
            {type === 'news' ? (
              <IoNewspaperOutline className="text-5xl mb-3" />
            ) : (
              <IoCalendarClearOutline className="text-5xl mb-3" />
            )}
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Overlay: Category & Featured */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm pointer-events-auto">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              categoryInfo ? `bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 border border-${categoryInfo.color}-200` : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {categoryInfo?.label || itemData.category}
            </span>
          </div>
          
          {itemData.featured && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-yellow-200 pointer-events-auto">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="p-6">
        <div className="mb-6">
          <h3 
            onClick={() => onView(itemData)} 
            className="text-2xl font-black text-slate-900 leading-tight cursor-pointer line-clamp-2 hover:text-purple-600 transition-colors"
          >
            {itemData.title}
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-2 line-clamp-2">
            {itemData.excerpt}
          </p>
        </div>
        
        {/* Grid Info Mapping */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
          {/* Date */}
          <div className="space-y-1">
            <span className="block text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">Date</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
              <span className="text-xs font-bold text-slate-700">
                {new Date(itemData.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Time for Events */}
          {type === 'events' && itemData.time && (
            <div className="space-y-1">
              <span className="block text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">Time</span>
              <span className="text-xs font-bold text-slate-700">{itemData.time}</span>
            </div>
          )}

          {/* Location for Events - Full width */}
          {type === 'events' && itemData.location && (
            <div className="col-span-2 p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100/50">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">Location</span>
                <span className="text-xs font-bold text-slate-800 truncate">{itemData.location}</span>
              </div>
              <FiMapPin className="text-slate-300 text-lg shrink-0 ml-2" />
            </div>
          )}

          {/* Author for News */}
          {type === 'news' && itemData.author && (
            <div className="col-span-2 p-3 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100/50">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.1em]">Author</span>
                <span className="text-xs font-bold text-blue-800 truncate">{itemData.author}</span>
              </div>
              <FiUser className="text-blue-300 text-lg shrink-0 ml-2" />
            </div>
          )}
        </div>

        {/* Modern Action Bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onView(itemData)} 
            className="px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-none active:bg-slate-200"
          >
            View
          </button>
          
          <button 
            onClick={() => onEdit(itemData)} 
            className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-none active:scale-[0.98]"
          >
            Edit
          </button>
          
          <button 
            onClick={() => onDelete(itemData)} 
            className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 transition-none active:bg-red-100"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
// Modern Item Modal Component

function ModernItemModal({ onClose, onSave, item, type, loading }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    date: item?.date || new Date().toISOString().split('T')[0],
    time: item?.time || '',
    location: item?.location || '',
    category: item?.category || (type === 'news' ? 'achievement' : 'academic'),
    description: item?.description || (item?.excerpt || ''),
    content: item?.content || (item?.fullContent || ''),
    author: item?.author || 'School Administration',
    image: item?.image || '',
    featured: item?.featured || false,
    status: item?.status || 'draft',
    type: item?.type || 'internal',
    attendees: item?.attendees || 'students',
    speaker: item?.speaker || ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image || '');

  const categories = {
    news: [
      { value: 'achievement', label: 'Achievements', color: 'emerald' },
      { value: 'sports', label: 'Sports', color: 'blue' },
      { value: 'academic', label: 'Academic', color: 'purple' },
      { value: 'infrastructure', label: 'Infrastructure', color: 'orange' },
      { value: 'community', label: 'Community', color: 'rose' }
    ],
    events: [
      { value: 'academic', label: 'Academic', color: 'purple' },
      { value: 'sports', label: 'Sports', color: 'blue' },
      { value: 'cultural', label: 'Cultural', color: 'emerald' },
      { value: 'social', label: 'Social', color: 'orange' }
    ]
  };

  useEffect(() => {
    if (item?.image) {
      const getPreviewUrl = (imgPath) => {
        if (!imgPath) return '';
        if (imgPath.startsWith('/') || imgPath.startsWith('http') || imgPath.startsWith('data:image')) {
          return imgPath;
        }
        return `/${imgPath}`;
      };
      setImagePreview(getPreviewUrl(item.image));
    }
  }, [item]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'description' && type === 'news') {
        submitData.append('excerpt', formData[key].trim());
      }
      submitData.append(key, formData[key]);
    });
    if (imageFile) submitData.append('image', imageFile);
    await onSave(submitData, item?.id);
  };

  const themeGradient = type === 'news' 
    ? 'from-purple-700 via-pink-600 to-rose-600' 
    : 'from-blue-700 via-cyan-600 to-teal-600';

  return (
    <Modal open={true} onClose={loading ? undefined : onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95%', maxWidth: '1100px', maxHeight: '95vh',
        bgcolor: '#ffffff', borderRadius: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden', outline: 'none'
      }}>
        
        {/* Header */}
        <div className={`p-8 text-white bg-gradient-to-r ${themeGradient}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
                {type === 'news' ? <IoNewspaperOutline size={32} /> : <IoCalendarClearOutline size={32} />}
              </div>
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                  {item ? 'Modify' : 'Launch'} {type}
                </h2>
                <p className="text-white/80 font-bold text-xs mt-1 tracking-widest uppercase">
                  Katwanyaa Content Management System
                </p>
              </div>
            </div>
            {!loading && (
              <button onClick={onClose} className="p-3 bg-black/10 hover:bg-black/20 rounded-full transition-all active:scale-90">
                <FiX size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[calc(95vh-160px)] overflow-y-auto bg-slate-50/50">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
            
            {/* 1. HERO TITLE INPUT (FULL WIDTH) */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                <FiStar className="text-amber-500" /> Content Headline
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-0 py-4 bg-transparent border-b-4 border-slate-200 focus:border-purple-500 transition-colors text-3xl sm:text-5xl font-black text-slate-900 placeholder:text-slate-200 outline-none"
                placeholder="Enter a catchy title..."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column - Visuals & Media */}
              <div className="lg:col-span-4 space-y-8">
                <div className="relative group">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Featured Media</label>
                  <div className="relative aspect-video sm:aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-200">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                         <FiImage size={48} className="opacity-20" />
                         <span className="text-[10px] font-bold">NO IMAGE SELECTED</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                      <FiUpload size={30} />
                      <span className="font-black text-xs mt-2 uppercase tracking-widest">Replace Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div 
                  onClick={() => handleChange('featured', !formData.featured)}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    formData.featured ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div>
                    <p className={`font-black text-sm uppercase ${formData.featured ? 'text-amber-700' : 'text-slate-700'}`}>Promote to Featured</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Displays in homepage slider</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.featured ? 'bg-amber-500 text-white' : 'bg-slate-100'}`}>
                    <FiStar />
                  </div>
                </div>
              </div>

              {/* Right Column - Bold Data Fields */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Category Selection */}
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                  >
                    {categories[type].map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>

                {/* Date Input */}
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                {/* Conditional Inputs based on Type */}
                {type === 'events' ? (
                  <>
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Event Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 08:00 AM - 04:00 PM"
                        value={formData.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Venue / Location</label>
                      <input
                        type="text"
                        placeholder="e.g. School Main Hall"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Article Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Long Text Areas */}
                <div className="sm:col-span-2 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Short Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Write a brief summary of this item..."
                    />
                  </div>
                  {type === 'news' && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Story Content</label>
                      <textarea
                        rows="6"
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                        placeholder="Elaborate on the news item here..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-slate-100">
              <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel Changes
              </button>
              
              <button 
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-12 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 bg-gradient-to-r ${themeGradient} hover:brightness-110`}
              >
                {loading ? (
                  <CircularProgress size={18} thickness={6} sx={{ color: 'white' }} />
                ) : (
                  <>
                    <FiCheck size={18} />
                    Confirm & {item ? 'Save Updates' : `Post ${type}`}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}
// Helper function to get authentication headers from localStorage
const getAuthHeaders = () => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    const deviceToken = localStorage.getItem('device_token');
    
    if (!adminToken || !deviceToken) {
      console.error('❌ Authentication tokens not found in localStorage');
      return {};
    }
    
    return {
      'x-admin-token': adminToken,
      'x-device-token': deviceToken
    };
  } catch (error) {
    console.error('❌ Error getting auth headers:', error);
    return {};
  }
};

// Main News & Events Manager Component
export default function NewsEventsManager() {
  const [activeSection, setActiveSection] = useState('news');
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  });

  const categories = {
    news: [
      { value: 'achievement', label: 'Achievements', color: 'emerald' },
      { value: 'sports', label: 'Sports', color: 'blue' },
      { value: 'academic', label: 'Academic', color: 'purple' },
      { value: 'infrastructure', label: 'Infrastructure', color: 'orange' },
      { value: 'community', label: 'Community', color: 'rose' }
    ],
    events: [
      { value: 'academic', label: 'Academic', color: 'purple' },
      { value: 'sports', label: 'Sports', color: 'blue' },
      { value: 'cultural', label: 'Cultural', color: 'emerald' },
      { value: 'social', label: 'Social', color: 'orange' }
    ]
  };

  // Notification handler
  const showNotification = (type, title, message) => {
    setNotification({
      open: true,
      type,
      title,
      message
    });
  };

  // Fetch news from API
// Fetch news from API
const fetchNews = async () => {
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    console.log('News API Response:', data); // Debug log
    
    if (data.success) {
      // Map API response to component expected structure
      const newsArray = data.data || []; // Use data.data, not data.news
      const mappedNews = newsArray.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt || item.description || '',
        description: item.excerpt || item.description || '',
        fullContent: item.content || item.fullContent || item.excerpt || '', // Added content field
        date: item.date,
        category: item.category || 'general',
        author: item.author || 'School Administration', // Updated default
        image: item.image || '',
        featured: item.featured || false,
        status: item.status || 'published'
      }));
      
      console.log('Mapped News:', mappedNews); // Debug log
      setNews(mappedNews);
    } else {
      throw new Error(data.error || 'Failed to fetch news');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    setNews([]);
    showNotification('error', 'Fetch Error', 'Failed to fetch news');
  }
};
  // Fetch events from API
// Fetch events from API
const fetchEvents = async () => {
  try {
    const response = await fetch('/api/events');
    const data = await response.json();
    
    console.log('Events API Response:', data); // Debug log
    
    if (data.success) {
      // Handle both "events" and "data" property names
      const eventsArray = data.events || data.data || [];
      const mappedEvents = eventsArray.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.description || item.excerpt || '',
        description: item.description || item.excerpt || '',
        date: item.date,
        category: item.category || 'general',
        image: item.image || '',
        featured: item.featured || false,
        time: item.time || '',
        location: item.location || '',
        speaker: item.speaker || '',
        attendees: item.attendees || 'students',
        status: item.status || 'published'
      }));
      
      console.log('Mapped Events:', mappedEvents); // Debug log
      setEvents(mappedEvents);
    } else {
      throw new Error(data.error || 'Failed to fetch events');
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    setEvents([]);
    showNotification('error', 'Fetch Error', 'Failed to fetch events');
  }
};

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchNews(), fetchEvents()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', 'Fetch Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const items = activeSection === 'news' ? news : events;
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [activeSection, searchTerm, selectedCategory, news, events]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // UPDATED: Delete function with authentication headers
const confirmDelete = async () => {
  if (!itemToDelete) return;
  
  setDeleting(true);
  try {
    const endpoint = activeSection === 'news' 
      ? `/api/news/${itemToDelete.id}` 
      : `/api/events/${itemToDelete.id}`;
    
    // Get authentication headers
    const authHeaders = getAuthHeaders();
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      await fetchData();
      showNotification('success', 'Deleted', `${activeSection === 'news' ? 'News' : 'Event'} deleted successfully!`);
    } else {
      throw new Error(result.error || result.message);
    }
  } catch (error) {
    console.error(`Error deleting ${activeSection}:`, error);
    showNotification('error', 'Delete Failed', error.message || `Failed to delete ${activeSection}`);
  } finally {
    setDeleting(false);
    setShowDeleteModal(false);
    setItemToDelete(null);
  }
};

  // UPDATED: Submit function with authentication headers
const handleSubmit = async (formData, id) => {
  setSaving(true);
  try {
    let response;
    let endpoint;
    
    // Get authentication headers
    const authHeaders = getAuthHeaders();
    
    // Add loading notification
    showNotification('info', 'Saving', `${id ? 'Updating' : 'Creating'} ${activeSection}...`);
    
    if (id) {
      endpoint = activeSection === 'news' ? `/api/news/${id}` : `/api/events/${id}`;
      response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          ...authHeaders,
        },
        body: formData,
      });
    } else {
      endpoint = activeSection === 'news' ? '/api/news' : '/api/events';
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: formData,
      });
    }

    const result = await response.json();
    
    console.log('API Response:', result); // Debug log

    if (result.success) {
      await fetchData();
      setShowModal(false);
      showNotification(
        'success',
        id ? 'Updated' : 'Created',
        `${activeSection === 'news' ? 'News' : 'Event'} ${id ? 'updated' : 'created'} successfully!`
      );
    } else {
      throw new Error(result.error || result.message || `Failed to ${id ? 'update' : 'create'} ${activeSection}`);
    }
  } catch (error) {
    console.error(`Error saving ${activeSection}:`, error);
    showNotification('error', 'Save Failed', error.message || `Failed to ${id ? 'update' : 'create'} ${activeSection}`);
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
    const calculatedStats = {
      totalNews: news.length,
      totalEvents: events.length,
      featuredNews: news.filter(n => n.featured).length,
      featuredEvents: events.filter(e => e.featured).length,
      todayNews: news.filter(n => {
        const itemDate = new Date(n.date);
        const today = new Date();
        return itemDate.toDateString() === today.toDateString();
      }).length,
      upcomingEvents: events.filter(e => new Date(e.date) >= new Date()).length,
    };
    setStats(calculatedStats);
  }, [news, events]);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-gray-700 font-medium">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiChevronLeft className="text-lg" />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => 
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, index, array) => (
            <div key={page} className="flex items-center">
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => paginate(page)}
                className={`px-3 py-2 rounded-xl font-bold ${
                  currentPage === page
                    ? activeSection === 'news'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-700'
                }`}
              >
                {page}
              </button>
            </div>
          ))
        }

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );

   if (loading && news.length === 0 && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Spinner size={48} />
          <p className="text-gray-700 text-lg mt-4 font-medium">
            Loading Events and News
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Please wait while we fetch school Events and News articles.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-4 min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Custom Notification */}
      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.title}
        itemType={activeSection === 'news' ? 'news article' : 'event'}
        loading={deleting}
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">News & Events Manager</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage school news articles and events</p>
          </div>
          <div className="flex items-center gap-3">
   <button
  onClick={fetchData}
  className={`flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
              text-white px-5 py-3 rounded-2xl font-semibold shadow-lg 
              hover:scale-105 hover:shadow-xl transition-transform duration-300
              cursor-pointer text-sm`}
>
  {/* Loading spinner */}
  {loading && (
    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  )}
  
  {loading ? 'Refreshing...' : 'Refresh'}
</button>

            <button onClick={handleCreate} className={`flex items-center gap-2 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-bold shadow-lg cursor-pointer text-sm ${
              activeSection === 'news' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600'
            }`}>
              <FiPlus className="text-xs" /> Create {activeSection === 'news' ? 'News' : 'Event'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Total News</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalNews}</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                <IoNewspaperOutline className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Total Events</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <IoCalendarClearOutline className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Featured News</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.featuredNews}</p>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-2xl">
                <FiAward className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Featured Events</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.featuredEvents}</p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                <FiTrendingUp className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Today's News</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.todayNews}</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                <FiClock className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
              <div className="p-3 bg-cyan-100 text-cyan-600 rounded-2xl">
                <FiCalendar className="text-lg" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-full max-w-md">
          {[
            { id: 'news', label: 'News Articles', count: news.length, icon: IoNewspaperOutline },
            { id: 'events', label: 'Events', count: events.length, icon: IoCalendarClearOutline }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                  isActive
                    ? tab.id === 'news'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Icon className="text-lg" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeSection} by title or description...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-50"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 cursor-pointer text-sm"
          >
            <option value="all">All Categories</option>
            {categories[activeSection].map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <button className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
            <FiShare2 /> Export
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {currentItems.map((item) => (
          <ModernItemCard 
            key={item.id} 
            item={item} 
            type={activeSection}
            onEdit={handleEdit} 
            onDelete={handleDeleteClick} 
            onView={handleView}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentItems.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
          {activeSection === 'news' ? (
            <IoNewspaperOutline className="text-4xl lg:text-5xl text-gray-300 mx-auto mb-4" />
          ) : (
            <IoCalendarClearOutline className="text-4xl lg:text-5xl text-gray-300 mx-auto mb-4" />
          )}
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
            {searchTerm ? 'No items found' : `No ${activeSection} available`}
          </h3>
          <p className="text-gray-600 text-sm lg:text-base mb-6 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search criteria' : `Start by creating your first ${activeSection === 'news' ? 'news article' : 'event'}`}
          </p>
          <button 
            onClick={handleCreate} 
            className={`text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 mx-auto text-sm lg:text-base cursor-pointer ${
              activeSection === 'news' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600'
            }`}
          >
            <FiPlus /> Create {activeSection === 'news' ? 'News' : 'Event'}
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200">
          <Pagination />
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <ModernItemModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSubmit} 
          item={editingItem} 
          type={activeSection}
          loading={saving} 
        />
      )}
      
      {showDetailModal && selectedItem && (
        <ModernItemDetailModal 
          item={selectedItem} 
          type={activeSection}
          onClose={() => setShowDetailModal(false)} 
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}