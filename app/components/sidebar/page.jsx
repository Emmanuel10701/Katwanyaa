'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FiLogOut, 
  FiX, 
  FiSettings, 
  FiHelpCircle, 
  FiChevronRight,
  FiBell,
  FiBook, 
  FiImage,
  FiMail,
  FiUser,
  FiShield,
  FiUsers,
  FiUserCheck,
  FiInfo,
  FiMessageCircle
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

  // Get user data from localStorage on component mount
  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
          setUser(JSON.parse(userData));
        } else {
          // Fallback to default user data
          setUser({
            name: 'Admin User',
            email: 'admin@katwanyaa.edu',
            role: 'administrator',
            phone: '+254700000000'
          });
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        setUser({
          name: 'Admin User',
          email: 'admin@katwanyaa.edu',
          role: 'administrator',
          phone: '+254700000000'
        });
      }
    };

    getUserData();
  }, []);

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
    // Clear localStorage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/adminLogin';
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Only close sidebar on mobile screens
    if (isMobile) {
      setSidebarOpen(false);
    }
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

  const quickStats = [
    { label: 'Students', value: '1.2K', icon: FiUser, color: 'blue', change: '+12%' },
    { label: 'Staff', value: '68', icon: IoStatsChart, color: 'green', change: '+5%' },
    { label: 'Active', value: '45', icon: IoRocket, color: 'purple', change: '+8%' },
    { label: 'Success', value: '98%', icon: IoSparkles, color: 'orange', change: '+3%' }
  ];

  // Define default tabs if none provided
  const defaultTabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: FiUser },
    { id: 'school-info', label: 'School Information', icon: FiInfo },
    { id: 'guidance-counseling', label: 'Guidance Counseling', icon: FiMessageCircle },
    { id: 'students', label: 'Student Management', icon: FiUsers },
    { id: 'student-council', label: 'Student Council', icon: FiUsers }, // Add this line
    { id: 'staff', label: 'Staff Management', icon: FiUserCheck },
    { id: 'assignments', label: 'Assignments', icon: FiBook },
    { id: 'newsevents', label: 'News & Events', icon: IoNewspaper },
    { id: 'gallery', label: 'Media Gallery', icon: FiImage },
    { id: 'subscribers', label: 'Subscribers', icon: IoPeopleCircle },
    { id: 'email', label: 'Email Manager', icon: FiMail },
    { id: 'admins-profile', label: 'Admins & Profile', icon: MdAdminPanelSettings }
  ];

  // Use provided tabs if non-empty, otherwise fall back to defaults
  const safeTabs = Array.isArray(tabs) && tabs.length > 0 ? tabs : defaultTabs;

  // Use user data or fallback
  const currentUser = user || {
    name: 'Admin User',
    email: 'admin@katwanyaa.edu',
    role: 'administrator'
  };

  return (
    <>
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

                  {/* Label */}
                  <span className="font-semibold text-sm lg:text-base relative z-10 flex-1 text-left">
                    {tab.label}
                  </span>

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

            {/* Quick Stats */}
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
                  {currentUser.name.charAt(0)}
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
                <p className="font-semibold text-gray-800 text-sm truncate">{currentUser.name}</p>
                <p className="text-gray-600 text-xs truncate">{currentUser.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FiShield className="text-emerald-500 text-xs" />
                  <span className="text-emerald-600 text-xs font-medium capitalize">
                    {currentUser.role.replace('_', ' ')}
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