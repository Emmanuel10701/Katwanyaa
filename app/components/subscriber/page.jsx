'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  FiPlus,
  FiEdit3,
  FiEye,
  FiCalendar
} from 'react-icons/fi';

// Material-UI Components
import CircularProgress from '@mui/material/CircularProgress';

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
  const itemsPerPage = 8;

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

  // Email templates matching your API
  const emailTemplates = {
    admission: {
      name: 'Admission Announcement',
      subject: '🎓 Admissions Now Open for {schoolYear} - Tokatwanyaa Highschool',
      description: 'Announce new admission opportunities'
    },
    newsletter: {
      name: 'Monthly Newsletter',
      subject: '📰 {month} Newsletter - Tokatwanyaa Highschool',
      description: 'Share monthly updates and achievements'
    },
    event: {
      name: 'Event Invitation',
      subject: '🎉 You\'re Invited: {eventName} - Tokatwanyaa Highschool',
      description: 'Invite to school events and functions'
    },
    custom: {
      name: 'Custom Campaign',
      subject: '',
      description: 'Create your own email campaign'
    }
  };

  // Fetch subscribers from API
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriber');
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.subscribers);
        setFilteredSubscribers(data.subscribers);
      } else {
        throw new Error(data.error || 'Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Calculate statistics with growth comparison
  const calculateStats = () => {
    const totalSubscribers = subscribers.length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // This month's subscribers
    const thisMonthSubscribers = subscribers.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
    }).length;
    
    // Last month's subscribers
    const lastMonthSubscribers = subscribers.filter(sub => {
      const subDate = new Date(sub.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return subDate.getMonth() === lastMonth && subDate.getFullYear() === year;
    }).length;
    
    // Calculate growth rate
    const growthRate = lastMonthSubscribers > 0 
      ? ((thisMonthSubscribers - lastMonthSubscribers) / lastMonthSubscribers * 100).toFixed(1)
      : thisMonthSubscribers > 0 ? 100 : 0;

    return {
      totalSubscribers,
      thisMonthSubscribers,
      lastMonthSubscribers,
      growthRate: parseFloat(growthRate),
      growthCount: thisMonthSubscribers - lastMonthSubscribers
    };
  };

  const stats = calculateStats();

  // Filter subscribers by email search
  useEffect(() => {
    let filtered = subscribers;

    if (searchTerm) {
      filtered = subscribers.filter(subscriber =>
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubscribers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, subscribers]);

  // Pagination logic
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
      const response = await fetch(`/api/subscriber/${subscriberToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchSubscribers();
        toast.success('🗑️ Subscriber deleted successfully!');
      } else {
        throw new Error(data.error || 'Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setShowDeleteConfirm(false);
      setSubscriberToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSubscriberToDelete(null);
  };

  // Export to CSV logic
  const exportToCSV = () => {
    try {
      const headers = ['Email', 'Subscription Date'];
      const csvData = filteredSubscribers.map(sub => [
        sub.email,
        new Date(sub.createdAt).toLocaleDateString()
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

      toast.success('📊 CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('❌ Failed to export CSV');
    }
  };

  // Handle email sending to /api/campaign
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      // Determine target subscribers
      const targetSubscribers = selectedSubscribers.size > 0 
        ? subscribers.filter(sub => selectedSubscribers.has(sub.id))
        : subscribers;

      if (targetSubscribers.length === 0) {
        throw new Error('No subscribers selected');
      }

      // Prepare campaign data for API - matching your API structure
      const campaignPayload = {
        subscribers: targetSubscribers,
        template: emailData.template,
        subject: emailData.subject,
        customMessage: emailData.customMessage,
        templateData: emailData.templateData
      };

      console.log('Sending campaign:', campaignPayload);

      // Send to /api/campaign endpoint
      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send campaign');
      }

      if (data.success) {
        toast.success(`✅ ${data.message}`);
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
      toast.error(`❌ ${error.message}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
          <p className="text-gray-600 text-lg mt-4 font-medium">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-4 lg:p-8 space-y-8">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <FiMail className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                  Subscriber Hub
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Manage your audience with modern tools</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToCSV}
              className="px-6 py-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-sm"
            >
              <FiDownload className="text-xl" />
              Export CSV
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmailModal(true)}
              disabled={subscribers.length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              <FiSend className="text-xl" />
              Send Email
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="text-blue-600 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.totalSubscribers}</div>
                <div className="text-blue-600 text-sm font-semibold">Total</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">All subscribers</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FiBarChart2 className="text-green-600 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.thisMonthSubscribers}</div>
                <div className="text-green-600 text-sm font-semibold">This Month</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">New subscriptions</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp className="text-orange-600 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.growthRate}%</div>
                <div className="text-orange-600 text-sm font-semibold">
                  {stats.growthCount >= 0 ? '+' : ''}{stats.growthCount}
                </div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">Growth rate</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200/50">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search subscribers by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-gray-600 text-sm font-medium">
              {selectedSubscribers.size > 0 
                ? `${selectedSubscribers.size} selected` 
                : `${filteredSubscribers.length} subscribers`
              }
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.size === currentSubscribers.length && currentSubscribers.length > 0}
                      onChange={selectAllSubscribers}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm font-semibold uppercase tracking-wider">Email</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-semibold uppercase tracking-wider">Subscription Date</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSubscribers.map((subscriber) => (
                <motion.tr
                  key={subscriber.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-all duration-300 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.has(subscriber.id)}
                        onChange={() => toggleSubscriberSelection(subscriber.id)}
                        className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {subscriber.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FiCalendar className="text-gray-400" />
                      {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(subscriber)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300 border border-red-200"
                      >
                        <FiTrash2 className="text-lg" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-16">
              <FiMail className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-gray-600 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length}
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-2xl text-gray-700 disabled:opacity-30 transition-all duration-300"
              >
                <FiChevronLeft className="text-lg" />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-2xl text-gray-700 disabled:opacity-30 transition-all duration-300"
              >
                <FiChevronRight className="text-lg" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                      <FiSend className="text-white text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Create Email Campaign</h2>
                      <p className="text-gray-600 mt-1">Send beautiful emails to your subscribers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-gray-600 hover:text-gray-900"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSendEmail} className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {/* Template Selection */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-4 text-lg">Email Template</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(emailTemplates).map(([key, template]) => (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateCampaignTemplate(key)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          emailData.template === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-gray-600 text-sm">{template.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Template-specific fields */}
                {emailData.template === 'admission' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-900 font-semibold mb-2">School Year</label>
                      <input
                        type="text"
                        value={emailData.templateData.schoolYear}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, schoolYear: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2025"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 font-semibold mb-2">Application Deadline</label>
                      <input
                        type="text"
                        value={emailData.templateData.deadline}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, deadline: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="January 31, 2025"
                      />
                    </div>
                  </div>
                )}

                {emailData.template === 'event' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-900 font-semibold mb-2">Event Name</label>
                      <input
                        type="text"
                        value={emailData.templateData.eventName}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, eventName: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Annual Science Fair"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 font-semibold mb-2">Date</label>
                      <input
                        type="text"
                        value={emailData.templateData.date}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, date: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="November 30, 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 font-semibold mb-2">Time</label>
                      <input
                        type="text"
                        value={emailData.templateData.time}
                        onChange={(e) => setEmailData({
                          ...emailData,
                          templateData: { ...emailData.templateData, time: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="9:00 AM - 3:00 PM"
                      />
                    </div>
                  </div>
                )}

                {/* Campaign Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 font-semibold mb-2">Email Subject *</label>
                    <input
                      type="text"
                      required
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email subject line"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-2">Target Audience</label>
                    <select
                      value={emailData.audience}
                      onChange={(e) => setEmailData({ ...emailData, audience: e.target.value })}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Subscribers ({subscribers.length})</option>
                      <option value="selected">Selected Subscribers ({selectedSubscribers.size})</option>
                    </select>
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    {emailData.template === 'custom' ? 'Email Content *' : 'Additional Message'}
                  </label>
                  <textarea
                    value={emailData.customMessage}
                    onChange={(e) => setEmailData({ ...emailData, customMessage: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder={
                      emailData.template === 'custom' 
                        ? 'Write your email content here...' 
                        : 'Add any additional message here...'
                    }
                    required={emailData.template === 'custom'}
                  />
                </div>

                {/* Recipient Info */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-1">Ready to Send</h3>
                      <p className="text-gray-600">
                        {emailData.audience === 'selected' && selectedSubscribers.size > 0
                          ? `${selectedSubscribers.size} selected subscribers`
                          : `All ${subscribers.length} subscribers`
                        }
                      </p>
                    </div>
                    <div className="text-right">
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
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <FiX className="text-lg" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {sendingEmail ? (
                      <>
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="text-lg" />
                        Send Campaign
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 border border-gray-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-200">
                  <FiTrash2 className="text-3xl text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Subscriber</h3>
                <p className="text-gray-600 text-lg">
                  Are you sure you want to delete <strong className="text-gray-900">{subscriberToDelete?.email}</strong>?
                </p>
                <p className="text-gray-500 text-sm mt-3">This action cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-red-500/25"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}