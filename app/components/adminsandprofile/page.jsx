'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiSearch, 
  FiUser, 
  FiTrash2, 
  FiDownload,
  FiTrendingUp,
  FiUsers,
  FiBarChart2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiEdit3,
  FiCalendar,
  FiShield,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiLogOut
} from 'react-icons/fi';

export default function AdminManager() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const router = useRouter();
  
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedAdmins, setSelectedAdmins] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 8;

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+254',
    role: 'ADMIN',
    permissions: {
      manageUsers: false,
      manageContent: true,
      manageSettings: false,
      viewReports: true
    },
    status: 'active'
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          setSession({ user: JSON.parse(user), token });
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
          toast.error('Please login to access this page');
          router.push('/adminLogin');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setStatus('unauthenticated');
        router.push('/adminLogin');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch admins from API
  const fetchAdmins = async (showRefresh = false) => {
    if (status !== 'authenticated') return;
    
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const storedAdmins = localStorage.getItem('adminList');
      if (storedAdmins) {
        const adminsData = JSON.parse(storedAdmins);
        setAdmins(adminsData);
        setFilteredAdmins(adminsData);
      } else {
        if (session?.user) {
          const initialAdmins = [{
            ...session.user,
            id: session.user.id || 'current-user',
            phone: session.user.phone || '+254700000000',
            role: session.user.role || 'ADMIN',
            status: 'active',
            permissions: {
              manageUsers: true,
              manageContent: true,
              manageSettings: true,
              viewReports: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
          setAdmins(initialAdmins);
          setFilteredAdmins(initialAdmins);
          localStorage.setItem('adminList', JSON.stringify(initialAdmins));
        } else {
          setAdmins([]);
          setFilteredAdmins([]);
        }
      }

      if (showRefresh) {
        toast.success('🔄 Admins refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('❌ Failed to load admins');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAdmins();
    }
  }, [status]);

  // Calculate statistics with safe access
  const calculateStats = () => {
    const adminArray = admins || [];
    const totalAdmins = adminArray.length;
    const activeAdmins = adminArray.filter(admin => admin.status === 'active').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthAdmins = adminArray.filter(admin => {
      if (!admin.createdAt) return false;
      const adminDate = new Date(admin.createdAt);
      return adminDate.getMonth() === currentMonth && adminDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthAdmins = adminArray.filter(admin => {
      if (!admin.createdAt) return false;
      const adminDate = new Date(admin.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return adminDate.getMonth() === lastMonth && adminDate.getFullYear() === year;
    }).length;
    
    const growthRate = lastMonthAdmins > 0 
      ? ((thisMonthAdmins - lastMonthAdmins) / lastMonthAdmins * 100).toFixed(1)
      : thisMonthAdmins > 0 ? 100 : 0;

    return {
      totalAdmins,
      activeAdmins,
      thisMonthAdmins,
      lastMonthAdmins,
      growthRate: parseFloat(growthRate),
      growthCount: thisMonthAdmins - lastMonthAdmins
    };
  };

  const stats = calculateStats();

  // Filter admins by search
  useEffect(() => {
    let filtered = admins || [];

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phone?.includes(searchTerm)
      );
    }

    setFilteredAdmins(filtered);
    setCurrentPage(1);
  }, [searchTerm, admins]);

  // Pagination logic
  const totalPages = Math.ceil((filteredAdmins?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAdmins = (filteredAdmins || []).slice(startIndex, startIndex + itemsPerPage);

  // Handle admin selection
  const toggleAdminSelection = (adminId) => {
    const newSelected = new Set(selectedAdmins);
    if (newSelected.has(adminId)) {
      newSelected.delete(adminId);
    } else {
      newSelected.add(adminId);
    }
    setSelectedAdmins(newSelected);
  };

  const selectAllAdmins = () => {
    if (selectedAdmins.size === currentAdmins.length) {
      setSelectedAdmins(new Set());
    } else {
      setSelectedAdmins(new Set(currentAdmins.map(admin => admin.id)));
    }
  };

  // Handle admin deletion
  const handleDelete = (admin) => {
    if (session?.user && admin.id === session.user.id) {
      toast.error('❌ You cannot delete your own account');
      return;
    }
    setAdminToDelete(admin);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    
    try {
      const updatedAdmins = admins.filter(admin => admin.id !== adminToDelete.id);
      setAdmins(updatedAdmins);
      localStorage.setItem('adminList', JSON.stringify(updatedAdmins));
      
      toast.success('🗑️ Admin deleted successfully!');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('❌ Failed to delete admin');
    } finally {
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAdminToDelete(null);
  };

  // Handle admin creation/editing
  const handleCreateAdmin = () => {
    setAdminData({
      name: '',
      email: '',
      password: '',
      phone: '+254',
      role: 'ADMIN',
      permissions: {
        manageUsers: false,
        manageContent: true,
        manageSettings: false,
        viewReports: true
      },
      status: 'active'
    });
    setEditingAdmin(null);
    setShowAdminModal(true);
  };

  const handleEditAdmin = (admin) => {
    setAdminData({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      phone: admin.phone || '+254',
      role: admin.role || 'ADMIN',
      permissions: admin.permissions || {
        manageUsers: false,
        manageContent: true,
        manageSettings: false,
        viewReports: true
      },
      status: admin.status || 'active'
    });
    setEditingAdmin(admin);
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    setSavingAdmin(true);

    try {
      const token = localStorage.getItem('token');
      const adminPayload = {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: adminData.role,
        permissions: adminData.permissions,
        status: adminData.status
      };

      if (adminData.password) {
        adminPayload.password = adminData.password;
      }

      let response;
      if (editingAdmin) {
        const updatedAdmins = admins.map(admin => 
          admin.id === editingAdmin.id 
            ? { 
                ...admin, 
                ...adminPayload, 
                updatedAt: new Date().toISOString(),
                id: admin.id
              }
            : admin
        );
        setAdmins(updatedAdmins);
        localStorage.setItem('adminList', JSON.stringify(updatedAdmins));
        toast.success('✅ Admin updated successfully!');
      } else {
        response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(adminPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create admin');
        }

        if (data.success) {
          const newAdmin = {
            ...data.user,
            phone: adminData.phone,
            role: adminData.role,
            permissions: adminData.permissions,
            status: adminData.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const updatedAdmins = [...admins, newAdmin];
          setAdmins(updatedAdmins);
          localStorage.setItem('adminList', JSON.stringify(updatedAdmins));
          toast.success('✅ Admin created successfully!');
        } else {
          throw new Error(data.error || 'Failed to create admin');
        }
      }

      setShowAdminModal(false);
      setAdminData({
        name: '',
        email: '',
        password: '',
        phone: '+254',
        role: 'ADMIN',
        permissions: {
          manageUsers: false,
          manageContent: true,
          manageSettings: false,
          viewReports: true
        },
        status: 'active'
      });
      
    } catch (error) {
      console.error('Error saving admin:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setSavingAdmin(false);
    }
  };

  // Update permission
  const updatePermission = (permission, value) => {
    setAdminData({
      ...adminData,
      permissions: {
        ...adminData.permissions,
        [permission]: value
      }
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
      const csvData = (filteredAdmins || []).map(admin => [
        admin.name,
        admin.email,
        admin.phone,
        admin.role,
        admin.status,
        new Date(admin.createdAt).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admins-${new Date().toISOString().split('T')[0]}.csv`;
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('👋 Logged out successfully');
    router.push('/adminLogin');
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-4 lg:p-8 space-y-8">
      <ToastContainer position="top-right" />

      {/* Current Admin Profile Card */}
      {session?.user && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                <FiUser className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
                <p className="text-gray-600">Logged in as {session.user.role || 'ADMIN'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <FiLogOut className="text-lg" />
                Logout
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <FiUser className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{session.user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <FiMail className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{session.user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <FiPhone className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{session.user.phone || '+254700000000'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <FiShield className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                  Admin Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Manage system administrators and permissions</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchAdmins(true)}
              disabled={refreshing}
              className="px-6 py-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-sm"
            >
              {refreshing ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiRefreshCw className="text-xl" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </motion.button>
            
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
              onClick={handleCreateAdmin}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              <FiPlus className="text-xl" />
              Add Admin
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
                <div className="text-3xl font-bold text-gray-900">{stats.totalAdmins}</div>
                <div className="text-blue-600 text-sm font-semibold">Total</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">All administrators</div>
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
                <FiUser className="text-green-600 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.activeAdmins}</div>
                <div className="text-green-600 text-sm font-semibold">Active</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">Active administrators</div>
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
              placeholder="Search admins by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-gray-600 text-sm font-medium">
              {selectedAdmins.size > 0 
                ? `${selectedAdmins.size} selected` 
                : `${filteredAdmins.length} admins`
              }
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAdmins.size === currentAdmins.length && currentAdmins.length > 0}
                      onChange={selectAllAdmins}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm font-semibold uppercase tracking-wider">Admin</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-semibold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-semibold uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAdmins.map((admin) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-all duration-300 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAdmins.has(admin.id)}
                        onChange={() => toggleAdminSelection(admin.id)}
                        className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {admin.name}
                          {session?.user && admin.id === session.user.id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                        <p className="text-sm text-gray-400">{admin.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      admin.role === 'SUPER_ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : admin.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      admin.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FiCalendar className="text-gray-400" />
                      {new Date(admin.createdAt).toLocaleDateString('en-US', {
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
                        onClick={() => handleEditAdmin(admin)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-300 border border-blue-200"
                      >
                        <FiEdit3 className="text-lg" />
                      </motion.button>
                      {session?.user && admin.id !== session.user.id && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(admin)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300 border border-red-200"
                        >
                          <FiTrash2 className="text-lg" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredAdmins.length === 0 && (
            <div className="text-center py-16">
              <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No admins found matching your search.' : 'No admins found.'}
              </p>
            </div>
          )}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-gray-600 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length}
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

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAdminModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                      <FiUser className="text-white text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                      </h2>
                      <p className="text-gray-600 mt-1">Manage admin details and permissions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-gray-600 hover:text-gray-900"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSaveAdmin} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={adminData.name}
                      onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">Email *</label>
                    <input
                      type="email"
                      required
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">
                      {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      required={!editingAdmin}
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={adminData.phone}
                      onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="+254700000000"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">Role *</label>
                    <select
                      required
                      value={adminData.role}
                      onChange={(e) => setAdminData({ ...adminData, role: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="MODERATOR">Moderator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">Status *</label>
                    <select
                      required
                      value={adminData.status}
                      onChange={(e) => setAdminData({ ...adminData, status: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-4">Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <input
                        type="checkbox"
                        checked={adminData.permissions.manageUsers}
                        onChange={(e) => updatePermission('manageUsers', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Manage Users</p>
                        <p className="text-sm text-gray-600">Create, edit, and delete users</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <input
                        type="checkbox"
                        checked={adminData.permissions.manageContent}
                        onChange={(e) => updatePermission('manageContent', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Manage Content</p>
                        <p className="text-sm text-gray-600">Create and edit website content</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <input
                        type="checkbox"
                        checked={adminData.permissions.manageSettings}
                        onChange={(e) => updatePermission('manageSettings', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Manage Settings</p>
                        <p className="text-sm text-gray-600">Modify system settings</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <input
                        type="checkbox"
                        checked={adminData.permissions.viewReports}
                        onChange={(e) => updatePermission('viewReports', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">View Reports</p>
                        <p className="text-sm text-gray-600">Access analytics and reports</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <FiX className="text-lg" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAdmin}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {savingAdmin ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiUser className="text-lg" />
                        {editingAdmin ? 'Update Admin' : 'Create Admin'}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Admin</h3>
                <p className="text-gray-600 text-lg">
                  Are you sure you want to delete <strong className="text-gray-900">{adminToDelete?.name}</strong>?
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