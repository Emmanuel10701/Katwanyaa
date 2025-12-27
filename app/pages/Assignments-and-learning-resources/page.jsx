'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { 
  FiSearch, FiFilter, FiDownload, FiCalendar, FiBook, FiUser, FiClock,
  FiCheckCircle, FiAlertCircle, FiArrowRight, FiEye, FiUpload, FiBarChart2,
  FiAward, FiX, FiTarget, FiFileText, FiMessageSquare, FiChevronLeft,
  FiChevronRight, FiHome, FiStar, FiBookOpen, FiUsers, FiBookmark, FiFile,
  FiFolder, FiVideo, FiImage, FiMusic, FiExternalLink, FiGrid, FiList,
  FiRefreshCw, FiPlayCircle, FiTrendingUp, FiShield, FiActivity, FiFilePlus,
  FiPlay, FiMic, FiCamera, FiPackage, FiFlag, FiZap, FiAlertTriangle,
  FiCalendar as FiCalendarIcon, FiClipboard, FiArchive, FiThumbsUp, FiSend,
  FiBook as FiBookIcon, FiBell, FiGlobe, FiHelpCircle, FiLogOut, FiLock,FiLogIn 
} from 'react-icons/fi';
import StudentLoginModal from '../../components/studentloginmodel/page';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const ASSIGNMENTS_API = `${API_BASE_URL}/api/assignment`;
const RESOURCES_API = `${API_BASE_URL}/api/resources`;

// Configuration
const RESOURCE_TYPES = [
  { id: 'all', label: 'All Types', color: 'slate', icon: <FiFilePlus className="text-gray-600" /> },
  { id: 'document', label: 'Documents', color: 'blue', icon: <FiFileText className="text-blue-500" /> },
  { id: 'pdf', label: 'PDF Files', color: 'red', icon: <FiFileText className="text-red-500" /> },
  { id: 'video', label: 'Videos', color: 'purple', icon: <FiPlay className="text-purple-500" /> },
  { id: 'presentation', label: 'Presentations', color: 'orange', icon: <FiBarChart2 className="text-orange-500" /> },
  { id: 'worksheet', label: 'Worksheets', color: 'emerald', icon: <FiFilePlus className="text-emerald-500" /> },
  { id: 'audio', label: 'Audio Files', color: 'indigo', icon: <FiMic className="text-indigo-500" /> },
  { id: 'image', label: 'Images', color: 'pink', icon: <FiCamera className="text-pink-500" /> }
];

const ASSIGNMENT_STATUS = [
  { id: 'all', label: 'All Status', color: 'slate', icon: <FiClipboard className="text-gray-600" /> },
  { id: 'assigned', label: 'Assigned', color: 'blue', icon: <FiFlag className="text-blue-500" /> },
  { id: 'reviewed', label: 'Reviewed', color: 'green', icon: <FiCheckCircle className="text-green-500" /> },
  { id: 'completed', label: 'Completed', color: 'purple', icon: <FiAward className="text-purple-500" /> },
  { id: 'extended', label: 'Extended', color: 'orange', icon: <FiClock className="text-orange-500" /> }
];

const ITEMS_PER_PAGE = {
  assignments: 6,
  resources: 8
};

// Helper functions
const getBadgeColorStyles = (colorName) => {
  const map = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  return map[colorName] || map.slate;
};

const getFileIcon = (fileName) => {
  if (!fileName) return <FiFile className="text-gray-600" />;
  
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FiFileText className="text-red-500" />;
    case 'doc':
    case 'docx':
      return <FiFileText className="text-blue-500" />;
    case 'ppt':
    case 'pptx':
      return <FiBarChart2 className="text-orange-500" />;
    case 'xls':
    case 'xlsx':
      return <FiBarChart2 className="text-green-500" />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FiPlay className="text-purple-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FiCamera className="text-pink-500" />;
    case 'mp3':
    case 'wav':
      return <FiMic className="text-indigo-500" />;
    default:
      return <FiFile className="text-gray-600" />;
  }
};

const getResourceTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return <FiPlay className="text-purple-500" />;
    case 'document':
      return <FiFileText className="text-blue-500" />;
    case 'presentation':
      return <FiBarChart2 className="text-orange-500" />;
    case 'worksheet':
      return <FiFilePlus className="text-green-500" />;
    case 'audio':
      return <FiMic className="text-indigo-500" />;
    case 'image':
      return <FiCamera className="text-pink-500" />;
    case 'pdf':
      return <FiFileText className="text-red-500" />;
    default:
      return <FiFile className="text-gray-600" />;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'reviewed': return 'bg-gradient-to-r from-green-500 to-emerald-600';
    case 'assigned': return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    case 'extended': return 'bg-gradient-to-r from-orange-500 to-amber-600';
    case 'completed': return 'bg-gradient-to-r from-purple-500 to-pink-600';
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'reviewed': return <FiCheckCircle className="text-white" />;
    case 'assigned': return <FiClock className="text-white" />;
    case 'extended': return <FiAlertCircle className="text-white" />;
    case 'completed': return <FiAward className="text-white" />;
    default: return <FiClock className="text-white" />;
  }
};

// Main Component
export default function StudentPortalPage() {
  const router = useRouter();
  
  // State
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentResourcePage, setCurrentResourcePage] = useState(1);
  const [allAssignments, setAllAssignments] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('assignments');
  const [assignmentsView, setAssignmentsView] = useState('grid');
  const [resourcesView, setResourcesView] = useState('grid');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [downloading, setDownloading] = useState({});
  
  // Student Auth State
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [requiresContact, setRequiresContact] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('student_token');
        if (!savedToken) {
          setShowLoginModal(true);
          return;
        }

        const response = await fetch('/api/studentlogin', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });

        const data = await response.json();

        if (data.success && data.authenticated) {
          setStudent(data.student);
          setToken(savedToken);
          setShowLoginModal(false);
          
          // Set auto-logout timer (15 minutes)
          const logoutTimer = setTimeout(() => {
            toast.info('Your session has expired. Please log in again.');
            handleLogout();
          }, 15 * 60 * 1000); // 15 minutes

          return () => clearTimeout(logoutTimer);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      }
    };

    checkAuth();
  }, []);

  // Handle student login
  const handleStudentLogin = async (fullName, admissionNumber) => {
    setLoginLoading(true);
    setLoginError(null);
    setRequiresContact(false);

    try {
      const response = await fetch('/api/studentlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, admissionNumber })
      });

      const data = await response.json();

      if (data.success) {
        // Save token and student data
        localStorage.setItem('student_token', data.token);
        setStudent(data.student);
        setToken(data.token);
        setShowLoginModal(false);
        
        toast.success('Login successful!', {
          description: `Welcome ${data.student.fullName}`
        });

        // Load data after successful login
        fetchAllAssignments();
        fetchAllResources();
      } else {
        setLoginError(data.error);
        setRequiresContact(data.requiresContact || false);
        
        if (data.requiresContact) {
          toast.error('Student record not found', {
            description: 'Please contact your class teacher or school administrator'
          });
        } else {
          toast.error(data.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/studentlogin', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('student_token');
      setStudent(null);
      setToken(null);
      setShowLoginModal(true);
      setAllAssignments([]);
      setAllResources([]);
      
      toast.info('You have been logged out');
    }
  };

  // API Integration
  const fetchAllAssignments = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${ASSIGNMENTS_API}?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          handleLogout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.assignments)) {
        setAllAssignments(data.assignments);
      } else {
        throw new Error(data.error || 'Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAllResources = useCallback(async () => {
    if (!token) return;

    try {
      setResourcesLoading(true);
      
      const response = await fetch(`${RESOURCES_API}?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.resources)) {
        setAllResources(data.resources);
      } else {
        throw new Error('Invalid resources data format');
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  }, [token]);

  // Load data when authenticated
  useEffect(() => {
    if (student && token) {
      fetchAllAssignments();
      fetchAllResources();
    }
  }, [student, token, fetchAllAssignments, fetchAllResources]);

  // Filtering Logic
  const filteredAssignments = useMemo(() => {
    return allAssignments.filter(assignment => {
      const matchesClass = selectedClass === 'all' || assignment.className === selectedClass;
      const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
      const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        assignment.title?.toLowerCase().includes(searchLower) ||
        assignment.teacher?.toLowerCase().includes(searchLower) ||
        assignment.description?.toLowerCase().includes(searchLower) ||
        assignment.subject?.toLowerCase().includes(searchLower);

      return matchesClass && matchesSubject && matchesStatus && matchesSearch;
    });
  }, [allAssignments, selectedClass, selectedSubject, selectedStatus, searchTerm]);

  const filteredResources = useMemo(() => {
    return allResources.filter(resource => {
      const matchesType = selectedResourceType === 'all' || resource.type === selectedResourceType;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.subject?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower);

      return matchesType && matchesSearch;
    });
  }, [allResources, selectedResourceType, searchTerm]);

  // Pagination
  const totalAssignmentPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE.assignments);
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE.assignments;
    return filteredAssignments.slice(start, start + ITEMS_PER_PAGE.assignments);
  }, [filteredAssignments, currentPage]);

  const totalResourcePages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE.resources);
  const paginatedResources = useMemo(() => {
    const start = (currentResourcePage - 1) * ITEMS_PER_PAGE.resources;
    return filteredResources.slice(start, start + ITEMS_PER_PAGE.resources);
  }, [filteredResources, currentResourcePage]);

  // Download Functions
  const downloadFile = async (url, filename) => {
    const downloadId = `${url}-${Date.now()}`;
    
    try {
      if (!downloading[url]) {
        const toastId = toast.loading('Downloading file...');
        setDownloading(prev => ({ ...prev, [url]: true }));
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        setTimeout(() => {
          toast.dismiss(toastId);
          toast.success('Download started');
          setDownloading(prev => {
            const newState = { ...prev };
            delete newState[url];
            return newState;
          });
        }, 1000);
      }
    } catch (err) {
      toast.error('Download failed');
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[url];
        return newState;
      });
    }
  };

  const downloadAllAssignmentFiles = async (assignment) => {
    const files = [
      ...(assignment.assignmentFiles || []),
      ...(assignment.attachments || [])
    ].filter(Boolean);
    
    if (files.length === 0) {
      toast.info('No files available');
      return;
    }
    
    const toastId = toast.loading(`Preparing ${files.length} files for download...`);
    
    const downloadStates = {};
    files.forEach(file => {
      downloadStates[file] = true;
    });
    setDownloading(prev => ({ ...prev, ...downloadStates }));
    
    setTimeout(async () => {
      let successCount = 0;
      
      for (const file of files) {
        try {
          await downloadFile(file, file.split('/').pop());
          successCount++;
        } catch (err) {
          console.error('Error downloading file:', file, err);
        }
      }
      
      files.forEach(file => {
        setDownloading(prev => {
          const newState = { ...prev };
          delete newState[file];
          return newState;
        });
      });
      
      toast.dismiss(toastId);
      
      if (successCount > 0) {
        toast.success(`Successfully downloaded ${successCount} files`);
      }
    }, 500);
  };

  const downloadResource = (resource) => {
    if (downloading[resource.fileUrl]) {
      toast.info('Download already in progress');
      return;
    }
    
    downloadFile(resource.fileUrl, resource.title);
  };

  // Handlers
  const clearFilters = () => {
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedStatus('all');
    setSelectedResourceType('all');
    setSearchTerm('');
    setCurrentPage(1);
    setCurrentResourcePage(1);
  };

  const handleRefresh = () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    if (viewMode === 'assignments') {
      fetchAllAssignments();
    } else {
      fetchAllResources();
    }
  };

  // Show login modal if not authenticated
  if (!student || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
        <Toaster position="top-right" expand={true} richColors theme="light" />
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Nyaribu Secondary School</h1>
                <p className="text-blue-200 mt-2">Student Portal - Learning Resources & Assignments</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <FiLock className="text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-200">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLock className="text-white text-4xl" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Portal Login Required</h2>
              <p className="text-gray-600 text-lg mb-8">
                Please log in with your full name and admission number to access learning resources and assignments.
              </p>
              
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300"
              >
                <FiLogIn className="text-xl" />
                Click to Login
              </button>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">How to Login:</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                    <p className="font-medium text-gray-700">Enter your full name exactly as in school records</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">2</div>
                    <p className="font-medium text-gray-700">Enter your admission number</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                    <p className="font-medium text-gray-700">Click Login to access resources</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <StudentLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleStudentLogin}
          isLoading={loginLoading}
          error={loginError}
          requiresContact={requiresContact}
        />
      </div>
    );
  }

  // Extract unique values for filters
  const classes = ['all', ...new Set(allAssignments.map(a => a.className).filter(Boolean))];
  const subjects = ['all', ...new Set(allAssignments.map(a => a.subject).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      <Toaster position="top-right" expand={true} richColors theme="light" />
      
      {/* Login Modal */}
      <StudentLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleStudentLogin}
        isLoading={loginLoading}
        error={loginError}
        requiresContact={requiresContact}
      />

      {/* Mobile Filter Overlay */}
      {isFilterSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsFilterSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsFilterSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <FiFilter size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{student.fullName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Form {student.form}</span>
                  {student.stream && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{student.stream}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 sm:mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-base sm:text-lg" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${viewMode}...`}
                className="block w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 
                         bg-transparent hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1"
              title="Refresh"
            >
              <FiRefreshCw className={`${(loading || resourcesLoading) ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs sm:text-sm text-red-600 
                         bg-red-50 hover:bg-red-100 rounded-lg transition-all flex items-center gap-1"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>

            {/* View Toggle */}
            <div className="flex bg-transparent p-1 rounded-xl border border-gray-300/40 gap-1">
              <button
                onClick={() => setViewMode("assignments")}
                className={`px-2 py-1 sm:px-3 sm:py-2 text-xs rounded-lg transition-all flex items-center gap-1
                  ${
                    viewMode === "assignments"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <FiClipboard size={14} />
                <span>Assignments</span>
              </button>
              <button
                onClick={() => setViewMode("resources")}
                className={`px-2 py-1 sm:px-3 sm:py-2 text-xs rounded-lg transition-all flex items-center gap-1
                  ${
                    viewMode === "resources"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <FiFilePlus size={14} />
                <span>Resources</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          
          {/* Filter Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 w-80 bg-white lg:bg-transparent z-50 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto lg:overflow-visible border-r lg:border-r-0 border-gray-200/50
            ${isFilterSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 sm:p-6 lg:p-0 lg:sticky lg:top-6 space-y-4 sm:space-y-6">
              
              <div className="flex items-center justify-between lg:hidden mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filters</h2>
                <button onClick={() => setIsFilterSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <FiX size={20} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="lg:hidden mb-4 sm:mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Clear Filters Button */}
              {(selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedResourceType !== 'all' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-dashed border-red-200 text-red-600 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 sm:gap-3 shadow-sm hover:bg-red-50 transition-colors"
                >
                  <FiX size={16} /> Clear All Filters
                </button>
              )}

              {viewMode === 'assignments' ? (
                <>
                  {/* Class Filter */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                        <FiUser className="text-blue-600" /> Class
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-2">
                      {classes.map(cls => (
                        <label key={cls} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="class"
                            checked={selectedClass === cls}
                            onChange={() => setSelectedClass(cls)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {cls === 'all' ? 'All Classes' : cls}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subject Filter */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                        <FiBook className="text-blue-600" /> Subject
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-2">
                      {subjects.map(subject => (
                        <label key={subject} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="subject"
                            checked={selectedSubject === subject}
                            onChange={() => setSelectedSubject(subject)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {subject === 'all' ? 'All Subjects' : subject}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                        <FiCheckCircle className="text-blue-600" /> Status
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-2">
                      {ASSIGNMENT_STATUS.map(status => (
                        <label key={status.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            checked={selectedStatus === status.id}
                            onChange={() => setSelectedStatus(status.id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2 text-gray-700">
                            {status.icon}
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Resource Type Filter */
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                      <FiFilePlus className="text-blue-600" /> Resource Type
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    {RESOURCE_TYPES.map(type => (
                      <label key={type.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="resourceType"
                          checked={selectedResourceType === type.id}
                          onChange={() => setSelectedResourceType(type.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2 text-gray-700">
                          {type.icon}
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                  {viewMode === 'assignments' ? 'Your Assignments' : 'Learning Resources'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-lg">
                  {viewMode === 'assignments' 
                    ? `Showing ${filteredAssignments.length} assignments`
                    : `Showing ${filteredResources.length} resources`}
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex bg-white p-1 rounded-xl border border-gray-300">
                  <button
                    onClick={() => viewMode === 'assignments' ? setAssignmentsView('grid') : setResourcesView('grid')}
                    className={`p-2 rounded-lg ${(viewMode === 'assignments' ? assignmentsView : resourcesView) === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    onClick={() => viewMode === 'assignments' ? setAssignmentsView('list') : setResourcesView('list')}
                    className={`p-2 rounded-lg ${(viewMode === 'assignments' ? assignmentsView : resourcesView) === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700">
                    <FiClipboard className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">{allAssignments.length}</h4>
                <p className="text-gray-600 text-sm font-semibold">Total Assignments</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700">
                    <FiFlag className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">{allAssignments.filter(a => a.status === 'assigned').length}</h4>
                <p className="text-gray-600 text-sm font-semibold">Active</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700">
                    <FiCheckCircle className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">{allAssignments.filter(a => a.status === 'reviewed').length}</h4>
                <p className="text-gray-600 text-sm font-semibold">Reviewed</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-700">
                    <FiFilePlus className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">{allResources.length}</h4>
                <p className="text-gray-600 text-sm font-semibold">Resources</p>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 text-red-700">
                  <FiAlertCircle className="text-xl" />
                  <div>
                    <h3 className="font-bold">Error Loading Data</h3>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {viewMode === 'assignments' ? (
              <>
                {/* Assignments View */}
                {loading ? (
                  <div className={assignmentsView === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-200/50 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200/50 p-8 sm:p-12 text-center">
                    <FiClipboard className="text-4xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : assignmentsView === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedAssignments.map((assignment) => (
                      <div key={assignment.id} className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl ring-4 ring-blue-100">
                              <FiUser className="text-white text-2xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">
                                {assignment.title}
                              </h4>
                              <p className="text-gray-600 font-semibold text-base mt-1">Subject: {assignment.subject}</p>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                            assignment.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            assignment.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-semibold text-base">Teacher</span>
                            <span className="font-bold text-gray-900 text-base">{assignment.teacher}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-semibold text-base">Due Date</span>
                            <span className="font-bold text-gray-900 text-base">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                            {assignment.description || 'No description provided'}
                          </p>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedAssignment(assignment)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <FiEye className="text-sm" /> View
                          </button>
                          <button
                            onClick={() => downloadAllAssignmentFiles(assignment)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-xl text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <FiDownload className="text-sm" /> Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white ${getStatusColor(assignment.status)}`}>
                                {getStatusIcon(assignment.status)}
                                <span className="capitalize">{assignment.status}</span>
                              </div>
                              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                {assignment.className}
                              </span>
                              <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">
                                {assignment.subject}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{assignment.description || 'No description provided'}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <FiUser className="text-gray-400" />
                                <span>{assignment.teacher}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiCalendar className="text-gray-400" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => setSelectedAssignment(assignment)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                              <FiEye /> View Details
                            </button>
                            <button
                              onClick={() => downloadAllAssignmentFiles(assignment)}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                              <FiDownload /> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assignment Pagination */}
                {totalAssignmentPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalAssignmentPages} • {filteredAssignments.length} assignments
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <FiChevronLeft /> Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalAssignmentPages) }, (_, i) => {
                          const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                          if (pageNum > totalAssignmentPages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl font-medium ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalAssignmentPages, p + 1))}
                        disabled={currentPage === totalAssignmentPages}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        Next <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Resources View */}
                {resourcesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-200/50 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200/50 p-8 sm:p-12 text-center">
                    <FiFilePlus className="text-4xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No resources found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : resourcesView === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {paginatedResources.map((resource) => (
                      <div key={resource.id} className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl ring-4 ring-blue-100">
                              {getResourceTypeIcon(resource.type)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">
                                {resource.title}
                              </h4>
                              <p className="text-gray-600 font-semibold text-base mt-1">{resource.type}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {resource.description || 'No description available'}
                          </p>

                          {resource.subject && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-semibold text-base">Subject</span>
                              <span className="font-bold text-gray-900 text-base">{resource.subject}</span>
                            </div>
                          )}

                          {resource.fileSize && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-semibold text-base">Size</span>
                              <span className="font-bold text-gray-900 text-base">{resource.fileSize}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedResource(resource)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <FiEye className="text-sm" /> View
                          </button>
                          <button
                            onClick={() => downloadResource(resource)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-xl text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <FiDownload className="text-sm" /> Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                              {getResourceTypeIcon(resource.type)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">{resource.title}</h3>
                              <p className="text-gray-600 text-sm">{resource.description}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                {resource.subject && (
                                  <span className="flex items-center gap-2">
                                    <FiBook className="text-gray-400" /> {resource.subject}
                                  </span>
                                )}
                                {resource.type && (
                                  <span className="flex items-center gap-2">
                                    <FiFilePlus className="text-gray-400" /> {resource.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => setSelectedResource(resource)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                              <FiEye /> View Details
                            </button>
                            <button
                              onClick={() => downloadResource(resource)}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                              <FiDownload /> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resource Pagination */}
                {totalResourcePages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentResourcePage} of {totalResourcePages} • {filteredResources.length} resources
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentResourcePage(p => Math.max(1, p - 1))}
                        disabled={currentResourcePage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <FiChevronLeft /> Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalResourcePages) }, (_, i) => {
                          const pageNum = currentResourcePage <= 3 ? i + 1 : currentResourcePage - 2 + i;
                          if (pageNum > totalResourcePages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentResourcePage(pageNum)}
                              className={`w-10 h-10 rounded-xl font-medium ${
                                currentResourcePage === pageNum
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentResourcePage(p => Math.min(totalResourcePages, p + 1))}
                        disabled={currentResourcePage === totalResourcePages}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        Next <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200/50 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-3 rounded-full border border-blue-200 mb-4">
                <FiStar className="text-blue-600" />
                <span className="font-semibold text-blue-700">Soaring for Excellence in Education</span>
              </div>
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Nyaribu Secondary School • Student Portal v2.0
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 lg:my-12">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 line-clamp-2">{selectedAssignment.title}</h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="text-xl sm:text-2xl text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Subject</div>
                  <div className="font-semibold text-gray-900">{selectedAssignment.subject}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Class</div>
                  <div className="font-semibold text-gray-900">{selectedAssignment.className}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Teacher</div>
                  <div className="font-semibold text-gray-900">{selectedAssignment.teacher}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className={`font-semibold ${selectedAssignment.status === 'assigned' ? 'text-blue-600' : 'text-gray-900'}`}>
                    {selectedAssignment.status}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-blue-600 mb-1">Date Assigned</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(selectedAssignment.dateAssigned).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-sm text-red-600 mb-1">Due Date</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiFileText className="text-blue-600" /> Description
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedAssignment.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    downloadAllAssignmentFiles(selectedAssignment);
                    setSelectedAssignment(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 min-h-[44px]"
                >
                  <FiDownload className="text-lg sm:text-xl" /> 
                  <span>Download All Files</span>
                </button>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-colors min-h-[44px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 lg:my-12">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 line-clamp-2">{selectedResource.title}</h3>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="text-xl sm:text-2xl text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              {/* Resource Info */}
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                  {getResourceTypeIcon(selectedResource.type)}
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-semibold mb-1">LEARNING RESOURCE</div>
                  <div className="text-lg font-bold text-gray-900">{selectedResource.title}</div>
                  {selectedResource.subject && (
                    <div className="text-gray-600">{selectedResource.subject}</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Description</h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedResource.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedResource.type && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Type</div>
                    <div className="font-semibold text-gray-900">{selectedResource.type}</div>
                  </div>
                )}
                {selectedResource.fileSize && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Size</div>
                    <div className="font-semibold text-gray-900">{selectedResource.fileSize}</div>
                  </div>
                )}
                {selectedResource.downloads !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Downloads</div>
                    <div className="font-semibold text-gray-900">{selectedResource.downloads}</div>
                  </div>
                )}
                {selectedResource.uploadedBy && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Uploaded By</div>
                    <div className="font-semibold text-gray-900">{selectedResource.uploadedBy}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    downloadResource(selectedResource);
                    setSelectedResource(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 min-h-[44px]"
                >
                  <FiDownload className="text-lg sm:text-xl" /> 
                  <span>Download Resource</span>
                </button>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-colors min-h-[44px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}