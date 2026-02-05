'use client';
import { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiMail, 
  FiTrash2, 
  FiDownload,
  FiTrendingUp,
  FiUsers,
  FiBarChart2,
  FiX,
  FiSend,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiEye,
  FiFilter,
  FiChevronDown,
  FiBell,
  FiShare2,
  FiEdit3,
  FiUser,
  FiGlobe,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiMoreVertical
} from 'react-icons/fi';
import { toast } from 'sonner';
import CircularProgress from '@mui/material/CircularProgress';
import { 
  IoMailOutline, 
  IoCalendarOutline, 
  IoStatsChartOutline,
  IoPeopleOutline,
  IoSendOutline 
} from 'react-icons/io5';

// Modern Loading Spinner
const Spinner = ({ size = 40, color = '#3b82f6', thickness = 3.6 }) => (
  <div className="inline-flex items-center justify-center">
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 44 44">
      <circle 
        className="text-gray-200" 
        stroke="currentColor" 
        strokeWidth={thickness} 
        fill="none" 
        cx="22" cy="22" r="20"
      />
      <circle 
        className="text-blue-600" 
        stroke="currentColor" 
        strokeWidth={thickness} 
        strokeLinecap="round" 
        fill="none" 
        cx="22" cy="22" r="20" 
        strokeDasharray="30 100"
      />
    </svg>
  </div>
);

// Modern Notification Component
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
          bg: 'from-emerald-50 to-green-50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          iconBg: 'bg-emerald-100',
          progress: 'bg-emerald-500'
        };
      case 'error':
        return {
          bg: 'from-rose-50 to-red-50',
          border: 'border-rose-200',
          icon: 'text-rose-600',
          iconBg: 'bg-rose-100',
          progress: 'bg-rose-500'
        };
      case 'warning':
        return {
          bg: 'from-amber-50 to-orange-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          progress: 'bg-amber-500'
        };
      case 'info':
        return {
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          progress: 'bg-blue-500'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle className="text-xl" />;
      case 'error': return <FiAlertCircle className="text-xl" />;
      case 'warning': return <FiAlertTriangle className="text-xl" />;
      case 'info': return <FiInfo className="text-xl" />;
    }
  };

  if (!open) return null;

  const styles = getTypeStyles();

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-slide-in">
      <div className={`bg-gradient-to-r ${styles.bg} border-2 ${styles.border} rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 ${styles.iconBg} rounded-xl ${styles.icon}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
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
  );
}

// Modern Action Menu Component
function ActionMenu({ item, onView, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
      >
        <FiMoreVertical className="text-lg" />
      </button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <button
              onClick={() => {
                setIsOpen(false);
                onView(item);
              }}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiEye className="text-base" />
              View Details
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete(item);
              }}
              className="w-full text-left px-4 py-3 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <FiTrash2 className="text-base" />
              Delete Subscriber
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const itemsPerPage = 8;

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  });

  const [emailData, setEmailData] = useState({
    subject: '',
    template: 'admission',
    audience: 'all',
    customMessage: '',
    templateData: {
      schoolYear: '2025',
      deadline: 'January 31, 2025',
      month: new Date().toLocaleString('default', { month: 'long' }),
      eventName: 'Annual Science Fair',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: '9:00 AM - 3:00 PM'
    }
  });

  // Enhanced Email Templates
  const emailTemplates = {
    admission: {
      name: 'Admission Updates',
      subject: '🎓 Important Admission Updates & Tips for {schoolYear} - Katwanyaa High School',
      description: 'Send admission tips and deadlines',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      icon: '🎯'
    },
    newsletter: {
      name: 'Monthly Newsletter',
      subject: '📰 {month} Newsletter - Katwanyaa High School Updates',
      description: 'Share monthly news and announcements',
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      icon: '📬'
    },
    event: {
      name: 'Event Announcement',
      subject: '🎉 Event Invitation: {eventName} - Katwanyaa High School',
      description: 'Announce school events and activities',
      color: 'from-emerald-500 to-green-500',
      iconBg: 'bg-emerald-100',
      icon: '📅'
    },
    reminder: {
      name: 'Important Reminder',
      subject: '⏰ Important Reminder - Katwanyaa High School',
      description: 'Send important reminders',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      icon: '🔔'
    }
  };

  const showToast = (type, title, message) => {
    setNotification({
      open: true,
      type,
      title,
      message
    });
  };

const fetchSubscribers = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/subscriber');
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle 401 Unauthorized (for protected routes)
      if (response.status === 401) {
        // Only redirect if this was a protected request
        if (errorData.message?.includes('Authentication')) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          throw new Error('Session expired. Please login again.');
        }
      }
      
      throw new Error(errorData.error || 'Failed to fetch subscribers');
    }

    const data = await response.json();
    
    if (data.success) {
      setSubscribers(data.subscribers);
      setFilteredSubscribers(data.subscribers);
    } else {
      throw new Error(data.error || 'Failed to fetch subscribers');
    }
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    
    // Handle authentication errors
    if (error.message.includes('Session expired') || 
        error.message.includes('Authentication')) {
      
      showToast('error', 'Authentication Required', 'Please login to continue');
      setTimeout(() => {
        window.location.href = '/pages/adminLogin';
      }, 1500);
      
    } else {
      showToast('error', 'Fetch Error', error.message || 'Failed to fetch subscribers');
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Calculate enhanced statistics
  const calculateStats = () => {
    const totalSubscribers = subscribers.length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthSubscribers = subscribers.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthSubscribers = subscribers.filter(sub => {
      const subDate = new Date(sub.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return subDate.getMonth() === lastMonth && subDate.getFullYear() === year;
    }).length;
    
    const todaySubscribers = subscribers.filter(sub => {
      const subDate = new Date(sub.createdAt);
      const today = new Date();
      return subDate.toDateString() === today.toDateString();
    }).length;

    const growthRate = lastMonthSubscribers > 0 
      ? ((thisMonthSubscribers - lastMonthSubscribers) / lastMonthSubscribers * 100).toFixed(1)
      : thisMonthSubscribers > 0 ? 100 : 0;

    return {
      totalSubscribers,
      thisMonthSubscribers,
      todaySubscribers,
      growthRate: parseFloat(growthRate),
      growthCount: thisMonthSubscribers - lastMonthSubscribers
    };
  };

  const stats = calculateStats();

  // Enhanced filter with date range
  useEffect(() => {
    let filtered = subscribers;

    if (searchTerm) {
      filtered = filtered.filter(subscriber =>
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(subscriber => {
        const subDate = new Date(subscriber.createdAt);
        switch (selectedDateRange) {
          case 'today':
            return subDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return subDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return subDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredSubscribers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDateRange, subscribers]);

  // Responsive pagination logic
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSubscribers = filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);

  // Handle subscriber selection
  const toggleSubscriberSelection = (subscriberId) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(subscriberId)) {
      newSelected.delete(subscriberId);
    } else {
      newSelected.add(subscriberId);
    }
    setSelectedSubscribers(newSelected);
  };

  const selectAllSubscribers = () => {
    if (selectedSubscribers.size === currentSubscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(currentSubscribers.map(sub => sub.id)));
    }
  };

  // Handle subscriber deletion
  const handleDelete = (subscriber) => {
    setSubscriberToDelete(subscriber);
    setShowDeleteConfirm(true);
  };

const confirmDelete = async () => {
  if (!subscriberToDelete) return;
  
  try {
    // Get authentication tokens
    const adminToken = localStorage.getItem('admin_token');
    const deviceToken = localStorage.getItem('device_token');
    
    // Check if tokens exist
    if (!adminToken) {
      throw new Error('Authentication required. Please login again.');
    }
    
    if (!deviceToken) {
      throw new Error('Device verification required. Please login with verification.');
    }
    
    const response = await fetch(`/api/subscriber/${subscriberToDelete.id}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'x-device-token': deviceToken
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        throw new Error('Session expired. Please login again.');
      }
      
      // Handle 403 Forbidden (no permission)
      if (response.status === 403) {
        throw new Error('You do not have permission to delete subscribers.');
      }
      
      throw new Error(errorData.error || errorData.message || 'Failed to delete subscriber');
    }

    const data = await response.json();
    
    if (data.success) {
      await fetchSubscribers();
      showToast('success', 'Deleted', 'Subscriber deleted successfully');
    } else {
      throw new Error(data.error || 'Failed to delete subscriber');
    }
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    
    // Handle specific error cases
    if (error.message.includes('Session expired') || 
        error.message.includes('Authentication required') ||
        error.message.includes('Device verification')) {
      
      showToast('error', 'Authentication Required', 'Please login to continue');
      setTimeout(() => {
        window.location.href = '/pages/adminLogin';
      }, 1500);
      
    } else if (error.message.includes('permission')) {
      showToast('error', 'Access Denied', error.message);
    } else {
      showToast('error', 'Delete Failed', error.message || 'Failed to delete subscriber');
    }
  } finally {
    setShowDeleteConfirm(false);
    setSubscriberToDelete(null);
  }
};

  // Export to CSV with enhanced data
  const exportToCSV = () => {
    try {
      const headers = ['Email', 'Subscription Date', 'Last Active', 'Status'];
      const csvData = filteredSubscribers.map(sub => [
        sub.email,
        new Date(sub.createdAt).toLocaleDateString(),
        sub.lastActive ? new Date(sub.lastActive).toLocaleDateString() : 'Never',
        sub.status || 'Active'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('success', 'Exported', 'CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('error', 'Export Failed', 'Failed to export CSV');
    }
  };

  // Handle email sending
const handleSendEmail = async (e) => {
  e.preventDefault();
  setSendingEmail(true);

  try {
    // Get authentication tokens
    const adminToken = localStorage.getItem('admin_token');
    const deviceToken = localStorage.getItem('device_token');
    
    // Check if tokens exist
    if (!adminToken) {
      throw new Error('Authentication required. Please login again.');
    }
    
    if (!deviceToken) {
      throw new Error('Device verification required. Please login with verification.');
    }
    
    const targetSubscribers = selectedSubscribers.size > 0 
      ? subscribers.filter(sub => selectedSubscribers.has(sub.id))
      : subscribers;

    if (targetSubscribers.length === 0) {
      throw new Error('No subscribers selected');
    }

    const campaignPayload = {
      subscribers: targetSubscribers,
      template: emailData.template,
      subject: emailData.subject,
      customMessage: emailData.customMessage,
      templateData: emailData.templateData
    };

    const response = await fetch('/api/campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'x-device-token': deviceToken
      },
      body: JSON.stringify(campaignPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        throw new Error('Session expired. Please login again.');
      }
      
      // Handle 403 Forbidden (no permission)
      if (response.status === 403) {
        throw new Error('You do not have permission to send campaigns.');
      }
      
      throw new Error(errorData.error || errorData.message || 'Failed to send campaign');
    }

    const data = await response.json();

    if (data.success) {
      showToast('success', 'Sent', 'Campaign sent successfully');
      setShowEmailModal(false);
      setEmailData({
        subject: '',
        template: 'admission',
        audience: 'all',
        customMessage: '',
        templateData: {
          schoolYear: '2025',
          deadline: 'January 31, 2025',
          month: new Date().toLocaleString('default', { month: 'long' }),
          eventName: 'Annual Science Fair',
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: '9:00 AM - 3:00 PM'
        }
      });
      setSelectedSubscribers(new Set());
    } else {
      throw new Error(data.error || 'Failed to send campaign');
    }
  } catch (error) {
    console.error('Error sending campaign:', error);
    
    // Handle specific error cases
    if (error.message.includes('Session expired') || 
        error.message.includes('Authentication required') ||
        error.message.includes('Device verification')) {
      
      showToast('error', 'Authentication Required', 'Please login to continue');
      setTimeout(() => {
        window.location.href = '/pages/adminLogin';
      }, 1500);
      
    } else if (error.message.includes('permission')) {
      showToast('error', 'Access Denied', error.message);
    } else {
      showToast('error', 'Send Failed', error.message);
    }
  } finally {
    setSendingEmail(false);
  }
};

  // Update template and auto-fill subject
  const updateCampaignTemplate = (template) => {
    const templateConfig = emailTemplates[template];
    setEmailData({
      ...emailData,
      template,
      subject: templateConfig.subject
        .replace('{schoolYear}', emailData.templateData.schoolYear)
        .replace('{month}', emailData.templateData.month)
        .replace('{eventName}', emailData.templateData.eventName)
    });
  };

  const viewSubscriberDetails = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowDetailModal(true);
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <Spinner size={48} />
          <p className="text-gray-800 text-lg mt-4 font-bold">Loading Subscribers</p>
          <p className="text-gray-600 text-sm mt-1">Fetching your audience data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 p-4 lg:p-6 space-y-6">
      {/* Notification */}
      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl">
                <IoMailOutline className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Subscriber Manager
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  Manage and communicate with your audience
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToCSV}
              className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm lg:text-base hover:bg-gray-50 transition-all hover:shadow-lg"
            >
              <FiDownload className="text-base" />
              Export CSV
            </button>
            
            <button
              onClick={() => setShowEmailModal(true)}
              disabled={subscribers.length === 0}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              <IoSendOutline className="text-base" />
              Send Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <IoPeopleOutline className="text-blue-600 text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalSubscribers}</div>
              <div className="text-blue-600 text-sm font-bold">Total Subscribers</div>
            </div>
          </div>
          <div className="text-gray-600 text-sm mt-3">All active subscribers</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
              <IoStatsChartOutline className="text-emerald-600 text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.thisMonthSubscribers}</div>
              <div className="text-emerald-600 text-sm font-bold">This Month</div>
            </div>
          </div>
          <div className="text-gray-600 text-sm mt-3">New subscriptions</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
              <FiTrendingUp className="text-amber-600 text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.growthRate}%</div>
              <div className={`text-sm font-bold ${stats.growthCount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats.growthCount >= 0 ? '+' : ''}{stats.growthCount}
              </div>
            </div>
          </div>
          <div className="text-gray-600 text-sm mt-3">Growth rate</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <FiClock className="text-purple-600 text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.todaySubscribers}</div>
              <div className="text-purple-600 text-sm font-bold">Today</div>
            </div>
          </div>
          <div className="text-gray-600 text-sm mt-3">New today</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-200">
        {/* Enhanced Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search subscribers by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm lg:text-base"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3.5 bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-100"
            >
              <FiFilter className="text-base" />
              Filters
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="text-gray-700 text-sm font-bold">
              {selectedSubscribers.size > 0 
                ? `${selectedSubscribers.size} selected` 
                : `${filteredSubscribers.length} total`
              }
            </div>
          </div>
        </div>

        {/* Enhanced Filters Dropdown */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-bold text-sm">Date Range:</span>
              <div className="flex gap-2">
                {['all', 'today', 'week', 'month'].map(range => (
                  <button
                    key={range}
                    onClick={() => setSelectedDateRange(range)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      selectedDateRange === range
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Subscribers Table */}
        <div className="overflow-x-auto rounded-2xl border-2 border-gray-200">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.size === currentSubscribers.length && currentSubscribers.length > 0}
                      onChange={selectAllSubscribers}
                      className="w-5 h-5 rounded border-2 border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm font-bold uppercase tracking-wider">Email</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">
                  Subscription Date
                </th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.has(subscriber.id)}
                        onChange={() => toggleSubscriberSelection(subscriber.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                            <FiUser className="text-blue-600 text-base" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base truncate">
                              {subscriber.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                        <FiCalendar className="text-gray-600" />
                      </div>
                      <div>
                        <span className="font-bold text-sm">
                          {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <p className="text-gray-500 text-xs">
                          {new Date(subscriber.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewSubscriberDetails(subscriber)}
                        className="p-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-xl border-2 border-blue-200 hover:border-blue-500 transition-colors"
                        aria-label="View details"
                      >
                        <FiEye className="text-base" />
                      </button>
                      <ActionMenu 
                        item={subscriber} 
                        onView={viewSubscriberDetails}
                        onDelete={handleDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiMail className="text-4xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'Start building your audience'}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t-2 border-gray-200">
            <div className="text-gray-600 text-sm font-bold">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 disabled:opacity-30 transition-all hover:border-blue-500"
                aria-label="Previous page"
              >
                <FiChevronLeft className="text-lg" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-all text-sm ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 disabled:opacity-30 transition-all hover:border-blue-500"
                aria-label="Next page"
              >
                <FiChevronRight className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-gray-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <IoSendOutline className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold">Create Email Campaign</h2>
                    <p className="text-blue-100 opacity-90 mt-1 text-sm">
                      Send communications to your subscribers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSendEmail} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Template Selection */}
              <div>
                <label className="block text-gray-900 font-bold mb-3">Email Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(emailTemplates).map(([key, template]) => (
                    <div
                      key={key}
                      onClick={() => updateCampaignTemplate(key)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        emailData.template === key
                          ? 'ring-4 ring-blue-500/30 border-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`p-2 ${template.iconBg} rounded-lg text-xl`}>
                          {template.icon}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-900">{template.name}</h3>
                          <p className="text-gray-600 text-sm">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template-specific fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailData.template === 'admission' && (
                  <>
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">School Year</label>
                      <input
                        type="text"
                        value={emailData.templateData.schoolYear}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, schoolYear: e.target.value }
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="2025"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Application Deadline</label>
                      <input
                        type="text"
                        value={emailData.templateData.deadline}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, deadline: e.target.value }
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="January 31, 2025"
                      />
                    </div>
                  </>
                )}

                {emailData.template === 'event' && (
                  <>
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Event Name</label>
                      <input
                        type="text"
                        value={emailData.templateData.eventName}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, eventName: e.target.value }
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Annual Science Fair"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-900 font-bold mb-2">Date</label>
                        <input
                          type="text"
                          value={emailData.templateData.date}
                          onChange={(e) => setEmailData({
                            ...emailData,
                            templateData: { ...emailData.templateData, date: e.target.value }
                          })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="November 30, 2024"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-bold mb-2">Time</label>
                        <input
                          type="text"
                          value={emailData.templateData.time}
                          onChange={(e) => setEmailData({
                            ...emailData,
                            templateData: { ...emailData.templateData, time: e.target.value }
                          })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="9:00 AM - 3:00 PM"
                        />
                      </div>
                    </div>
                  </>
                )}

                {emailData.template === 'newsletter' && (
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Month</label>
                    <input
                      type="text"
                      value={emailData.templateData.month}
                      onChange={(e) => setEmailData({
                        ...emailData,
                        templateData: { ...emailData.templateData, month: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                      placeholder="December"
                    />
                  </div>
                )}
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">Email Subject *</label>
                  <input
                    type="text"
                    required
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Enter email subject line"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">Target Audience</label>
                  <select
                    value={emailData.audience}
                    onChange={(e) => setEmailData({ ...emailData, audience: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="all">All Subscribers ({subscribers.length})</option>
                    <option value="selected">Selected Subscribers ({selectedSubscribers.size})</option>
                  </select>
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  {emailData.template === 'custom' ? 'Email Content *' : 'Additional Message'}
                </label>
                <textarea
                  value={emailData.customMessage}
                  onChange={(e) => setEmailData({ ...emailData, customMessage: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm lg:text-base"
                  placeholder={
                    emailData.template === 'custom' 
                      ? 'Write your email content here...' 
                      : 'Add any additional message here...'
                  }
                  required={emailData.template === 'custom'}
                />
              </div>

              {/* Recipient Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-gray-900 font-bold mb-1">Ready to Send</h3>
                    <p className="text-gray-600 text-sm">
                      {emailData.audience === 'selected' && selectedSubscribers.size > 0
                        ? `${selectedSubscribers.size} selected subscribers`
                        : `All ${subscribers.length} subscribers`
                      }
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {emailData.audience === 'selected' && selectedSubscribers.size > 0 
                        ? selectedSubscribers.size 
                        : subscribers.length
                      }
                    </div>
                    <div className="text-gray-600 text-sm">subscribers</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-gray-700 px-6 py-3.5 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <IoSendOutline className="text-base" />
                      Send Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-md border-2 border-gray-300 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <FiAlertTriangle className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Confirm Deletion</h2>
                    <p className="text-rose-100 opacity-90 mt-1 text-sm">This action cannot be undone</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <FiAlertTriangle className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Delete "{subscriberToDelete?.email}"?
                  </h3>
                  <p className="text-gray-600">
                    This subscriber will be permanently deleted from your list.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 mb-6 border-2 border-rose-200">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-rose-600 mt-0.5 flex-shrink-0" />
                  <p className="text-rose-700 text-sm">
                    <span className="font-bold">Warning:</span> This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <FiTrash2 />
                  Delete Subscriber
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriber Detail Modal */}
      {showDetailModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md border-2 border-gray-300 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <FiUser className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Subscriber Details</h2>
                    <p className="text-blue-100 opacity-90 mt-1 text-sm">View subscriber information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <FiMail className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Email</p>
                  <p className="text-gray-900 font-bold">{selectedSubscriber.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-bold mb-2">Subscription Date</p>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-500" />
                    <p className="text-gray-900 font-bold">
                      {new Date(selectedSubscriber.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-bold mb-2">Status</p>
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full text-xs font-bold">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-600 font-bold mb-2">Subscription Info</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subscriber ID:</span>
                    <span className="font-bold text-gray-900">{selectedSubscriber.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Joined:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(selectedSubscriber.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}