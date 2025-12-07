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
  FiUser,
  FiMail,
  FiUserPlus,
  FiImage,
  FiShield,
  FiMessageCircle,
  FiInfo,
  FiTrendingUp,
  FiAward,
  FiClipboard // Added for applications
} from 'react-icons/fi';
import { 
  IoStatsChart,
  IoPeopleCircle,
  IoNewspaper,
  IoSparkles
} from 'react-icons/io5';

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
import GuidanceCounselingTab from '../components/guidance/page';
import SchoolInfoTab from '../components/schoolinfo/page';
import ApplicationsManager from '../components/applications/page'; // You'll need to create this component

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalSubscribers: 0,
    studentCouncil: 0,
    upcomingEvents: 0,
    totalNews: 0,
    activeAssignments: 0,
    galleryItems: 0,
    guidanceSessions: 0,
    totalApplications: 0, // Added applications count
    pendingApplications: 0 // Added pending applications count
  });

  // Fetch real counts from all APIs
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
        guidanceRes,
        admissionsRes // Added admissions API
      ] = await Promise.allSettled([
        fetch('/api/student'),
        fetch('/api/staff'),
        fetch('/api/subscriber'),
        fetch('/api/studentCouncil'),
        fetch('/api/events'),
        fetch('/api/news'),
        fetch('/api/assignment'),
        fetch('/api/gallery'),
        fetch('/api/guidance'),
        fetch('/api/admissions/applications') // Added
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
      const admissions = admissionsRes.status === 'fulfilled' ? await admissionsRes.value.json() : { applications: [] };

      // Calculate real counts
      const activeStudents = students.students?.filter(s => s.status === 'Active').length || 0;
      const activeCouncil = council.councilMembers?.filter(c => c.status === 'Active').length || 0;
      const upcomingEvents = events.events?.filter(e => new Date(e.date) > new Date()).length || 0;
      const activeAssignments = assignments.assignments?.filter(a => a.status === 'assigned').length || 0;
      
      // Admission statistics
      const admissionsData = admissions.applications || [];
      const pendingApps = admissionsData.filter(app => app.status === 'PENDING').length || 0;
      const acceptedApps = admissionsData.filter(app => app.status === 'ACCEPTED').length || 0;
      const rejectedApps = admissionsData.filter(app => app.status === 'REJECTED').length || 0;

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
        guidanceSessions: guidance.events?.length || 0,
        totalApplications: admissionsData.length || 0,
        pendingApplications: pendingApps,
        acceptedApplications: acceptedApps,
        rejectedApplications: rejectedApps
      });

    } catch (error) {
      console.error('Error fetching real counts:', error);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      
      try {
        console.log('🔍 Checking localStorage for user data...');
        
        // Check ALL possible localStorage keys for user data
        const possibleUserKeys = ['admin_user', 'user', 'currentUser', 'auth_user'];
        const possibleTokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token'];
        
        let userData = null;
        let token = null;
        
        // Find user data in any possible key
        for (const key of possibleUserKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            console.log(`✅ Found user data in key: ${key}`, data);
            userData = data;
            break;
          }
        }
        
        // Find token in any possible key
        for (const key of possibleTokenKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            console.log(`✅ Found token in key: ${key}`);
            token = data;
            break;
          }
        }
        
        if (!userData) {
          console.log('❌ No user data found in localStorage');
          window.location.href = '/pages/adminLogin';
          return;
        }

        // Parse user data
        const user = JSON.parse(userData);
        console.log('📋 Parsed user data:', user);
        
        // Verify token is still valid (if available)
        if (token) {
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenPayload.exp < currentTime) {
              console.log('❌ Token expired');
              // Clear all auth data
              possibleUserKeys.forEach(key => localStorage.removeItem(key));
              possibleTokenKeys.forEach(key => localStorage.removeItem(key));
              window.location.href = '/pages/adminLogin';
              return;
            }
            console.log('✅ Token is valid');
          } catch (tokenError) {
            console.log('⚠️ Token validation skipped:', tokenError.message);
          }
        }

        // Check if user has valid role
        const userRole = user.role;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'TEACHER', 'PRINCIPAL'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          console.log('❌ User does not have valid role:', userRole);
          window.location.href = '/pages/adminLogin';
          return;
        }

        console.log('✅ User authenticated successfully:', user.name);
        setUser(user);

        // Fetch real counts from APIs
        await fetchRealCounts();
        
      } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        // Clear all auth data on error
        localStorage.clear();
        window.location.href = '/pages/adminLogin';
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Refresh counts when tab changes
  useEffect(() => {
    if (!loading) {
      fetchRealCounts();
    }
  }, [activeTab]);

  const handleLogout = () => {
    // Clear ALL possible auth data
    const possibleUserKeys = ['admin_user', 'user', 'currentUser', 'auth_user'];
    const possibleTokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token'];
    
    possibleUserKeys.forEach(key => localStorage.removeItem(key));
    possibleTokenKeys.forEach(key => localStorage.removeItem(key));
    
    window.location.href = '/pages/adminLogin';
  };

  const renderContent = () => {
    if (loading) return null;

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'school-info':
        return <SchoolInfoTab />;
      case 'guidance-counseling':
        return <GuidanceCounselingTab />;
      case 'students':
        return <StudentManager />;
      case 'student-council':
        return <StudentCouncil />;
      case 'staff':
        return <StaffManager />;
      case 'assignments':
        return <AssignmentsManager />;
      case 'admissions': // Added case for admissions
        return <ApplicationsManager />;
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
        return <DashboardOverview />;
    }
  };

  // Modern navigation items with real counts including admissions
  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: FiHome,
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
      label: 'Staff & BOM', 
      icon: IoPeopleCircle,
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
      id: 'admissions', // Changed from 'applications' to 'admissions' to match sidebar
      label: 'Admission Applications', 
      icon: FiClipboard,
      count: realStats.totalApplications,
      badge: 'purple',
      showPending: realStats.pendingApplications > 0,
      pendingCount: realStats.pendingApplications
    },
    { 
      id: 'newsevents', 
      label: 'News & Events', 
      icon: IoNewspaper,
      count: realStats.upcomingEvents + realStats.totalNews,
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
      icon: FiUserPlus,
      count: realStats.totalSubscribers,
      badge: 'teal'
    },
    { 
      id: 'email', 
      label: 'Email Campaigns', 
      icon: FiMail,
      count: null,
      badge: 'indigo'
    },
    { 
      id: 'admins-profile', 
      label: 'Admins & Profile', 
      icon: FiShield,
      count: null,
      badge: 'gray'
    },
  ];

  // Modern header stats component
  const HeaderStat = ({ icon: Icon, value, label, color = 'blue', trend = 'up' }) => (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <div className={`p-2 rounded-lg bg-${color}-100`}>
        <Icon className={`text-lg text-${color}-600`} />
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">{value?.toLocaleString() || '0'}</p>
        <p className="text-xs text-gray-500 capitalize">{label}</p>
      </div>
      {trend && (
        <div className={`p-1 rounded ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
          {trend === 'up' ? (
            <FiTrendingUp className="text-green-600 text-sm" />
          ) : (
            <FiTrendingUp className="text-red-600 text-sm transform rotate-180" />
          )}
        </div>
      )}
    </motion.div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-purple-50 items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <IoSparkles className="text-3xl text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Katwanyaa High School
          </motion.h1>
          <p className="text-gray-600 text-lg">Initializing Admin Portal...</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-4 mx-auto"
          />
        </div>
      </div>
    );
  }

  // If no user but loading is false, it means we're redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
      {/* Sidebar - Now properly passes the navigation items */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tabs={navigationItems} // Pass the updated navigation items
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Modern Top Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 group"
              >
                <FiMenu className="text-xl text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
              
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="hidden lg:flex w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center shadow-lg"
                >
                  <FiAward className="text-xl text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                  >
                    {(() => {
                      const navItems = {
                        overview: 'Dashboard Overview',
                        'school-info': 'School Information',
                        'guidance-counseling': 'Guidance Counseling',
                        students: 'Student Management',
                        staff: 'Staff & BOM Management',
                        assignments: 'Assignments Manager',
                        admissions: 'Admission Applications', // Added
                        newsevents: 'News & Events',
                        gallery: 'Media Gallery',
                        subscribers: 'Subscriber Management',
                        email: 'Email Campaigns',
                        'admins-profile': 'Admins & Profile'
                      };
                      return navItems[activeTab] || 'Dashboard';
                    })()}
                  </motion.h1>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Katwanyaa High School • Excellence in Education
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Modern Quick Stats - Updated with Applications */}
              <div className="hidden xl:flex items-center gap-3">
                <HeaderStat 
                  icon={FiUsers} 
                  value={realStats.totalStudents} 
                  label="Students" 
                  color="blue"
                  trend="up"
                />
                <HeaderStat 
                  icon={IoPeopleCircle} 
                  value={realStats.totalStaff} 
                  label="Staff" 
                  color="green"
                  trend="up"
                />
                <HeaderStat 
                  icon={FiClipboard} 
                  value={realStats.totalApplications} 
                  label="Applications" 
                  color="purple"
                  trend="up"
                />
                <HeaderStat 
                  icon={FiUserPlus} 
                  value={realStats.studentCouncil} 
                  label="Council" 
                  color="orange"
                  trend="up"
                />
              </div>

              {/* Modern User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="font-semibold text-gray-800 text-sm lg:text-base">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                    <IoSparkles className="text-yellow-500 text-xs" />
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  
                  {/* Logout dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 font-semibold"
                    >
                      <FiLogOut className="text-lg" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}