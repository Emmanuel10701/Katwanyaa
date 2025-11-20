'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiBook,
  FiBarChart2,
  FiUser,
  FiUsers,
  FiAlertTriangle,
  FiMessageCircle,
  FiClock,
  FiCalendar,
  FiSave,
  FiX,
  FiImage,
  FiUpload,
  FiRotateCw
} from 'react-icons/fi';

// Material-UI Spinner only
import { CircularProgress } from '@mui/material';

// Modern loading spinner component using Material-UI
const LoadingSpinner = ({ size = 'small', color = 'primary' }) => (
  <CircularProgress 
    size={size === 'small' ? 20 : size === 'medium' ? 24 : 32} 
    color={color}
  />
);

// Modern Card Component
const CounselingEventCard = ({ event, onEdit, onDelete, onView, index }) => {
  const [imageError, setImageError] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'linear-gradient(135deg, #EF4444, #DC2626)',
      Medium: 'linear-gradient(135deg, #F59E0B, #D97706)',
      Low: 'linear-gradient(135deg, #10B981, #059669)'
    };
    return colors[priority] || 'linear-gradient(135deg, #6B7280, #4B5563)';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Drugs: <FiAlertTriangle className="text-red-500" />,
      Relationships: <FiUsers className="text-pink-500" />,
      Worship: <FiUser className="text-purple-500" />,
      Discipline: <FiBarChart2 className="text-orange-500" />,
      Academics: <FiBook className="text-blue-500" />,
    };
    return icons[category] || <FiMessageCircle className="text-gray-500" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Drugs: 'bg-red-100 text-red-800 border-red-200',
      Relationships: 'bg-pink-100 text-pink-800 border-pink-200',
      Worship: 'bg-purple-100 text-purple-800 border-purple-200',
      Discipline: 'bg-orange-100 text-orange-800 border-orange-200',
      Academics: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/60 overflow-hidden transition-all duration-500 hover:shadow-2xl cursor-pointer relative"
      onClick={onView}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Image Section */}
      {event?.image && !imageError ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={`Counseling session with ${event.counselor}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          <div 
            className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            style={{ background: getPriorityColor(event.priority) }}
          >
            {event.priority}
          </div>
        </div>
      ) : (
        <div 
          className="h-32 relative overflow-hidden"
          style={{ background: getPriorityColor(event?.priority) }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
            {event?.priority}
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="font-bold text-lg">{event?.counselor}</h3>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 relative">
        {/* Category Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${getCategoryColor(event?.category)}`}>
          {getCategoryIcon(event?.category)}
          {event?.category || 'General'}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 min-h-12 line-clamp-2 leading-relaxed font-medium">
          {event?.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {event?.date ? new Date(event.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              }) : 'No date'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiClock className="text-gray-400 flex-shrink-0" />
            <span>{event?.time || 'No time'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUser className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{event?.counselor || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
            </div>
            <span className="capitalize">{event?.type || 'unknown'}</span>
          </div>
        </div>

        {/* Notes Preview */}
        {event?.notes && (
          <div className="bg-gray-50/80 rounded-2xl p-3 mb-4 border border-gray-200/50">
            <p className="text-xs text-gray-600 line-clamp-2">
              <strong>Notes:</strong> {event.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-2.5 px-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/25"
          >
            <FiEdit3 size={14} /> Edit
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl py-2.5 px-3 hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-red-500/25"
          >
            <FiTrash2 size={14} /> Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 lg:p-8 border-b border-gray-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <FiUser className="text-white text-xl" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Button Component
const CustomButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="small" color="inherit" />
      )}
      {children}
    </motion.button>
  );
};

// View Modal Component
const ViewEventModal = ({ event, onClose, onEdit }) => {
  if (!event) return null;

  const getCategoryIcon = (category) => {
    const icons = {
      Drugs: <FiAlertTriangle className="text-red-500" />,
      Relationships: <FiUsers className="text-pink-500" />,
      Worship: <FiUser className="text-purple-500" />,
      Discipline: <FiBarChart2 className="text-orange-500" />,
      Academics: <FiBook className="text-blue-500" />,
    };
    return icons[category] || <FiMessageCircle className="text-gray-500" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-500',
      Medium: 'bg-orange-500',
      Low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <CustomModal
      isOpen={true}
      onClose={onClose}
      title="Counseling Session Details"
    >
      <div className="p-6 lg:p-8 space-y-6">
        {/* Image */}
        {event.image && (
          <div className="relative h-64 rounded-xl overflow-hidden">
            <img
              src={event.image}
              alt={`Counseling session with ${event.counselor}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <FiUser className="text-blue-500 text-xl" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Counselor</p>
              <p className="text-lg font-semibold text-gray-800">{event.counselor}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
            {getCategoryIcon(event.category)}
            <div>
              <p className="text-sm text-purple-600 font-medium">Category</p>
              <p className="text-lg font-semibold text-gray-800">{event.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <FiCalendar className="text-green-500 text-xl" />
            <div>
              <p className="text-sm text-green-600 font-medium">Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
            <FiClock className="text-orange-500 text-xl" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Time</p>
              <p className="text-lg font-semibold text-gray-800">{event.time}</p>
            </div>
          </div>
        </div>

        {/* Priority and Type */}
        <div className="flex gap-4">
          <div className="flex-1 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Session Type</p>
            <p className="text-lg font-semibold text-gray-800">{event.type}</p>
          </div>
          <div className="flex-1 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Priority</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white ${getPriorityColor(event.priority)}`}>
              {event.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Session Description</h3>
          <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
            {event.description}
          </p>
        </div>

        {/* Notes */}
        {event.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Notes</h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {event.notes}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(event.createdAt).toLocaleDateString()} at {new Date(event.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(event.updatedAt).toLocaleDateString()} at {new Date(event.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <CustomButton
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            <FiX className="text-lg" />
            Close
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={onEdit}
            className="flex-1"
          >
            <FiEdit3 className="text-lg" />
            Edit Session
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

// Enhanced Edit Dialog with corrected API URLs
const GuidanceEditDialog = ({ event, onSave, onCancel, showSnackbar }) => {
  const [formData, setFormData] = useState({
    counselor: '',
    category: 'Academics',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Guidance',
    priority: 'Medium'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        counselor: event.counselor || '',
        category: event.category || 'Academics',
        description: event.description || '',
        notes: event.notes || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: event.time || '09:00',
        type: event.type || 'Guidance',
        priority: event.priority || 'Medium'
      });
      if (event.image) {
        setImagePreview(event.image);
      }
    } else {
      setFormData({
        counselor: '',
        category: 'Academics',
        description: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'Guidance',
        priority: 'Medium'
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [event]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please upload an image file', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size should be less than 5MB', 'error');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      showSnackbar('Image selected successfully');
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
  };

  const handleSave = async () => {
    if (!formData.counselor.trim()) {
      showSnackbar('Please enter counselor name', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showSnackbar('Please enter session description', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = new FormData();
      
      submitData.append('counselor', formData.counselor);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('notes', formData.notes);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('type', formData.type);
      submitData.append('priority', formData.priority);

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // CORRECTED: Use route parameters instead of query parameters
      let url = '/api/guidance';
      let method = 'POST';

      if (event?.id) {
        url = `/api/guidance/${event.id}`; // Changed from ?id=${event.id} to /${event.id}
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        body: submitData,
      });

      const result = await response.json();
      if (result.success) {
        showSnackbar(event ? 'Session updated successfully!' : 'Session created successfully!');
        onSave();
      } else {
        throw new Error(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Save error:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <CustomModal
      isOpen={true}
      onClose={onCancel}
      title={`${event ? 'Edit' : 'Create'} Counseling Session`}
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 lg:p-8 space-y-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Session Image
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="text-gray-400 text-2xl" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center gap-3">
                  <FiUpload className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {imageFile ? 'Change Image' : 'Upload Image'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>
              </label>
              {imageFile && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-green-600 font-medium">
                    ✓ {imageFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Counselor Name *
            </label>
            <input
              type="text"
              required
              value={formData.counselor}
              onChange={(e) => updateField('counselor', e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="Enter counselor name"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none cursor-pointer"
              disabled={isSaving}
            >
              <option value="Academics">📚 Academics</option>
              <option value="Drugs">🚫 Drugs</option>
              <option value="Relationships">💕 Relationships</option>
              <option value="Worship">🙏 Worship</option>
              <option value="Discipline">⚖️ Discipline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Session Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none cursor-pointer"
              disabled={isSaving}
            >
              <option value="Guidance">💬 Guidance</option>
              <option value="Counseling">🧠 Counseling</option>
              <option value="Group Session">👥 Group Session</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => updateField('time', e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              disabled={isSaving}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority *
            </label>
            <select
              required
              value={formData.priority}
              onChange={(e) => updateField('priority', e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none cursor-pointer"
              disabled={isSaving}
            >
              <option value="Low">💚 Low</option>
              <option value="Medium">💛 Medium</option>
              <option value="High">🧡 High</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Session Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows="3"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
              placeholder="Describe the counseling session..."
              disabled={isSaving}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows="4"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
              placeholder="Any additional notes or comments..."
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/60">
          <CustomButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1"
          >
            <FiX className="text-lg" />
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          >
            <FiSave className="text-lg" />
            {event ? 'Update Session' : 'Create Session'}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
};

// Main Component with corrected DELETE URL
export default function GuidanceCounselingTab() {
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch events from API
  const fetchEvents = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/guidance');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.events || []);
        if (showRefresh) {
          showSnackbar('Data refreshed successfully!');
        }
      } else {
        throw new Error(result.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showSnackbar('Failed to load counseling sessions', 'error');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Show toast notification
  const showSnackbar = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const handleNewEvent = () => {
    setCurrentEvent(null);
    setIsEditing(true);
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setIsEditing(true);
  };

  const handleView = (event) => {
    setCurrentEvent(event);
    setIsViewing(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this counseling session? This action cannot be undone.')) {
      try {
        // CORRECTED: Use route parameters instead of query parameters
        const response = await fetch(`/api/guidance/${id}`, { // Changed from ?id=${id} to /${id}
          method: 'DELETE' 
        });
        const result = await response.json();
        if (result.success) {
          await fetchEvents();
          showSnackbar('Counseling session deleted successfully!');
        } else {
          showSnackbar(result.error || 'Error deleting session', 'error');
        }
      } catch (error) {
        showSnackbar('Error deleting session', 'error');
      }
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    if (!event) return false;
    
    const matchesSearch = 
      (event.counselor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Stats for the header
  const stats = {
    total: events.length,
    high: events.filter(e => e?.priority === 'High').length,
    today: events.filter(e => {
      if (!e?.date) return false;
      const eventDate = new Date(e.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="large" color="primary" />
          <p className="text-gray-600 text-lg mt-4 font-medium">Loading Counseling Sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <ToastContainer 
        position="top-right" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -100, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 15 + i * 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute text-white/10 text-9xl"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 20}%`,
                  }}
                >
                  💬
                </motion.div>
              ))}
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              <div className="lg:col-span-2">
                <motion.h1
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent"
                >
                  Guidance & Counseling
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-cyan-100 text-lg sm:text-xl opacity-90 mb-6"
                >
                  Manage student counseling sessions with modern tools and insights
                </motion.p>

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-cyan-100 text-sm">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-200">{stats.high}</div>
                    <div className="text-cyan-100 text-sm">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-200">{stats.today}</div>
                    <div className="text-cyan-100 text-sm">Today</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-3">
                  <CustomButton
                    variant="secondary"
                    onClick={() => fetchEvents(true)}
                    disabled={refreshing}
                    loading={refreshing}
                    className="flex-1"
                  >
                    <FiRotateCw className="text-lg" />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </CustomButton>
                  
                  <CustomButton
                    variant="primary"
                    onClick={handleNewEvent}
                    className="flex-1"
                  >
                    <FiPlus className="text-lg" />
                    Create Session
                  </CustomButton>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-white/30 text-white shadow-inner' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-white/30 text-white shadow-inner' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    List View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Search counselors, descriptions, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80"
                />
              </div>
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80"
              >
                <option value="all">All Categories</option>
                <option value="Academics">Academics</option>
                <option value="Drugs">Drugs</option>
                <option value="Relationships">Relationships</option>
                <option value="Worship">Worship</option>
                <option value="Discipline">Discipline</option>
              </select>
            </div>
            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80"
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterPriority('all');
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl px-4 py-3.5 font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <FiFilter /> Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sessions Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          key={viewMode}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredEvents.map((event, index) => (
                  <CounselingEventCard 
                    key={event?.id || index}
                    event={event}
                    index={index}
                    onEdit={() => handleEdit(event)}
                    onDelete={() => handleDelete(event?.id)}
                    onView={() => handleView(event)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event?.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleView(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {event?.category === 'Academics' && '📚'}
                          {event?.category === 'Drugs' && '🚫'}
                          {event?.category === 'Relationships' && '💕'}
                          {event?.category === 'Worship' && '🙏'}
                          {event?.category === 'Discipline' && '⚖️'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{event?.counselor}</h3>
                          <p className="text-gray-600 text-sm">{event?.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {event?.date ? new Date(event.date).toLocaleDateString() : 'No date'} at {event?.time}
                        </div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold text-white ${
                          event?.priority === 'High' ? 'bg-red-500' :
                          event?.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`}>
                          {event?.priority}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16 text-center"
            >
              <div className="text-8xl mb-6">💬</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No counseling sessions found</h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                {searchTerm || filterCategory !== 'all' || filterPriority !== 'all' 
                  ? 'No sessions match your current filters. Try adjusting your search criteria.' 
                  : 'Start building your counseling program by creating the first session.'
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewEvent}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl px-8 py-4 font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-2xl flex items-center gap-3 mx-auto text-lg"
              >
                <FiPlus /> Create Your First Session
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <AnimatePresence>
        {isEditing && (
          <GuidanceEditDialog
            event={currentEvent}
            onSave={() => {
              setIsEditing(false);
              setCurrentEvent(null);
              fetchEvents();
            }}
            onCancel={() => {
              setIsEditing(false);
              setCurrentEvent(null);
            }}
            showSnackbar={showSnackbar}
          />
        )}
      </AnimatePresence>

      {/* View Dialog */}
      <AnimatePresence>
        {isViewing && (
          <ViewEventModal
            event={currentEvent}
            onClose={() => {
              setIsViewing(false);
              setCurrentEvent(null);
            }}
            onEdit={() => {
              setIsViewing(false);
              setIsEditing(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}