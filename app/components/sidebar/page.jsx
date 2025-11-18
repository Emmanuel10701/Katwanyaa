'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FiLogOut, 
  FiX, 
  FiSettings, 
  FiHelpCircle, 
  FiChevronRight,
  FiBook, 
  FiImage,
  FiMail,
  FiUser,
  FiShield,
  FiUsers,
  FiUserCheck,
  FiInfo,
  FiMessageCircle,
  FiCalendar,
  FiUserPlus
} from 'react-icons/fi';

import { 
  IoSparkles, 
  IoStatsChart,
  IoRocket,
  IoNewspaper,
  IoPeopleCircle,
  IoSchool
} from 'react-icons/io5';

import { 
  MdAdminPanelSettings,
  MdPersonOutline
} from 'react-icons/md';
import { useEffect, useState } from 'react';

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, tabs }) {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [realStats, setRealStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalSubscribers: 0,
    studentCouncil: 0,
    upcomingEvents: 0,
    totalNews: 0,
    activeAssignments: 0,
    galleryItems: 0,
    guidanceSessions: 0
  });

  // Get user data from localStorage same way as dashboard
  useEffect(() => {
    const initializeUser = async () => {
      setLoading(true);
      
      try {
        console.log('🔍 Sidebar: Checking localStorage for user data...');
        
        // Check ALL possible localStorage keys for user data (same as dashboard)
        const possibleUserKeys = ['admin_user', 'user', 'currentUser', 'auth_user'];
        const possibleTokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token'];
        
        let userData = null;
        let token = null;
        
        // Find user data in any possible key
        for (const key of possibleUserKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            console.log(`✅ Sidebar: Found user data in key: ${key}`);
            userData = data;
            break;
          }
        }
        
        // Find token in any possible key
        for (const key of possibleTokenKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            console.log(`✅ Sidebar: Found token in key: ${key}`);
            token = data;
            break;
          }
        }
        
        if (!userData) {
          console.log('❌ Sidebar: No user data found in localStorage');
          window.location.href = '/pages/adminLogin';
          return;
        }

        // Parse user data
        const user = JSON.parse(userData);
        console.log('📋 Sidebar: Parsed user data:', user);
        
        // Verify token is still valid (if available) - same as dashboard
        if (token) {
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenPayload.exp < currentTime) {
              console.log('❌ Sidebar: Token expired');
              // Clear all auth data
              possibleUserKeys.forEach(key => localStorage.removeItem(key));
              possibleTokenKeys.forEach(key => localStorage.removeItem(key));
              window.location.href = '/pages/adminLogin';
              return;
            }
            console.log('✅ Sidebar: Token is valid');
          } catch (tokenError) {
            console.log('⚠️ Sidebar: Token validation skipped:', tokenError.message);
          }
        }

        // Check if user has valid role - same as dashboard
        const userRole = user.role;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'TEACHER', 'PRINCIPAL'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          console.log('❌ Sidebar: User does not have valid role:', userRole);
          window.location.href = '/pages/adminLogin';
          return;
        }

        console.log('✅ Sidebar: User authenticated successfully:', user.name);
        setUser(user);
        
      } catch (error) {
        console.error('❌ Sidebar: Error initializing user:', error);
        // Clear all auth data on error
        localStorage.clear();
        window.location.href = '/pages/adminLogin';
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Fetch real counts from APIs
  const fetchRealCounts = async () => {
    try {
      const [
        studentsRes,
        staffRes,
        subscribersRes,
        councilRes,
        eventsRes,
        newsRes,
        assignmentsRes,
        galleryRes,
        guidanceRes
      ] = await Promise.allSettled([
        fetch('/api/student'),
        fetch('/api/staff'),
        fetch('/api/subscriber'),
        fetch('/api/studentCouncil'),
        fetch('/api/events'),
        fetch('/api/news'),
        fetch('/api/assignment'),
        fetch('/api/gallery'),
        fetch('/api/guidance')
      ]);

      // Process responses and get actual counts
      const students = studentsRes.status === 'fulfilled' ? await studentsRes.value.json() : { students: [] };
      const staff = staffRes.status === 'fulfilled' ? await staffRes.value.json() : { staff: [] };
      const subscribers = subscribersRes.status === 'fulfilled' ? await subscribersRes.value.json() : { subscribers: [] };
      const council = councilRes.status === 'fulfilled' ? await councilRes.value.json() : { councilMembers: [] };
      const events = eventsRes.status === 'fulfilled' ? await eventsRes.value.json() : { events: [] };
      const news = newsRes.status === 'fulfilled' ? await newsRes.value.json() : { news: [] };
      const assignments = assignmentsRes.status === 'fulfilled' ? await assignmentsRes.value.json() : { assignments: [] };
      const gallery = galleryRes.status === 'fulfilled' ? await galleryRes.value.json() : { galleries: [] };
      const guidance = guidanceRes.status === 'fulfilled' ? await guidanceRes.value.json() : { events: [] };

      // Calculate real counts
      const activeStudents = students.students?.filter(s => s.status === 'Active').length || 0;
      const activeCouncil = council.councilMembers?.filter(c => c.status === 'Active').length || 0;
      const upcomingEvents = events.events?.filter(e => new Date(e.date) > new Date()).length || 0;
      const activeAssignments = assignments.assignments?.filter(a => a.status === 'assigned').length || 0;

      setRealStats({
        totalStudents: students.students?.length || 0,
        activeStudents,
        totalStaff: staff.staff?.length || 0,
        totalSubscribers: subscribers.subscribers?.length || 0,
        studentCouncil: activeCouncil,
        upcomingEvents,
        totalNews: news.news?.length || 0,
        activeAssignments,
        galleryItems: gallery.galleries?.length || 0,
        guidanceSessions: guidance.events?.length || 0
      });

    } catch (error) {
      console.error('Error fetching real counts:', error);
    }
  };

  // Fetch counts when component mounts
  useEffect(() => {
    if (!loading) {
      fetchRealCounts();
    }
  }, [loading]);

  // Detect screen size and set initial sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Auto-open sidebar on large screens, close on small screens
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setSidebarOpen]);

  const handleLogout = () => {
    // Clear ALL possible auth data - same as dashboard
    const possibleUserKeys = ['admin_user', 'user', 'currentUser', 'auth_user'];
    const possibleTokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token'];
    
    possibleUserKeys.forEach(key => localStorage.removeItem(key));
    possibleTokenKeys.forEach(key => localStorage.removeItem(key));
    
    window.location.href = '/pages/adminLogin';
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Only close sidebar on mobile screens
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSupportClick = () => {
    setShowSupportModal(true);
  };

  const sidebarVariants = {
    open: { 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40 
      } 
    },
    closed: { 
      x: "-100%", 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40,
        delay: 0.1
      } 
    }
  };

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        x: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      x: -50,
      opacity: 0,
      transition: {
        x: { stiffness: 1000 }
      }
    }
  };

  // Enhanced quick stats with real data
  const quickStats = [
    { 
      label: 'Students', 
      value: realStats.totalStudents?.toLocaleString() || '0', 
      icon: FiUser, 
      color: 'blue', 
      change: '+12%' 
    },
    { 
      label: 'Staff', 
      value: realStats.totalStaff?.toLocaleString() || '0', 
      icon: IoStatsChart, 
      color: 'green', 
      change: '+5%' 
    },
    { 
      label: 'Active', 
      value: realStats.activeAssignments?.toLocaleString() || '0', 
      icon: IoRocket, 
      color: 'purple', 
      change: '+8%' 
    },
    { 
      label: 'Council', 
      value: realStats.studentCouncil?.toLocaleString() || '0', 
      icon: IoSparkles, 
      color: 'orange', 
      change: '+3%' 
    }
  ];

  // Define default tabs if none provided - now with real counts
  const defaultTabs = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: FiUser,
      count: null,
      badge: 'primary'
    },
    { 
      id: 'school-info', 
      label: 'School Information', 
      icon: FiInfo,
      count: null,
      badge: 'info'
    },
    { 
      id: 'guidance-counseling', 
      label: 'Guidance Counseling', 
      icon: FiMessageCircle,
      count: realStats.guidanceSessions,
      badge: 'purple'
    },
    { 
      id: 'students', 
      label: 'Student Management', 
      icon: FiUsers,
      count: realStats.totalStudents,
      badge: 'blue'
    },
    { 
      id: 'student-council', 
      label: 'Student Council', 
      icon: FiUsers,
      count: realStats.studentCouncil,
      badge: 'green'
    },
    { 
      id: 'staff', 
      label: 'Staff Management', 
      icon: FiUserCheck,
      count: realStats.totalStaff,
      badge: 'orange'
    },
    { 
      id: 'assignments', 
      label: 'Assignments', 
      icon: FiBook,
      count: realStats.activeAssignments,
      badge: 'red'
    },
    { 
      id: 'newsevents', 
      label: 'News & Events', 
      icon: IoNewspaper,
      count: (realStats.upcomingEvents + realStats.totalNews) || null,
      badge: 'yellow'
    },
    { 
      id: 'gallery', 
      label: 'Media Gallery', 
      icon: FiImage,
      count: realStats.galleryItems,
      badge: 'pink'
    },
    { 
      id: 'subscribers', 
      label: 'Subscribers', 
      icon: IoPeopleCircle,
      count: realStats.totalSubscribers,
      badge: 'teal'
    },
    { 
      id: 'email', 
      label: 'Email Manager', 
      icon: FiMail,
      count: null,
      badge: 'indigo'
    },
    { 
      id: 'admins-profile', 
      label: 'Admins & Profile', 
      icon: MdAdminPanelSettings,
      count: null,
      badge: 'gray'
    }
  ];

  // Use provided tabs if non-empty, otherwise fall back to defaults
  const safeTabs = Array.isArray(tabs) && tabs.length > 0 ? tabs : defaultTabs;

  // Count badge component
  const CountBadge = ({ count, color = 'blue' }) => {
    if (count === null || count === undefined) return null;
    
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`ml-auto px-2 py-1 text-xs font-bold rounded-full bg-${color}-100 text-${color}-600 border border-${color}-200`}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    );
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-[416px] lg:w-[374px] xl:w-[416px] bg-white shadow-xl border-r border-gray-200 backdrop-blur-xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no user but loading is false, it means we're redirecting
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            onClick={() => setShowSupportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiHelpCircle className="text-blue-500" />
                  Technical Support
                </h3>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiX className="text-lg text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Need help with the admin panel? I'm here to provide technical assistance anytime!
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                      <FiMessageCircle className="text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">WhatsApp</p>
                      <p className="text-gray-600">079347260</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                      <FiMail className="text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <p className="text-gray-600">emmannuelmakau90@gmail.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    💡 Available for technical assistance, bug fixes, and feature requests
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Open WhatsApp
                    window.open('https://wa.me/25479347260', '_blank');
                  }}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold"
                >
                  Contact WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        className="fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-[416px] lg:w-[374px] xl:w-[416px] bg-white shadow-xl border-r border-gray-200 backdrop-blur-xl overflow-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <Image
                    src="/logo.jpg"
                    alt="Katwanyaa High School Logo"
                    width={26}
                    height={26}
                    className="filter brightness-0 invert drop-shadow-lg"
                    priority
                  />
                </div>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg"
                />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Katwanyaa High
                </h1>
                <p className="text-gray-600 text-sm font-medium">Admin Portal</p>
              </div>
            </div>
            
            {/* Close button - only show on mobile */}
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-800"
              >
                <FiX className="text-xl" />
              </motion.button>
            )}
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 p-6 overflow-y-auto hide-scrollbar">
            <motion.div 
              variants={containerVariants}
              className="space-y-2"
            >
              {safeTabs.map((tab) => {
                const TabIcon = tab.icon || FiUser;
                return (
                 <motion.button
                   key={tab.id}
                   variants={itemVariants}
                   whileHover={{ 
                    x: 8,
                    backgroundColor: 'rgba(59, 130, 246, 0.08)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-lg shadow-blue-500/10 backdrop-blur-sm border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-lg shadow-blue-400/50"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800'
                  }`}>
                    <TabIcon className="text-lg relative z-10" />
                    {activeTab === tab.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl"
                      />
                    )}
                  </div>

                  {/* Label and Count */}
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="font-semibold text-sm lg:text-base relative z-10 text-left">
                      {tab.label}
                    </span>
                    
                    {/* Count Badge */}
                    {tab.count !== null && tab.count !== undefined && (
                      <CountBadge count={tab.count} color={tab.badge} />
                    )}
                  </div>

                  {/* Active chevron */}
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-blue-500"
                    >
                      <FiChevronRight className="text-lg" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
            </motion.div>

            {/* Quick Stats with Real Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <IoSparkles className="text-lg" />
                <span className="font-semibold text-sm">Live Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickStats.map((stat, index) => {
                  const StatIcon = stat.icon || FiUser;
                  return (
                   <motion.div
                     key={stat.label}
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.4 + index * 0.1 }}
                     whileHover={{ scale: 1.05, y: -2 }}
                     className="text-center p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 group cursor-pointer shadow-sm"
                   >
                    <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <StatIcon className={`text-${stat.color}-600 text-sm`} />
                    </div>
                    <div className="text-gray-800 font-bold text-sm">{stat.value}</div>
                    <div className="text-gray-600 text-xs mt-1">{stat.label}</div>
                    <div className={`text-${stat.color}-600 text-xs font-semibold mt-1`}>
                       {stat.change}
                     </div>
                   </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </nav>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 border-t border-gray-200 flex-shrink-0"
          >
            {/* User Profile */}
            <motion.div 
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 mb-4 cursor-pointer transition-all duration-300"
              onClick={() => handleTabClick('admins-profile')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name?.charAt(0) || 'A'}
                </div>
                <motion.div 
                  animate={{ 
                    boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 10px rgba(34, 197, 94, 0)']
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {user.name}
                </p>
                <p className="text-gray-600 text-xs truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <FiShield className="text-emerald-500 text-xs" />
                  <span className="text-emerald-600 text-xs font-medium capitalize">
                    {user.role?.replace('_', ' ') || 'administrator'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-200 text-sm"
                onClick={() => handleTabClick('admins-profile')}
              >
                <FiSettings className="text-base" />
                <span>Settings</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-200 text-sm"
                onClick={handleSupportClick}
              >
                <FiHelpCircle className="text-base" />
                <span>Support</span>
              </motion.button>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-300 group"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <FiLogOut className="text-lg" />
              </motion.div>
              <span className="font-semibold text-sm">Sign Out</span>
            </motion.button>

            {/* Version Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-4 pt-4 border-t border-gray-200"
            >
              <p className="text-gray-400 text-xs">
                v2.1.0 • Katwanyaa High
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}