'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiSend,
  FiUsers,
  FiBarChart2,
  FiEye,
  FiMail,
  FiX,
  FiSave,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiRotateCw,
  FiCheck,
  FiUser,
  FiAward,
  FiShield,
  FiBook
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmailManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    recipients: 'all',
    status: 'draft'
  });

  // Enhanced email fetching with proper categorization
  const fetchEmails = async () => {
    try {
      console.log('Fetching emails from APIs...');
      
      // Fetch students from the correct API endpoint
      const studentRes = await fetch('/api/student');
      const studentData = await studentRes.json();
      console.log('Student API response:', studentData);
      
      const students = studentData.success ? studentData.students || studentData.data || [] : [];
      const parentEmails = students
        .filter(s => s.parentEmail && s.parentEmail.trim() !== '')
        .map(s => s.parentEmail.trim());

      // Fetch staff from the correct API endpoint
      const staffRes = await fetch('/api/staff');
      const staffData = await staffRes.json();
      console.log('Staff API response:', staffData);
      
      const staff = staffData.success ? staffData.staff || staffData.data || [] : [];
      
      // Enhanced staff categorization
      const teachingStaff = staff.filter(s => 
        s.role === 'Teacher' || 
        s.department === 'Sciences' || 
        s.department === 'Mathematics' || 
        s.department === 'Languages' || 
        s.department === 'Humanities' ||
        s.department === 'Sports'
      );
      
      const administrativeStaff = staff.filter(s => 
        s.role === 'Principal' || 
        s.role === 'Deputy Principal' ||
        s.department === 'Administration'
      );
      
      const bomMembers = staff.filter(s => 
        s.role === 'BOM Member' || 
        (s.position && s.position.toLowerCase().includes('board'))
      );
      
      const supportStaff = staff.filter(s => 
        s.role === 'Support Staff' || 
        s.role === 'Librarian' || 
        s.role === 'Counselor' ||
        (!teachingStaff.includes(s) && !administrativeStaff.includes(s) && !bomMembers.includes(s))
      );

      // Get emails for each category
      const teacherEmails = teachingStaff.map(s => s.email).filter(email => email && email.trim() !== '');
      const adminEmails = administrativeStaff.map(s => s.email).filter(email => email && email.trim() !== '');
      const bomEmails = bomMembers.map(s => s.email).filter(email => email && email.trim() !== '');
      const supportEmails = supportStaff.map(s => s.email).filter(email => email && email.trim() !== '');
      const allStaffEmails = staff.map(s => s.email).filter(email => email && email.trim() !== '');

      console.log('Email counts:', {
        parents: parentEmails.length,
        teachers: teacherEmails.length,
        admin: adminEmails.length,
        bom: bomEmails.length,
        support: supportEmails.length,
        allStaff: allStaffEmails.length
      });

      // Update state
      setStudents(students);
      setStaff(staff);

      return {
        parentEmails,
        teacherEmails,
        adminEmails,
        bomEmails,
        supportEmails,
        allStaffEmails,
        teachingStaff,
        administrativeStaff,
        bomMembers,
        supportStaff
      };
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Error fetching email data');
      return {
        parentEmails: [],
        teacherEmails: [],
        adminEmails: [],
        bomEmails: [],
        supportEmails: [],
        allStaffEmails: [],
        teachingStaff: [],
        administrativeStaff: [],
        bomMembers: [],
        supportStaff: []
      };
    }
  };

  // Fetch data from APIs
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching all data...');
      
      // Fetch campaigns
      const campaignsRes = await fetch('/api/emails');
      const campaignsData = await campaignsRes.json();
      console.log('Campaigns API response:', campaignsData);
      
      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns || campaignsData.data || []);
      } else {
        toast.error('Failed to fetch campaigns');
      }

      // Fetch students & staff emails
      await fetchEmails();
      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced recipient groups with proper categorization
  const recipientGroups = [
    { 
      value: 'all', 
      label: 'All Recipients', 
      count: calculateTotalRecipients(),
      color: 'blue',
      description: 'All parents and staff members',
      icon: FiUsers
    },
    { 
      value: 'parents', 
      label: 'Parents Only', 
      count: students.filter(s => s.parentEmail && s.parentEmail.trim() !== '').length,
      color: 'green',
      description: 'All parent email addresses',
      icon: FiUser
    },
    { 
      value: 'teachers', 
      label: 'Teaching Staff', 
      count: staff.filter(s => 
        s.role === 'Teacher' || 
        ['Sciences', 'Mathematics', 'Languages', 'Humanities', 'Sports'].includes(s.department)
      ).length,
      color: 'purple',
      description: 'All teaching staff members',
      icon: FiBook
    },
    { 
      value: 'administration', 
      label: 'Administration', 
      count: staff.filter(s => 
        s.role === 'Principal' || 
        s.role === 'Deputy Principal' ||
        s.department === 'Administration'
      ).length,
      color: 'orange',
      description: 'Principal, Deputy Principals, and administrative staff',
      icon: FiAward
    },
    { 
      value: 'bom', 
      label: 'Board of Management', 
      count: staff.filter(s => 
        s.role === 'BOM Member' || 
        (s.position && s.position.toLowerCase().includes('board'))
      ).length,
      color: 'red',
      description: 'Board of Management members',
      icon: FiShield
    },
    { 
      value: 'support', 
      label: 'Support Staff', 
      count: staff.filter(s => 
        s.role === 'Support Staff' || 
        s.role === 'Librarian' || 
        s.role === 'Counselor'
      ).length,
      color: 'indigo',
      description: 'Librarians, counselors, and support staff',
      icon: FiUsers
    },
    { 
      value: 'staff', 
      label: 'All Staff', 
      count: staff.filter(s => s.email && s.email.trim() !== '').length,
      color: 'cyan',
      description: 'All teaching, administrative, and support staff',
      icon: FiUsers
    }
  ];

  function calculateTotalRecipients() {
    const parentEmails = students.filter(s => s.parentEmail && s.parentEmail.trim() !== '').length;
    const staffEmails = staff.filter(s => s.email && s.email.trim() !== '').length;
    return parentEmails + staffEmails;
  }

  // Enhanced email retrieval with proper formatting
  const getRecipientEmails = (recipientType) => {
    console.log(`Getting emails for recipient type: ${recipientType}`);
    
    let emails = [];
    
    switch (recipientType) {
      case 'parents':
        emails = students
          .map(s => s.parentEmail)
          .filter(email => email && email.trim() !== '')
          .map(email => email.trim());
        break;
        
      case 'teachers':
        emails = staff
          .filter(s => 
            s.role === 'Teacher' || 
            ['Sciences', 'Mathematics', 'Languages', 'Humanities', 'Sports'].includes(s.department)
          )
          .map(s => s.email)
          .filter(email => email && email.trim() !== '')
          .map(email => email.trim());
        break;
        
      case 'administration':
        emails = staff
          .filter(s => 
            s.role === 'Principal' || 
            s.role === 'Deputy Principal' ||
            s.department === 'Administration'
          )
          .map(s => s.email)
          .filter(email => email && email.trim() !== '')
          .map(email => email.trim());
        break;
        
      case 'bom':
        emails = staff
          .filter(s => 
            s.role === 'BOM Member' || 
            (s.position && s.position.toLowerCase().includes('board'))
          )
          .map(s => s.email)
          .filter(email => email && email.trim() !== '')
          .map(email => email.trim());
        break;
        
      case 'support':
        emails = staff
          .filter(s => 
            s.role === 'Support Staff' || 
            s.role === 'Librarian' || 
            s.role === 'Counselor'
          )
          .map(s => s.email)
          .filter(email => email && email.trim() !== '')
          .map(email => email.trim());
        break;
        
      case 'staff':
        emails = staff
          .map(s => s.email)
          .filter(email => email && email.trim() !== '')
          .map(email => email.trim());
        break;
        
      case 'all':
      default:
        emails = [
          ...students
            .map(s => s.parentEmail)
            .filter(email => email && email.trim() !== '')
            .map(email => email.trim()),
          ...staff
            .map(s => s.email)
            .filter(email => email && email.trim() !== '')
            .map(email => email.trim())
        ];
        break;
    }
    
    // Remove duplicates and ensure proper formatting
    const uniqueEmails = [...new Set(emails)];
    console.log(`Found ${uniqueEmails.length} emails for ${recipientType}`);
    
    return uniqueEmails;
  };

  // Filtering and pagination
  useEffect(() => {
    let filtered = campaigns;

    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.recipientType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus);
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, campaigns]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Enhanced Pagination Component
  const Pagination = () => {
    const maxVisiblePages = 5;
    const getPageNumbers = () => {
      const pages = [];
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <p className="text-sm text-gray-700">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          
          {getPageNumbers().map((page, index, array) => (
            <div key={page} className="flex items-center">
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => paginate(page)}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            </div>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>
      </div>
    );
  };

  // CRUD Operations
  const handleCreate = () => {
    setFormData({
      title: '',
      subject: '',
      content: '',
      recipients: 'all',
      status: 'draft'
    });
    setEditingCampaign(null);
    setShowModal(true);
  };

  const handleEdit = (campaign) => {
    setFormData({
      title: campaign.title,
      subject: campaign.subject,
      content: campaign.content,
      recipients: campaign.recipientType || 'all',
      status: campaign.status
    });
    setEditingCampaign(campaign);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this email campaign?')) {
      try {
        const response = await fetch(`/api/emails?id=${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCampaigns(campaigns.filter(campaign => campaign.id !== id));
          toast.success('Campaign deleted successfully!');
        } else {
          toast.error(result.error || 'Failed to delete campaign');
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Error deleting campaign');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const recipientEmails = getRecipientEmails(formData.recipients);
      
      if (recipientEmails.length === 0) {
        toast.error('No recipients found for the selected group. Please check your data.');
        return;
      }

      const campaignData = {
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        recipients: recipientEmails.join(', '),
        status: formData.status,
        recipientType: formData.recipients,
        recipientCount: recipientEmails.length,
        sentAt: formData.status === 'published' ? new Date().toISOString() : null
      };

      console.log('Creating campaign with data:', campaignData);

      let response;
      if (editingCampaign) {
        response = await fetch(`/api/emails?id=${editingCampaign.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignData),
        });
      } else {
        response = await fetch('/api/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignData),
        });
      }

      const result = await response.json();

      if (result.success) {
        await fetchData(); // Refresh campaigns
        setShowModal(false);
        toast.success(`Campaign ${editingCampaign ? 'updated' : 'created'} successfully!`);
      } else {
        toast.error(result.error || `Failed to ${editingCampaign ? 'update' : 'create'} campaign`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Error creating campaign');
    }
  };

  const handleSendNow = async (campaign) => {
    if (confirm(`Send this campaign to ${campaign.recipients.split(',').length} recipients?`)) {
      setSending(true);
      try {
        const response = await fetch(`/api/emails?id=${campaign.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...campaign,
            status: 'published',
            sentAt: new Date().toISOString()
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchData(); // Refresh to update status
          toast.success('Campaign sent successfully!');
        } else {
          toast.error(result.error || 'Failed to send campaign');
        }
      } catch (error) {
        console.error('Error sending campaign:', error);
        toast.error('Error sending campaign');
      } finally {
        setSending(false);
      }
    }
  };

  // Stats calculation
  const stats = [
    { 
      label: 'Total Campaigns', 
      value: campaigns.length.toString(), 
      icon: FiMail, 
      color: 'blue' 
    },
    { 
      label: 'Sent Campaigns', 
      value: campaigns.filter(c => c.status === 'published').length.toString(), 
      icon: FiSend, 
      color: 'green' 
    },
    { 
      label: 'Draft Campaigns', 
      value: campaigns.filter(c => c.status === 'draft').length.toString(), 
      icon: FiSave, 
      color: 'purple' 
    },
    { 
      label: 'Total Recipients', 
      value: calculateTotalRecipients().toString(), 
      icon: FiUsers, 
      color: 'orange' 
    }
  ];

  // Enhanced audience overview
  const audienceOverview = [
    { label: 'Total Parents', value: students.filter(s => s.parentEmail && s.parentEmail.trim() !== '').length },
    { label: 'Teaching Staff', value: staff.filter(s => s.role === 'Teacher' || ['Sciences', 'Mathematics', 'Languages', 'Humanities', 'Sports'].includes(s.department)).length },
    { label: 'Administration', value: staff.filter(s => s.role === 'Principal' || s.role === 'Deputy Principal' || s.department === 'Administration').length },
    { label: 'BOM Members', value: staff.filter(s => s.role === 'BOM Member' || (s.position && s.position.toLowerCase().includes('board'))).length },
    { label: 'Support Staff', value: staff.filter(s => s.role === 'Support Staff' || s.role === 'Librarian' || s.role === 'Counselor').length },
    { label: 'Total Audience', value: calculateTotalRecipients() }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading email campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 lg:p-6 space-y-6">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Email Campaign Manager
          </h1>
          <p className="text-gray-600 mt-2">Create and manage email campaigns for school communication</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg"
          >
            <FiRotateCw className="text-lg" />
            Refresh
          </button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25"
          >
            <FiPlus className="text-lg" />
            New Campaign
          </motion.button>
        </div>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 lg:p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`text-lg lg:text-xl text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Compose */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiMail className="text-blue-500" />
            Quick Compose
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipients
              </label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              >
                {recipientGroups.map(group => (
                  <option key={group.value} value={group.value}>
                    {group.label} ({group.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Enter email subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Content
              </label>
              <textarea
                rows="6"
                placeholder="Write your email content here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  setFormData({ ...formData, status: 'draft' });
                  handleSubmit({ preventDefault: () => {} });
                }}
              >
                <FiSave className="text-lg" />
                Save Draft
              </button>
              <button 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/25"
                onClick={() => {
                  setFormData({ ...formData, status: 'published' });
                  handleSubmit({ preventDefault: () => {} });
                }}
              >
                <FiSend className="text-lg" />
                Send Now
              </button>
            </div>
          </div>
        </div>

        {/* Recipient Groups & Stats */}
        <div className="space-y-6">
          {/* Recipient Groups */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiUsers className="text-blue-500" />
              Recipient Groups
            </h3>
            <div className="space-y-3">
              {recipientGroups.map(group => (
                <motion.div
                  key={group.value}
                  whileHover={{ x: 4 }}
                  className={`flex items-center justify-between p-3 border border-${group.color}-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-${group.color}-300 hover:bg-${group.color}-50`}
                  onClick={() => setFormData({ ...formData, recipients: group.value })}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <group.icon className={`text-${group.color}-500 text-sm`} />
                      <span className="font-medium text-gray-700 text-sm">{group.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">{group.description}</p>
                  </div>
                  <span className={`bg-${group.color}-100 text-${group.color}-800 px-2 py-1 rounded-full text-xs font-semibold`}>
                    {group.count}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-green-500" />
              Audience Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {audienceOverview.map((item, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Sent</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCampaigns.map((campaign) => (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {campaign.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{campaign.subject}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {campaign.recipientType || 'all'} • {campaign.recipientCount || campaign.recipients?.split(',').length || 0} recipients
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {campaign.recipientCount || campaign.recipients?.split(',').length || 0} recipients
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar className="text-gray-400" />
                      {campaign.sentAt 
                        ? new Date(campaign.sentAt).toLocaleDateString()
                        : new Date(campaign.createdAt).toLocaleDateString()
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      campaign.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'published' ? 'Sent' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {campaign.status === 'draft' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSendNow(campaign)}
                          disabled={sending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Send Now"
                        >
                          <FiSend className="text-lg" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(campaign)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit className="text-lg" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(campaign.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="text-lg" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCampaigns.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <Pagination />
          </div>
        )}

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <FiMail className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No campaigns found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first email campaign to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="text-xl text-gray-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter campaign title"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Group *
                    </label>
                    <select
                      required
                      value={formData.recipients}
                      onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {recipientGroups.map(group => (
                        <option key={group.value} value={group.value}>
                          {group.label} ({group.count} recipients)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write your email content here..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The content will be wrapped in the school email template automatically.
                  </p>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <FiCheck className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Recipient Preview</p>
                    <p className="text-xs text-blue-600">
                      This will be sent to {getRecipientEmails(formData.recipients).length} recipients in the {recipientGroups.find(g => g.value === formData.recipients)?.label} group
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'draft' : 'published' })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Save as Draft</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <FiSave className="text-lg" />
                    {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}