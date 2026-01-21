'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiImage, FiFilter, FiDownload,
  FiX, FiEye, FiUpload, FiStar, FiGrid, FiList, FiChevronLeft,
  FiChevronRight, FiCheck, FiVideo, FiUser, FiCalendar, FiRotateCw,
  FiTag, FiFolder, FiInfo, FiUsers, FiAlertCircle, FiExternalLink,
  FiChevronUp, FiChevronDown, FiShare2, FiCopy, FiMaximize2, FiMinimize2,
  FiEdit2, FiSave, FiXCircle, FiEyeOff, FiLock, FiUnlock, FiLink,
  FiRefreshCw, FiFile, FiCheckCircle, FiUploadCloud, FiReplace
} from 'react-icons/fi';
import { Toaster, toast } from 'sonner';
import { Play, ArrowUpRight, Clock } from 'lucide-react';

// Categories from your backend API
const CATEGORIES = [
  { value: 'GENERAL', label: 'General', color: 'gray' },
  { value: 'CLASSROOMS', label: 'Classrooms', color: 'blue' },
  { value: 'LABORATORIES', label: 'Laboratories', color: 'purple' },
  { value: 'DORMITORIES', label: 'Dormitories', color: 'green' },
  { value: 'DINING_HALL', label: 'Dining Hall', color: 'orange' },
  { value: 'SPORTS_FACILITIES', label: 'Sports Facilities', color: 'red' },
  { value: 'TEACHING', label: 'Teaching', color: 'cyan' },
  { value: 'SCIENCE_LAB', label: 'Science Lab', color: 'indigo' },
  { value: 'COMPUTER_LAB', label: 'Computer Lab', color: 'teal' },
  { value: 'SPORTS_DAY', label: 'Sports Day', color: 'emerald' },
  { value: 'MUSIC_FESTIVAL', label: 'Music Festival', color: 'pink' },
  { value: 'DRAMA_PERFORMANCE', label: 'Drama Performance', color: 'yellow' },
  { value: 'ART_EXHIBITION', label: 'Art Exhibition', color: 'amber' },
  { value: 'DEBATE_COMPETITION', label: 'Debate Competition', color: 'rose' },
  { value: 'SCIENCE_FAIR', label: 'Science Fair', color: 'violet' },
  { value: 'ADMIN_OFFICES', label: 'Admin Offices', color: 'slate' },
  { value: 'STAFF', label: 'Staff', color: 'stone' },
  { value: 'PRINCIPAL', label: 'Principal', color: 'zinc' },
  { value: 'BOARD', label: 'Board', color: 'neutral' },
  { value: 'GRADUATION', label: 'Graduation', color: 'sky' },
  { value: 'AWARD_CEREMONY', label: 'Award Ceremony', color: 'fuchsia' },
  { value: 'PARENTS_DAY', label: 'Parents Day', color: 'lime' },
  { value: 'OPEN_DAY', label: 'Open Day', color: 'cyan' },
  { value: 'VISITORS', label: 'Visitors', color: 'orange' },
  { value: 'STUDENT_ACTIVITIES', label: 'Student Activities', color: 'green' },
  { value: 'CLUBS', label: 'Clubs', color: 'purple' },
  { value: 'COUNCIL', label: 'Council', color: 'blue' },
  { value: 'LEADERSHIP', label: 'Leadership', color: 'red' },
  { value: 'OTHER', label: 'Other', color: 'gray' }
];

export default function ModernGalleryManager() {
  // State
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFilePreviews, setSelectedFilePreviews] = useState({});
  const [filesToRemove, setFilesToRemove] = useState([]); // Track files to remove during edit
  const [showExistingFiles, setShowExistingFiles] = useState(true); // Toggle existing files view
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const itemsPerPage = 12;

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    files: []
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch gallery items from API with error handling
  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      
      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON");
      }
      
      const result = await response.json();
      
      if (result.success && result.galleries) {
        const transformedItems = result.galleries.map(gallery => ({
          id: gallery.id,
          title: gallery.title,
          description: gallery.description || '',
          category: gallery.category,
          files: gallery.files || [],
          fileType: determineMediaType(gallery.files?.[0]),
          previewUrl: gallery.files?.[0] || '',
          fileCount: gallery.files?.length || 0,
          uploadDate: gallery.createdAt,
          updatedAt: gallery.updatedAt,
          views: Math.floor(Math.random() * 1000),
          likes: Math.floor(Math.random() * 500),
          isPublic: true
        }));
        
        // Sort items
        const sortedItems = transformedItems.sort((a, b) => {
          switch(sortBy) {
            case 'newest': return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'title': return a.title.localeCompare(b.title);
            case 'mostFiles': return b.fileCount - a.fileCount;
            default: return new Date(b.uploadDate) - new Date(a.uploadDate);
          }
        });
        
        setGalleryItems(sortedItems);
        setFilteredItems(sortedItems);
        toast.success(`Loaded ${sortedItems.length} galleries`);
      } else {
        throw new Error(result.error || 'Failed to load galleries');
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast.error(`Failed to load gallery items: ${error.message}`);
      
      // Set empty arrays on error
      setGalleryItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Determine media type
  const determineMediaType = (filePath) => {
    if (!filePath) return 'image';
    const extension = filePath.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'image';
  };

  useEffect(() => {
    fetchGalleryItems();
  }, [sortBy]);

  // Filter items
  useEffect(() => {
    let filtered = galleryItems.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [galleryItems, searchTerm, selectedCategory]);

  // File handling with previews
  const handleFilesSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      
      if (!isValidType) {
        toast.error(`${file.name}: Unsupported format`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name}: Exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      toast.warning('Please select valid files (images/videos, max 10MB)');
      return;
    }

    // Create preview URLs for images
    const newPreviews = {};
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviews[file.name] = URL.createObjectURL(file);
      }
    });

    setSelectedFilePreviews(prev => ({ ...prev, ...newPreviews }));
    
    setFormData(prev => ({ 
      ...prev, 
      files: [...prev.files, ...validFiles].slice(0, 20)
    }));
    
    toast.success(`${validFiles.length} file(s) added`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (fileName) => {
    // Revoke object URL if it exists
    if (selectedFilePreviews[fileName]) {
      URL.revokeObjectURL(selectedFilePreviews[fileName]);
    }
    
    setSelectedFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileName];
      return newPreviews;
    });
    
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.name !== fileName)
    }));
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    
    toast.info('File removed');
  };

  // Remove existing file from gallery during edit
  const removeExistingFile = (fileUrl, itemId) => {
    if (editingItem && editingItem.id === itemId) {
      setFilesToRemove(prev => [...prev, fileUrl]);
      toast.info('File marked for removal. Click Save Changes to confirm.');
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(selectedFilePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [selectedFilePreviews]);

  // CRUD Operations
  const handleCreate = async () => {
    if (!formData.title.trim() || formData.files.length === 0) {
      toast.warning('Please provide a title and select files');
      return;
    }

    setIsUploading(true);
    
    const loadingToast = toast.loading('Uploading gallery...');
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      formData.files.forEach(file => {
        submitData.append('files', file);
      });

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Gallery created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchGalleryItems();
      } else {
        throw new Error(result.error || 'Failed to create gallery');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFilesToRemove([]); // Reset files to remove
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      files: []
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      toast.warning('Please provide a title');
      return;
    }

    setIsUploading(true);
    
    const loadingToast = toast.loading('Updating gallery...');
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      // Append files to remove
      filesToRemove.forEach(fileUrl => {
        submitData.append('filesToRemove', fileUrl);
      });
      
      // Append new files
      if (formData.files.length > 0) {
        formData.files.forEach(file => {
          submitData.append('files', file);
        });
      }

      const response = await fetch(`/api/gallery/${editingItem.id}`, {
        method: 'PUT',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Gallery updated successfully!');
        setShowEditModal(false);
        setEditingItem(null);
        setFilesToRemove([]);
        resetForm();
        fetchGalleryItems();
      } else {
        throw new Error(result.error || 'Failed to update gallery');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const loadingToast = toast.loading('Deleting gallery...');
    
    try {
      const response = await fetch(`/api/gallery/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        setGalleryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemToDelete.id);
          return newSet;
        });
        
        toast.success('Gallery deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete gallery');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Error: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedItems.size} selected galleries? This cannot be undone.`)) {
      return;
    }

    const loadingToast = toast.loading(`Deleting ${selectedItems.size} galleries...`);
    const deletePromises = Array.from(selectedItems).map(id => 
      fetch(`/api/gallery/${id}`, { method: 'DELETE' }).then(res => res.json())
    );

    try {
      const results = await Promise.all(deletePromises);
      const successful = results.filter(result => result.success).length;
      
      toast.dismiss(loadingToast);
      
      if (successful > 0) {
        setGalleryItems(prev => prev.filter(item => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
        
        toast.success(`${successful} galleries deleted successfully!`);
      } else {
        throw new Error('Failed to delete galleries');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'GENERAL',
      files: []
    });
    setUploadProgress({});
    setFilesToRemove([]);
    // Clean up preview URLs
    Object.values(selectedFilePreviews).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setSelectedFilePreviews({});
  };

  // Preview handling
  const handlePreview = (item) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  // Preview existing file
  const previewExistingFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  // Selection handling
  const toggleSelection = (id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(selectedItems.size === currentItems.length ? new Set() : new Set(currentItems.map(item => item.id)));
  };

  // Image error handling
  const handleImageError = (id) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Stats
  const stats = {
    total: galleryItems.length,
    totalFiles: galleryItems.reduce((acc, item) => acc + item.files.length, 0),
    images: galleryItems.filter(item => item.fileType === 'image').reduce((acc, item) => acc + item.files.length, 0),
    videos: galleryItems.filter(item => item.fileType === 'video').reduce((acc, item) => acc + item.files.length, 0),
    categories: new Set(galleryItems.map(item => item.category)).size
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 lg:p-6 space-y-6">
      <Toaster position="top-right" expand={false} richColors />

      {/* Modern Gallery Header */}
      <div className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-100/50 border border-blue-100">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/5 rounded-full -translate-y-16 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-violet-400/10 to-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Left Content - Title and Description */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              {/* Icon Badge */}
              <div className="relative p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <FiImage className="text-2xl text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">{galleryItems.length}</span>
                </div>
              </div>
              
              {/* Title Section */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
                    Media Gallery
                  </h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-medium inline-flex items-center gap-1">
                    <FiGrid className="text-xs" />
                    {galleryItems.length} Items
                  </span>
                </div>
                <p className="text-gray-600 text-base md:text-lg max-w-2xl">
                  Curate and manage your school's visual stories. Upload images & videos to showcase campus life, events, and achievements.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiImage className="text-blue-500" />
                    <span>Images & Videos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiFolder className="text-cyan-500" />
                    <span>{Array.from(new Set(galleryItems.map(item => item.category))).length} Categories</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiCalendar className="text-violet-500" />
                    <span>Updated just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Right Content - Action Buttons */}
<div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

  {/* Refresh Button */}
  <button
    onClick={fetchGalleryItems}
    disabled={loading}
    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md
               flex items-center justify-center gap-2 text-sm font-medium
               hover:bg-gray-100 transition disabled:opacity-60"
  >
    {loading ? (
      <>
        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
        Refreshing…
      </>
    ) : (
      'Refresh'
    )}
  </button>

  {/* Upload Button */}
  <button
    onClick={() => setShowCreateModal(true)}
    disabled={loading}
    className="px-4 py-2.5 bg-indigo-600 text-white rounded-md
               flex items-center justify-center gap-2 text-sm font-medium
               hover:bg-indigo-700 transition disabled:opacity-60"
  >
    Upload Gallery
  </button>

</div>

        </div>
      </div>

      {/* Rest of your component remains the same... */}
{/* Stats Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {[
    { label: 'Total Galleries', value: stats.total, icon: FiFolder, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Total Files', value: stats.totalFiles, icon: FiImage, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Images', value: stats.images, icon: FiImage, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Videos', value: stats.videos, icon: FiVideo, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  ].map((stat) => (
    <div
      key={stat.label}
      className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-transparent"
    >
      <div className="flex flex-col items-start gap-4">
        {/* Icon Container */}
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${stat.bg} ${stat.border} border transition-all duration-300 group-hover:scale-110 group-hover:shadow-inner`}>
          <stat.icon className={`text-xl ${stat.color}`} />
        </div>
        
        {/* Text Content */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {stat.label}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            {stat.value.toLocaleString()}
          </h3>
        </div>
      </div>
      
      {/* Subtle bottom accent line that appears on hover */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gray-900 rounded-full transition-all duration-300 group-hover:w-1/3 opacity-10" />
    </div>
  ))}
</div>

  {/* Modernized Filters Bar */}
<div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-4 border border-gray-100 shadow-sm transition-all duration-300">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
    
    {/* Search - Spans 4 columns */}
    <div className="md:col-span-4 relative group">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      <input
        type="text"
        placeholder="Search galleries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
      />
    </div>

    {/* Category Select - Spans 3 columns */}
    <div className="md:col-span-3">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map(cat => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>
    </div>

    {/* Sort Select - Spans 2 columns */}
    <div className="md:col-span-2">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">A-Z</option>
        <option value="mostFiles">Files</option>
      </select>
    </div>

    {/* Actions & Toggle - Spans 3 columns */}
    <div className="md:col-span-3 flex items-center justify-between gap-3 pl-2">
      <div className="flex bg-gray-100/80 p-1 rounded-xl items-center">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm scale-100' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiGrid className="text-lg" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm scale-100' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiList className="text-lg" />
        </button>
      </div>
      
      <button 
        onClick={selectAll}
        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl transition-colors whitespace-nowrap"
      >
        {selectedItems.size === currentItems.length ? 'Deselect' : 'Select All'}
      </button>
    </div>

  </div>
</div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiCheck className="text-xl" />
              </div>
              <span className="font-semibold">
                {selectedItems.size} gallery{selectedItems.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 sm:px-6 py-2 bg-red-500/80 rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base"
              >
                <FiTrash2 />
                <span className="hidden sm:inline">Delete Selected</span>
                <span className="sm:hidden">Delete</span>
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-4 sm:px-6 py-2 bg-white/20 rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base"
              >
                <FiX />
                <span className="hidden sm:inline">Clear Selection</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Content */}
      {currentItems.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
          <div className="text-gray-300 text-6xl mb-4">📷</div>
          <h3 className="text-gray-800 text-xl font-semibold mb-2">No galleries found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by uploading your first gallery'
            }
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setShowCreateModal(true);
            }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-semibold shadow-lg text-sm sm:text-base"
          >
            <FiUpload className="inline mr-2" />
            Upload Gallery
          </button>
        </div>
      ) : (
        <>
          {/* Gallery Grid/List */}
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
              : 'space-y-3'
          }`}>
            {currentItems.map((item) => (
              <ModernGalleryItem
                key={item.id}
                item={item}
                viewMode={viewMode}
                isSelected={selectedItems.has(item.id)}
                hasError={imageErrors.has(item.id)}
                onSelect={() => toggleSelection(item.id)}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
                onPreview={() => handlePreview(item)}
                onImageError={() => handleImageError(item.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="text-lg" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-semibold ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="text-lg" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEditModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          dragActive={dragActive}
          categories={CATEGORIES}
          selectedFilePreviews={selectedFilePreviews}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          dropdownRef={dropdownRef}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onSubmit={handleCreate}
          onFileSelect={handleFilesSelect}
          onDrag={handleDrag}
          onDrop={handleDrop}
          removeFile={removeFile}
          fileInputRef={fileInputRef}
          onRefresh={fetchGalleryItems}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <CreateEditModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          editingItem={editingItem}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          dragActive={dragActive}
          categories={CATEGORIES}
          selectedFilePreviews={selectedFilePreviews}
          filesToRemove={filesToRemove}
          setFilesToRemove={setFilesToRemove}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          dropdownRef={dropdownRef}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
            resetForm();
          }}
          onSubmit={handleUpdate}
          onFileSelect={handleFilesSelect}
          onDrag={handleDrag}
          onDrop={handleDrop}
          removeFile={removeFile}
          removeExistingFile={removeExistingFile}
          previewExistingFile={previewExistingFile}
          fileInputRef={fileInputRef}
          onRefresh={fetchGalleryItems}
          showExistingFiles={showExistingFiles}
          setShowExistingFiles={setShowExistingFiles}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setShowPreviewModal(false)}
          onEdit={() => {
            setShowPreviewModal(false);
            handleEdit(previewItem);
          }}
          onDelete={() => {
            setShowPreviewModal(false);
            handleDelete(previewItem);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <DeleteConfirmationModal
          item={itemToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

// Modern Gallery Item Component
const ModernGalleryItem = ({ 
  item, viewMode, isSelected, hasError, 
  onSelect, onEdit, onDelete, onPreview,
  onImageError
}) => {
  const formatCategory = (category) => {
    if (!category) return '';
    return category.toLowerCase().replace(/_/g, ' ');
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-200/50 ${
          isSelected ? 'border-blue-500 bg-blue-50/30' : ''
        }`}
      >
        <button 
          onClick={onSelect}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white border-gray-300'
          }`}
        >
          {isSelected && <FiCheck className="text-xs" />}
        </button>

        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative cursor-pointer" onClick={onPreview}>
          {hasError ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FiImage className="text-gray-400 text-xl" />
            </div>
          ) : item.fileType === 'image' ? (
            <>
              <img
                src={item.files[0]}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={onImageError}
              />
              {item.files.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  +{item.files.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <FiVideo className="text-white text-2xl" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 truncate cursor-pointer" onClick={onPreview}>{item.title}</h3>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {formatCategory(item.category)}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1 truncate">{item.description || 'No description'}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded ${item.fileType === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              {item.fileType === 'image' ? 'GALLERY' : 'VIDEO'}
            </span>
            <span>•</span>
            <span>{item.files.length} file{item.files.length > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs sm:text-sm font-medium"
          >
            <span className="hidden sm:inline">View</span>
            <FiEye className="sm:hidden" />
          </button>
          <button
            onClick={onEdit}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs sm:text-sm font-medium"
          >
            <span className="hidden sm:inline">Edit</span>
            <FiEdit className="sm:hidden" />
          </button>
          <button
            onClick={onDelete}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs sm:text-sm font-medium"
          >
            <span className="hidden sm:inline">Delete</span>
            <FiTrash2 className="sm:hidden" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`group relative w-full bg-white rounded-[2rem] p-3 transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-200/60 flex flex-col ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : ''
    }`}>
      
      {/* Container for Media Preview */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-inner cursor-pointer" onClick={onPreview}>
        {hasError ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
            <div className="text-center">
              <FiImage className="text-slate-400 text-3xl mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Failed to load</p>
            </div>
          </div>
        ) : item.fileType === 'image' ? (
          <>
            <img
              src={item.files[0]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              onError={onImageError}
            />
            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Play Icon Overlay for Images */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEye className="text-slate-800 text-lg" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-3 mx-auto shadow-lg">
                <FiVideo className="text-white text-2xl" />
              </div>
              <p className="text-white/90 text-sm font-medium">Video Gallery</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
                <Play className="text-white text-2xl ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Top Left Badge: Selection Checkbox */}
        <button
          onClick={onSelect}
          className={`absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 rounded-xl backdrop-blur-xl border ${
            isSelected 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-white/40 text-white shadow-lg' 
              : 'bg-white/70 border-white/40 text-slate-400 hover:bg-white hover:text-slate-800'
          } transition-all duration-300`}
        >
          <FiCheck className={`text-sm ${isSelected ? '' : 'opacity-0 group-hover:opacity-100'}`} />
        </button>

        {/* Top Right Badge: Category */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-800 shadow-sm">
            <FiFolder size={12} className="text-indigo-600" />
            {formatCategory(item.category)}
          </div>
        </div>

        {/* Multiple Files Indicator */}
        {item.files.length > 1 && (
          <div className="absolute top-4 left-14 z-10">
            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold shadow-lg">
              +{item.files.length - 1}
            </div>
          </div>
        )}

        {/* Interactive Action */}
        <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg hover:shadow-xl transition-shadow">
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-5 py-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black tracking-[0.2em] text-cyan-600 uppercase">
            {item.fileType === 'image' ? 'PHOTO GALLERY' : 'VIDEO GALLERY'}
          </span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>
        </div>
        
        <h2 
          className="text-xl font-bold text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors duration-300 cursor-pointer line-clamp-1"
          onClick={onPreview}
          title={item.title}
        >
          {item.title}
        </h2>
        
        <p className="text-slate-500 leading-relaxed text-[14px] mb-5 line-clamp-2" title={item.description}>
          {item.description || 'No description provided'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={onPreview}
            className="flex-1 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:from-slate-100 hover:to-slate-200 transition-all duration-300 group/btn"
          >
            <FiEye className="text-slate-600 group-hover/btn:text-blue-600 transition-colors" />
            <span>View</span>
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 group/btn"
          >
            <FiEdit className="text-emerald-600 group-hover/btn:text-emerald-700" />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2.5 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:from-rose-100 hover:to-rose-200 transition-all duration-300 group/btn"
          >
            <FiTrash2 className="text-rose-600 group-hover/btn:text-rose-700" />
            <span>Delete</span>
          </button>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <Clock size={14} className="text-slate-400" />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {new Date(item.uploadDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FiImage className="text-slate-400 text-sm" />
              <span className="text-xs font-semibold text-slate-500">{item.files.length}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-slate-300 to-slate-400">
                  <img 
                    src={`https://i.pravatar.cc/100?u=gallery-${item.id}-${i}`} 
                    alt="user" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Modal Component
const CreateEditModal = ({
  mode, formData, setFormData, editingItem, uploadProgress, isUploading, dragActive,
  categories, selectedFilePreviews, filesToRemove, setFilesToRemove, onClose, onSubmit, 
  onFileSelect, onDrag, onDrop, removeFile, removeExistingFile, previewExistingFile,
  fileInputRef, onRefresh, showExistingFiles, setShowExistingFiles,
  dropdownOpen, setDropdownOpen, dropdownRef
}) => {
  // Determine if a file is marked for removal
  const isFileMarkedForRemoval = (fileUrl) => {
    return filesToRemove.includes(fileUrl);
  };

  // Handle removing existing file
  const handleRemoveExisting = (fileUrl) => {
    removeExistingFile(fileUrl, editingItem?.id);
  };

  // Handle previewing existing file
  const handlePreviewExisting = (fileUrl) => {
    previewExistingFile(fileUrl);
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
    setDropdownOpen(false);
  };

return (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
    <div className="bg-white sm:rounded-[2.5rem] w-full max-w-5xl max-h-screen sm:max-h-[92vh] overflow-hidden shadow-2xl my-auto flex flex-col border border-white/20">
      
      {/* Header: Dynamic Gradient based on Mode */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
            mode === 'create' 
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            {mode === 'create' ? <FiUpload className="text-white text-xl" /> : <FiEdit2 className="text-white text-xl" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {mode === 'create' ? 'New Gallery' : 'Edit Gallery'}
            </h2>
            <p className="text-gray-400 text-xs font-medium">
              {mode === 'create' ? 'Set up your collection' : 'Modify gallery details and assets'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            <FiRefreshCw className={`text-sm ${isUploading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            disabled={isUploading}
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Section: Asset Management */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Assets & Media</h3>
            
            {/* Existing Files: Floating Glass Card */}
            {mode === 'edit' && editingItem && editingItem.files.length > 0 && (
              <div className="rounded-[2rem] p-6 bg-slate-50 border border-gray-100 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <h3 className="font-bold text-gray-800 text-sm">
                      Existing Gallery Files ({editingItem.files.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowExistingFiles(!showExistingFiles)}
                    className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-violet-600 shadow-sm hover:shadow-md transition-all"
                  >
                    {showExistingFiles ? 'Collapse View' : 'Expand View'}
                  </button>
                </div>
                
                {showExistingFiles && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {editingItem.files.map((fileUrl, index) => {
                      const isMarked = isFileMarkedForRemoval(fileUrl);
                      return (
                        <div key={index} className={`group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                          isMarked ? 'ring-2 ring-red-500 ring-offset-2 scale-90' : 'hover:shadow-xl'
                        }`}>
                          <img src={fileUrl} className={`w-full h-full object-cover ${isMarked ? 'opacity-30 grayscale' : ''}`} />
                          
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {!isMarked ? (
                              <button onClick={() => handleRemoveExisting(fileUrl)} className="p-2 bg-red-500 text-white rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                <FiTrash2 size={18} />
                              </button>
                            ) : (
                              <button onClick={() => setFilesToRemove(prev => prev.filter(url => url !== fileUrl))} className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg">
                                <FiRotateCcw size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upload Zone: Modern Minimalist */}
            <div 
              onDragOver={onDrag} onDrop={onDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all cursor-pointer group ${
                dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 bg-gray-50/30'
              }`}
            >
              <input type="file" multiple ref={fileInputRef} onChange={(e) => onFileSelect(e.target.files)} className="hidden" />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiUploadCloud className="text-3xl text-indigo-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Drop your files here</h4>
                <p className="text-sm text-gray-400 mt-1 mb-6">PNG, JPG, MP4 or WebM (Max 10MB)</p>
                <span className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 shadow-sm">Browse Files</span>
              </div>
            </div>
          </div>

          {/* Section: Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gallery Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Vacation 2024"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="space-y-2" ref={dropdownRef}>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-left flex items-center justify-between text-gray-700 font-medium"
                  >
                    <span>{categories.find(c => c.value === formData.category)?.label || 'Choose category...'}</span>
                    <FiChevronDown className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute z-[60] w-full mt-2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => handleCategorySelect(cat.value)}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Write a brief story about this gallery..."
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Floating Style */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
             {formData.files.length} Queue • {filesToRemove.length} Removal
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-8 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isUploading || !formData.title.trim()}
            className={`flex-1 sm:flex-none px-10 py-4 rounded-[1.25rem] text-sm font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              mode === 'create' 
                ? 'bg-slate-900 hover:bg-slate-800' 
                : 'bg-emerald-600 hover:bg-emerald-500'
            } disabled:bg-gray-200 disabled:shadow-none`}
          >
            {isUploading ? (
              <FiRotateCw className="animate-spin text-lg" />
            ) : (
              <>
                {mode === 'create' ? <FiPlus /> : <FiSave />}
                {mode === 'create' ? 'Publish Gallery' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

// Preview Modal Component
const PreviewModal = ({ item, onClose, onEdit, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentFile = item.files[currentIndex];
  const isImage = item.fileType === 'image';

  const nextFile = () => {
    setCurrentIndex((prev) => (prev + 1) % item.files.length);
  };

  const prevFile = () => {
    setCurrentIndex((prev) => (prev - 1 + item.files.length) % item.files.length);
  };

  const copyUrl = () => {
    const targetPath = "/pages/gallery";
    const fullUrl = `${window.location.origin}${targetPath}`;

    navigator.clipboard.writeText(fullUrl);
    
    toast.success('Gallery link copied to clipboard!');
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = currentFile;
    link.download = currentFile.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

 return (
  <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 z-50">
    <div className="bg-white sm:rounded-[2.5rem] w-full max-w-6xl max-h-screen sm:max-h-[95vh] overflow-hidden shadow-2xl flex flex-col transition-all">
      
      {/* Immersive Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FiEye className="text-blue-600 text-lg" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">
              {item.title}
            </h2>
            <p className="text-gray-400 text-[10px] sm:text-xs uppercase font-bold tracking-widest">
              {currentIndex + 1} / {item.files.length} • {item.category.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden sm:block text-gray-500"
          >
            {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          
          {/* Media Stage: Dark background makes content pop */}
          <div className="relative bg-slate-50 group aspect-video sm:aspect-auto sm:min-h-[500px] flex items-center justify-center overflow-hidden">
            
            {/* Nav Arrows - Only visible on hover/touch */}
            {item.files.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-10 pointer-events-none">
                <button
                  onClick={prevFile}
                  className="p-4 rounded-2xl bg-white/90 backdrop-blur shadow-xl text-gray-900 pointer-events-auto opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={nextFile}
                  className="p-4 rounded-2xl bg-white/90 backdrop-blur shadow-xl text-gray-900 pointer-events-auto opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                >
                  <FiChevronRight size={24} />
                </button>
              </div>
            )}

            {/* Content Display */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {isImage ? (
                <img
                  src={currentFile}
                  alt={item.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                />
              ) : (
                <video
                  src={currentFile}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-xl shadow-2xl"
                />
              )}
            </div>
          </div>

          {/* Details & Info Panel */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tighter rounded-lg">
                   {item.category.replace(/_/g, ' ')}
                </span>
                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-tighter rounded-lg">
                   {item.files.length} Files
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {item.description}
              </p>
              
              {/* Thumbnail Strip */}
              {item.files.length > 1 && (
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Gallery Collection</h4>
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {item.files.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`relative min-w-[80px] h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                          index === currentIndex ? 'ring-4 ring-blue-500 ring-offset-2 scale-95' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={file} className="w-full h-full object-cover" />
                        {file.match(/\.(mp4|webm|mov)$/i) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <FiVideo className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-3">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Actions</h4>
               <button onClick={downloadFile} className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all group">
                 <span className="font-semibold">Download Original</span>
                 <FiDownload className="group-hover:translate-y-0.5 transition-transform" />
               </button>
               <button onClick={copyUrl} className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                 <span className="font-semibold">Copy Direct Link</span>
                 <FiCopy />
               </button>
               <div className="grid grid-cols-2 gap-3 pt-2">
                 <button onClick={onEdit} className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all">
                   <FiEdit2 size={16} /> Edit
                 </button>
                 <button onClick={onDelete} className="flex items-center justify-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all">
                   <FiTrash2 size={16} /> Delete
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ item, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
            <FiAlertCircle className="text-white text-2xl" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Delete Gallery</h3>
            <p className="text-gray-600 text-sm">This action cannot be undone</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Are you sure you want to delete the gallery 
            <span className="font-semibold text-gray-800"> "{item.title}"</span>?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-red-700">
              <FiAlertCircle className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm sm:text-base">This will permanently delete:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span>{item.files.length} file{item.files.length > 1 ? 's' : ''}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span>Gallery title and description</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span>All associated metadata</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Gallery Preview */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
              {item.files[0] && (
                <img
                  src={item.files[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-800 truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {item.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-600">
                  {item.files.length} file{item.files.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium text-sm sm:text-base"
          >
            Delete Gallery
          </button>
        </div>
      </div>
    </div>
  );
};