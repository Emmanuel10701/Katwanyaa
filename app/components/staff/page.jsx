'use client';
import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiMail,
  FiPhone,
  FiUser,
  FiAward,
  FiBook,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiEye,
  FiStar,
  FiShield,
  FiRotateCw,
  FiUpload,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  IoPeopleCircle,
  IoRocketOutline,
  IoSchoolOutline
} from 'react-icons/io5';
import { Modal, Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';

// Import your local avatar images
import male from "../../../images/avata/male.png";
import female from "../../../images/avata/female.png";

// Modern Loading Spinner Component
function ModernLoadingSpinner({ message = "Loading...", size = "medium" }) {
  const sizes = {
    small: { outer: 60, inner: 24 },
    medium: { outer: 100, inner: 40 },
    large: { outer: 120, inner: 48 }
  }

  const { outer, inner } = sizes[size]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="relative">
            <CircularProgress 
              size={outer} 
              thickness={4}
              className="text-orange-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`bg-gradient-to-r from-orange-500 to-red-600 rounded-full opacity-20`}
                   style={{ width: inner, height: inner }}></div>
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <span className="block text-xl font-semibold text-gray-700 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            {message}
          </span>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-orange-500 rounded-full" 
                   style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmationModal({ 
  open, 
  onClose, 
  onConfirm, 
  type = 'single',
  count = 1,
  staffName = '',
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
                {type === 'bulk' 
                  ? `Delete ${count} staff ${count === 1 ? 'member' : 'members'}?`
                  : `Delete "${staffName}"?`
                }
              </h3>
              <p className="text-gray-600">
                {type === 'bulk'
                  ? `You are about to delete ${count} staff ${count === 1 ? 'member' : 'members'}. All associated data will be permanently removed.`
                  : 'This staff member will be permanently deleted. All associated data will be removed.'
                }
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
                  {type === 'bulk' ? `Delete ${count} Staff` : 'Delete Staff Member'}
                </>
              )}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

// Notification Component
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

// Modern Staff Detail Modal
function ModernStaffDetailModal({ staff, onClose, onEdit }) {
  if (!staff) return null

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  }

  const imageUrl = getImageUrl(staff.image) || male

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '95vh', bgcolor: 'background.paper',
        borderRadius: 3, boxShadow: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fef3f7 100%)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                <FiEye className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Staff Details</h2>
                <p className="text-orange-100 opacity-90 mt-1">
                  Complete overview of staff member
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onEdit(staff)} className="flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg cursor-pointer">
                <FiEdit className="text-sm" /> Edit Staff
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl cursor-pointer">
                <FiX className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt={staff.name}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl object-cover shadow-lg"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{staff.name}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        staff.status === 'active' ? 'bg-green-100 text-green-800' :
                        staff.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.status || 'active'}
                      </span>
                      <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {staff.role}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{staff.position}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBriefcase className="text-orange-600" />
                  Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="text-gray-900 font-bold">{staff.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 font-bold">{staff.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-900 font-bold">{staff.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {staff.bio && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    Bio
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{staff.bio}</p>
                  </div>
                </div>
              )}

              {staff.expertise && staff.expertise.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiStar className="text-purple-600" />
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {staff.expertise.map((exp, index) => (
                      <span 
                        key={index} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-xl text-sm font-bold"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {staff.responsibilities && staff.responsibilities.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiBriefcase className="text-green-600" />
                  Key Responsibilities
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <ul className="space-y-2">
                    {staff.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {staff.achievements && staff.achievements.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiAward className="text-yellow-600" />
                  Achievements
                </h3>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                  <ul className="space-y-3">
                    {staff.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-2 rounded-xl">
                          <FiAward className="text-sm" />
                        </div>
                        <span className="text-gray-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <button 
              onClick={onClose} 
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg cursor-pointer"
            >
              Close
            </button>
            <button 
              onClick={() => onEdit(staff)} 
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg cursor-pointer"
            >
              <FiEdit /> Edit Staff
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

// Modern Staff Card Component
function ModernStaffCard({ staff, onEdit, onDelete, onView, selected, onSelect, actionLoading }) {
  const [imageError, setImageError] = useState(false)

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const imageUrl = getImageUrl(staff.image) || male

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 ${
      selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
    }`}>
      <div className="p-3 border-b border-gray-100 flex items-center">
        <input 
          type="checkbox" 
          checked={selected} 
          onChange={(e) => onSelect(staff.id, e.target.checked)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer" 
        />
        <span className="ml-2 text-sm text-gray-500">Select</span>
      </div>

      <div className="relative h-40 overflow-hidden">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={staff.name} 
            onClick={() => onView(staff)}
            className="w-full h-full object-cover cursor-pointer" 
            onError={() => setImageError(true)} 
          />
        ) : (
          <div 
            onClick={() => onView(staff)} 
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
          >
            <FiUser className="text-2xl mb-2" />
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(staff.status)}`}>
            {staff.status || 'active'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 
          onClick={() => onView(staff)} 
          className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-orange-800 text-base mb-2 line-clamp-2 cursor-pointer"
        >
          {staff.name}
        </h3>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
              {staff.role}
            </span>
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <FiBriefcase className="text-xs" />
              <span className="text-xs truncate max-w-[80px]">{staff.position}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">{staff.department}</span>
            <div className="flex items-center gap-1 text-green-600 font-bold">
              <FiCheckCircle className="text-xs" />
              <span>{staff.status || 'active'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onView(staff)} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-xl shadow-md cursor-pointer text-xs font-bold"
            >
              View
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onEdit(staff)} 
              disabled={actionLoading}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-2 py-1 rounded-xl disabled:opacity-50 shadow-md cursor-pointer text-xs font-bold"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(staff)} 
              disabled={actionLoading}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-xl disabled:opacity-50 shadow-md cursor-pointer text-xs font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modern Staff Modal Component
function ModernStaffModal({ onClose, onSave, staff, loading }) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    role: staff?.role || 'Teacher',
    position: staff?.position || '',
    department: staff?.department || 'Sciences',
    email: staff?.email || '',
    phone: staff?.phone || '',
    image: staff?.image || male,
    bio: staff?.bio || '',
    responsibilities: Array.isArray(staff?.responsibilities) ? staff.responsibilities : [],
    expertise: Array.isArray(staff?.expertise) ? staff.expertise : [],
    achievements: Array.isArray(staff?.achievements) ? staff.achievements : [],
    status: staff?.status || 'active'
  });

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(staff?.image || male)
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  const roles = ['Principal', 'Deputy Principal', 'Teacher', 'BOM Member', 'Support Staff', 'Librarian', 'Counselor'];
  const departments = ['Sciences', 'Mathematics', 'Languages', 'Humanities', 'Administration', 'Sports', 'Guidance'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData({ ...formData, image: '' });
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, staff?.id);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '95vh', bgcolor: 'background.paper',
        borderRadius: 3, boxShadow: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fef3f7 100%)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                <FiUser className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
                <p className="text-orange-100 opacity-90 mt-1">
                  Manage staff member information
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl cursor-pointer">
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200">
                    <FiUpload className="text-orange-600 text-lg" /> 
                    Profile Image
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <div className="px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer flex items-center gap-2 bg-gray-50">
                            <FiUpload className="text-orange-500" />
                            <span className="text-sm font-bold text-gray-700">
                              {imageFile ? 'Change Image' : 'Upload Image'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Avatar Selection */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2 font-medium">Or select a default avatar:</p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(male);
                            setFormData({ ...formData, image: male });
                          }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 ${
                            formData.image === male
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src="/male.png"
                            alt="Male Avatar"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <span className="text-xs font-bold text-gray-700">Male Avatar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(female);
                            setFormData({ ...formData, image: female });
                          }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 ${
                            formData.image === female
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src="/female.png"
                            alt="Female Avatar"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <span className="text-xs font-bold text-gray-700">Female Avatar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200">
                    <FiUser className="text-blue-600 text-lg" /> 
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Role and Position */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Role *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                      placeholder="e.g., Mathematics Teacher"
                    />
                  </div>
                </div>

                {/* Department and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Department *</label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                    >
                      <option value="active">Active</option>
                      <option value="on-leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                    <FiMail className="text-green-600 text-lg" /> 
                    Contact Information
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                        placeholder="staff@katwanyaa.ac.ke"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                        placeholder="+254 XXX XXX XXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                    <FiBook className="text-purple-600 text-lg" /> 
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                    placeholder="Brief biography about the staff member"
                  />
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Responsibilities</label>
                  <div className="space-y-2">
                    {formData.responsibilities.map((resp, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                          {resp}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('responsibilities', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newResponsibility}
                        onChange={(e) => setNewResponsibility(e.target.value)}
                        placeholder="Enter responsibility"
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                      />
                      <button
                        type="button"
                        onClick={addResponsibility}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expertise and Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expertise */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Expertise</label>
                <div className="space-y-2">
                  {formData.expertise.map((exp, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                        {exp}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('expertise', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="Enter expertise"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Achievements</label>
                <div className="space-y-2">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                        {achievement}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('achievements', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Enter achievement"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                    />
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button 
                type="button"
                onClick={onClose}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} className="text-white" />
                    {staff ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FiCheck />
                    {staff ? 'Update Staff' : 'Create Staff'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  )
}

// Main Staff Manager Component
export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // New states for delete confirmation and notification
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState('single'); // 'single' or 'bulk'
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  });

  const roles = ['Principal', 'Deputy Principal', 'Teacher', 'BOM Member', 'Support Staff', 'Librarian', 'Counselor'];
  const departments = ['Sciences', 'Mathematics', 'Languages', 'Humanities', 'Administration', 'Sports', 'Guidance'];

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff');
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.staff || []);
        setFilteredStaff(data.staff || []);
      } else {
        console.error('Failed to fetch staff:', data.error);
        setStaff([]);
        setFilteredStaff([]);
        showNotification('error', 'Fetch Failed', 'Failed to fetch staff data');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
      setFilteredStaff([]);
      showNotification('error', 'Error', 'Error fetching staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filtering and pagination
  useEffect(() => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(staffMember =>
        staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(staffMember => staffMember.department === selectedDepartment);
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(staffMember => staffMember.role === selectedRole);
    }

    setFilteredStaff(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedRole, staff]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Notification handler
  const showNotification = (type, title, message) => {
    setNotification({
      open: true,
      type,
      title,
      message
    });
  };

  // CRUD Operations
  const handleCreate = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetailModal(true);
  };

  // Single delete handler
  const handleDelete = (staffMember) => {
    setStaffToDelete(staffMember);
    setDeleteType('single');
    setShowDeleteModal(true);
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedPosts.size === 0) {
      showNotification('warning', 'No Selection', 'No staff members selected for deletion');
      return;
    }
    setDeleteType('bulk');
    setShowDeleteModal(true);
  };

  // Confirm delete (for both single and bulk)
  const confirmDelete = async () => {
    try {
      if (deleteType === 'single' && staffToDelete) {
        setBulkDeleting(true);
        const response = await fetch(`/api/staff/${staffToDelete.id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchStaff();
          showNotification('success', 'Deleted', `Staff member "${staffToDelete.name}" deleted successfully!`);
        } else {
          showNotification('error', 'Delete Failed', result.error || 'Failed to delete staff member');
        }
      } else if (deleteType === 'bulk') {
        setBulkDeleting(true);
        const deletedIds = [];
        const failedIds = [];
        
        // Delete each selected staff member
        for (const staffId of selectedPosts) {
          try {
            const response = await fetch(`/api/staff/${staffId}`, {
              method: 'DELETE',
            });
            
            const result = await response.json();
            
            if (result.success) {
              deletedIds.push(staffId);
            } else {
              console.error(`Failed to delete staff member ${staffId}:`, result.error);
              failedIds.push(staffId);
            }
          } catch (error) {
            console.error(`Error deleting staff member ${staffId}:`, error);
            failedIds.push(staffId);
          }
        }
        
        // Refresh the staff list
        await fetchStaff();
        
        // Clear selection
        setSelectedPosts(new Set());
        
        // Show appropriate notification
        if (deletedIds.length > 0 && failedIds.length === 0) {
          showNotification('success', 'Bulk Delete Successful', `Successfully deleted ${deletedIds.length} staff member(s)`);
        } else if (deletedIds.length > 0 && failedIds.length > 0) {
          showNotification('warning', 'Partial Success', `Deleted ${deletedIds.length} staff member(s), failed to delete ${failedIds.length}`);
        } else {
          showNotification('error', 'Delete Failed', 'Failed to delete selected staff members');
        }
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      showNotification('error', 'Error', 'Error during deletion');
    } finally {
      setBulkDeleting(false);
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  const handlePostSelect = (staffId, selected) => {
    setSelectedPosts(prev => { 
      const newSet = new Set(prev); 
      selected ? newSet.add(staffId) : newSet.delete(staffId); 
      return newSet 
    })
  }

  const handleSubmit = async (formData, id) => {
    setSaving(true);
    try {
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('role', formData.role);
      submitData.append('position', formData.position);
      submitData.append('department', formData.department);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('bio', formData.bio);
      submitData.append('status', formData.status);
      
      submitData.append('responsibilities', JSON.stringify(formData.responsibilities));
      submitData.append('expertise', JSON.stringify(formData.expertise));
      submitData.append('achievements', JSON.stringify(formData.achievements));
      
      if (formData.image && formData.image !== male && formData.image !== female) {
        submitData.append('image', formData.image);
      }

      let response;
      if (id) {
        response = await fetch(`/api/staff/${id}`, {
          method: 'PUT',
          body: submitData,
        });
      } else {
        response = await fetch('/api/staff', {
          method: 'POST',
          body: submitData,
        });
      }

      const result = await response.json();

      if (result.success) {
        await fetchStaff();
        setShowModal(false);
        showNotification('success', id ? 'Updated' : 'Created', `Staff member ${id ? 'updated' : 'created'} successfully!`);
      } else {
        showNotification('error', 'Save Failed', result.error || `Failed to ${id ? 'update' : 'create'} staff member`);
      }
    } catch (error) {
      console.error('Error saving staff member:', error);
      showNotification('error', 'Error', 'Error saving staff member');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const calculatedStats = {
      total: staff.length,
      teaching: staff.filter(s => s.role === 'Teacher').length,
      administration: staff.filter(s => s.role === 'Principal' || s.role === 'Deputy Principal').length,
      bom: staff.filter(s => s.role === 'BOM Member').length,
      active: staff.filter(s => s.status === 'active').length,
      onLeave: staff.filter(s => s.status === 'on-leave').length,
    };
    setStats(calculatedStats);
  }, [staff]);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-gray-700 font-medium">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} staff members
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
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
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

  if (loading && staff.length === 0) return <ModernLoadingSpinner message="Loading staff data..." size="medium" />

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
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
        onClose={() => !bulkDeleting && setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        type={deleteType}
        count={deleteType === 'bulk' ? selectedPosts.size : 1}
        staffName={deleteType === 'single' ? staffToDelete?.name : ''}
        loading={bulkDeleting}
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg border border-orange-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Staff & BOM Management</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage teaching staff, administration, and board members</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={fetchStaff} className="flex items-center gap-2 bg-gray-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-bold shadow-lg cursor-pointer text-sm">
              <FiRotateCw className={`text-xs ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-bold shadow-lg cursor-pointer text-sm">
              <FiPlus className="text-xs" /> Add Staff
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
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Total Staff</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                <FiUser className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Teaching Staff</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.teaching}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <FiBook className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Administration</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.administration}</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                <FiAward className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">BOM Members</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.bom}</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                <FiShield className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">Active</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                <FiCheckCircle className="text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-bold text-gray-600 mb-1">On Leave</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.onLeave}</p>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-2xl">
                <FiCalendar className="text-lg" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff members by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-gray-50"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 cursor-pointer text-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 cursor-pointer text-sm"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions - Only shows when items are selected */}
      {selectedPosts.size > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <FiTrash2 className="text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">
                  {selectedPosts.size} staff {selectedPosts.size === 1 ? 'member' : 'members'} selected
                </h3>
                <p className="text-red-700 text-sm">
                  You can perform bulk actions on selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedPosts(new Set())}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg cursor-pointer text-sm"
              >
                Clear Selection
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2 text-sm"
              >
                {bulkDeleting ? (
                  <>
                    <CircularProgress size={16} className="text-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete Selected ({selectedPosts.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {currentStaff.map((staffMember) => (
          <ModernStaffCard 
            key={staffMember.id} 
            staff={staffMember} 
            onEdit={handleEdit} 
            onDelete={() => handleDelete(staffMember)} 
            onView={handleViewDetails} 
            selected={selectedPosts.has(staffMember.id)} 
            onSelect={handlePostSelect} 
            actionLoading={saving}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentStaff.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
          <FiUser className="text-4xl lg:text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
            {searchTerm ? 'No staff members found' : 'No staff members available'}
          </h3>
          <p className="text-gray-600 text-sm lg:text-base mb-6 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first staff member'}
          </p>
          <button 
            onClick={handleCreate} 
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 mx-auto text-sm lg:text-base cursor-pointer"
          >
            <FiPlus /> Add Your First Staff Member
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredStaff.length > 0 && (
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200">
          <Pagination />
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <ModernStaffModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSubmit} 
          staff={editingStaff} 
          loading={saving} 
        />
      )}
      {showDetailModal && selectedStaff && (
        <ModernStaffDetailModal 
          staff={selectedStaff} 
          onClose={() => setShowDetailModal(false)} 
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}