'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiUsers, 
  FiBook, 
  FiCalendar,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiBell,
  FiUser,
  FiMail,
  FiUserPlus,
  FiImage,
  FiShield,
  FiMessageCircle,
  FiInfo
} from 'react-icons/fi';
import { 
  IoStatsChart,
  IoPeopleCircle,
  IoNewspaper
} from 'react-icons/io5';

// Material UI Components
import { CircularProgress, Backdrop } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

// Import components
import AdminSidebar from '../components/sidebar/page';
import DashboardOverview from '../components/dashbaord/page';
import AssignmentsManager from '../components/AssignmentsManager/page';
import NewsEventsManager from '../components/eventsandnews/page';
import StaffManager from '../components/staff/page';
import StudentManager from '../components/students/page';
import SubscriberManager from '../components/subscriber/page';
import EmailManager from '../components/email/page';
import GalleryManager from '../components/gallery/page';
import StudentCouncil from '../components/studentCouncil/page';

import AdminsProfileManager from '../components/adminsandprofile/page';

// Import the new components
import GuidanceCounselingTab from '../components/guidance/page';
import SchoolInfoTab from '../components/schoolinfo/page';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalSubscribers: 0,
    pendingEmails: 0,
    activeAssignments: 0,
    upcomingEvents: 0,
    galleryItems: 0
  });

  useEffect(() => {
    // Simulate API call with delay
    const initializeDashboard = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const adminUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@katwanyaa.ac.ke',
        role: 'super_admin',
        avatar: null
      };
      setUser(adminUser);

      setStats({
        totalStudents: 1247,
        totalStaff: 68,
        totalSubscribers: 2345,
        pendingEmails: 12,
        activeAssignments: 45,
        upcomingEvents: 8,
        galleryItems: 156
      });
      
      setLoading(false);
    };

    initializeDashboard();
  }, []);

  const renderContent = () => {
    if (loading) return null;

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} />;
      case 'school-info':
        return <SchoolInfoTab />;
      case 'guidance-counseling':
        return <GuidanceCounselingTab />;
      case 'students':
        return <StudentManager />;
      case 'student-council': // Add this case
       return <StudentCouncil />;
      case 'staff':
        return <StaffManager />;
      case 'assignments':
        return <AssignmentsManager />;
      case 'newsevents':
        return <NewsEventsManager />;
      case 'gallery':
        return <GalleryManager />;
      case 'subscribers':
        return <SubscriberManager />;
      case 'email':
        return <EmailManager />;
      case 'admins-profile':
        return <AdminsProfileManager user={user} />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  // Navigation items including the new tabs
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FiHome },
    { id: 'school-info', label: 'School Information', icon: FiInfo },
    { id: 'guidance-counseling', label: 'Guidance Counseling', icon: FiMessageCircle },
    { id: 'students', label: 'Student Management', icon: FiUsers },
    { id: 'student-council', label: 'Student Council', icon: FiUsers }, // Add this line
    { id: 'staff', label: 'Staff & BOM Management', icon: IoPeopleCircle },
    { id: 'assignments', label: 'Assignments Manager', icon: FiBook },
    { id: 'newsevents', label: 'News & Events', icon: IoNewspaper },
    { id: 'gallery', label: 'Media Gallery', icon: FiImage },
    { id: 'subscribers', label: 'Subscriber Management', icon: FiUserPlus },
    { id: 'email', label: 'Email Campaigns', icon: FiMail },
    { id: 'admins-profile', label: 'Admins & Profile', icon: FiShield },
  ];

  // Modern Loading Component with Material UI
  if (loading) {
    return (
      <Backdrop
        open={loading}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          {/* Animated Logo */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
          >
            <span className="text-white font-bold text-2xl">K</span>
          </motion.div>

          {/* Material UI Spinner */}
          <CircularProgress 
            size={60}
            thickness={4}
            sx={{
              color: '#3B82F6',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Katwanyaa High School
            </h3>
            <p className="text-gray-600 text-lg">
              Loading Admin Portal...
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-sm"
            >
              Preparing your dashboard
            </motion.p>
          </motion.div>

          {/* Animated Dots */}
          <motion.div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </Backdrop>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        navigationItems={navigationItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiMenu className="text-xl text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                  {(() => {
                    const navItems = {
                      overview: 'Dashboard Overview',
                      'school-info': 'School Information',
                      'guidance-counseling': 'Guidance Counseling',
                      students: 'Student Management',
                      staff: 'Staff & BOM Management',
                      assignments: 'Assignments Manager',
                      newsevents: 'News & Events',
                      gallery: 'Media Gallery',
                      subscribers: 'Subscriber Management',
                      email: 'Email Campaigns',
                      'admins-profile': 'Admins & Profile'
                    };
                    return navItems[activeTab] || 'Dashboard';
                  })()}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                  Katwanyaa High School Admin Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FiBell className="text-xl text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{stats.totalStudents}</p>
                  <p className="text-gray-500">Students</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{stats.totalStaff}</p>
                  <p className="text-gray-500">Staff</p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-800 text-sm lg:text-base">{user.name}</p>
                  <p className="text-xs lg:text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}