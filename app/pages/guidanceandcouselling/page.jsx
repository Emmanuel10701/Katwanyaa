'use client';
import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiArrowRight,
  FiSearch,
  FiBookOpen,
  FiTarget,
  FiUsers,
  FiAward,
  FiStar,
  FiShield,
  FiMusic,
  FiPray,
  FiHeart,
  FiAlertTriangle,
  FiPhone,
  FiMail,
  FiPhoneCall,
  FiMapPin
} from 'react-icons/fi';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <CircularProgress style={{ color: '#3b82f6' }} />
  </div>
);


import worship from "../../../images/worship.jpg";

// Category icon mapping
const getCategoryIcon = (category) => {
  const icons = {
    academic: FiTarget,
    emotional: FiHeart,
    peer: FiUsers,
    drugs: FiAlertTriangle,
    health: FiUsers,
    relationship: FiUsers,
    worship: FiMusic,
    devotion: FiPray,
    support: FiPhoneCall,
    default: FiBookOpen
  };
  return icons[category] || icons.default;
};

export default function StudentCounseling() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [counselingSessions, setCounselingSessions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Support team data (static)
  const supportTeam = [
    {
      id: 1,
      name: 'School Matron',
      role: '24/7 Student Support',
      specialization: 'Health & Wellness Support',
      availability: '24/7 Emergency Support',
      contact: 'Emergency Hotline',
      description: 'Available round the clock for all student health and wellness concerns',
      priority: 'high'
    },
    {
      id: 2,
      name: 'School Patron',
      role: '24/7 Guidance',
      specialization: 'Academic & Personal Guidance',
      availability: '24/7 On-call',
      contact: 'Guidance Hotline',
      description: 'Always available for academic guidance and personal development support',
      priority: 'high'
    },
    {
      id: 3,
      name: 'Ms. Nzyko',
      role: 'Guidance Counselor',
      specialization: 'Personal Counseling & Career Guidance',
      availability: 'Mon-Fri, 8:00 AM - 4:00 PM',
      contact: 'Guidance Office',
      description: 'Professional counseling services for personal growth and career development',
      priority: 'medium'
    }
  ];

  // Fetch counseling sessions from API
  const fetchCounselingSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/guidance');
      const result = await response.json();
      
      if (result.success) {
        const apiSessions = result.events || [];
        const allSessions = [...getDefaultSessions(), ...apiSessions];
        setCounselingSessions(allSessions);
        
        // Generate categories dynamically from sessions
        const uniqueCategories = generateCategories(allSessions);
        setCategories(uniqueCategories);
      } else {
        throw new Error(result.error || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      const allSessions = getAllSessions();
      setCounselingSessions(allSessions);
      setCategories(generateCategories(allSessions));
    } finally {
      setLoading(false);
    }
  };

  // Generate categories dynamically from sessions
  const generateCategories = (sessions) => {
    const categorySet = new Set();
    
    // Always include 'all' category
    const categories = [{ id: 'all', name: 'All Sessions', icon: FiBookOpen }];
    
    sessions.forEach(session => {
      if (session.category && !categorySet.has(session.category)) {
        categorySet.add(session.category);
        const IconComponent = getCategoryIcon(session.category);
        categories.push({
          id: session.category,
          name: getCategoryDisplayName(session.category),
          icon: IconComponent
        });
      }
    });
    
    return categories;
  };

  // Get display name for category
  const getCategoryDisplayName = (category) => {
    const names = {
      academic: 'Academic',
      emotional: 'Emotional',
      peer: 'Peer Support',
      drugs: 'Drugs Awareness',
      health: 'Health',
      relationship: 'Relationship',
      worship: 'Worship',
      devotion: 'Devotion',
      support: '24/7 Support'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get all default sessions including support
  const getAllSessions = () => {
    return [...getDefaultSessions(), ...getSupportSessions()];
  };

  // Get default counseling sessions
  const getDefaultSessions = () => [
    {
      id: 1,
      title: 'Thursday Devotion Session',
      counselor: 'School Chaplain',
      date: getNextThursday(),
      time: '10:00 AM - 11:00 AM',
      type: 'Spiritual Session',
      category: 'devotion',
      status: 'scheduled',
      description: 'Weekly devotion session to strengthen students in religious study and worship God in AIC Katwanyaa Church. Strengthen your faith and build spiritual resilience.',
      notes: 'Focus on spiritual growth and moral development. Bring your Bible and notebook.',
      priority: 'high',
      image: worship,
      featured: true,
      location: 'School Chapel'
    },
    {
      id: 2,
      title: 'Sunday Youth Worship',
      counselor: 'Youth Leaders & CU',
      date: getNextSunday(),
      time: '2:00 PM - 4:00 PM',
      type: 'Youth Worship',
      category: 'worship',
      status: 'scheduled',
      description: 'Youth worship session with CU and YCS active worship groups for everybody to worship. Experience powerful praise and worship with fellow students.',
      notes: 'Music, praise, and fellowship. All students welcome.',
      priority: 'high',
      image: worship,
      featured: true,
      location: 'AIC Katwanyaa Church'
    },
    {
      id: 3,
      title: 'University Guidance Session',
      counselor: 'Mr. James Omondi',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:00 AM - 11:00 AM',
      type: 'Career Counseling',
      category: 'academic',
      status: 'scheduled',
      description: 'Comprehensive university applications and career pathways discussion. Get guidance on course selection and scholarship opportunities.',
      priority: 'medium',
      image: worship,
      featured: false,
      location: 'Guidance Office'
    },
    {
      id: 4,
      title: 'Drug Awareness Program',
      counselor: 'Health Department',
      date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      time: '2:00 PM - 3:30 PM',
      type: 'Awareness Workshop',
      category: 'drugs',
      status: 'scheduled',
      description: 'Drug abuse awareness and prevention program. Learn about the dangers of substance abuse and healthy alternatives.',
      priority: 'high',
      image: "https://images.unsplash.com/photo-1551376347-075b0121a65b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      featured: true,
      location: 'School Hall'
    }
  ];

  // Get 24/7 support sessions
  const getSupportSessions = () => [
    {
      id: 'support-1',
      title: '24/7 Matron Support',
      counselor: 'School Matron',
      date: 'Always Available',
      time: '24/7',
      type: 'Emergency Support',
      category: 'support',
      status: 'active',
      description: 'Round-the-clock health and wellness support. Immediate assistance for any health concerns or emergencies.',
      notes: 'Available anytime for medical emergencies, health consultations, and wellness support.',
      priority: 'high',
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      featured: true,
      isSupport: true,
      contact: 'Emergency Hotline'
    },
    {
      id: 'support-2',
      title: '24/7 Patron Guidance',
      counselor: 'School Patron',
      date: 'Always Available',
      time: '24/7',
      type: 'Guidance Support',
      category: 'support',
      status: 'active',
      description: 'Always available for academic guidance, personal development, and emergency counseling.',
      notes: 'On-call support for academic guidance and personal development issues.',
      priority: 'high',
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      featured: true,
      isSupport: true,
      contact: 'Guidance Hotline'
    },
    {
      id: 'support-3',
      title: 'Personal Guidance - Ms. Nzyko',
      counselor: 'Ms. Nzyko',
      date: 'Monday - Friday',
      time: '8:00 AM - 4:00 PM',
      type: 'Professional Counseling',
      category: 'support',
      status: 'active',
      description: 'Professional counseling services for personal growth, career guidance, and emotional support.',
      notes: 'Schedule appointments for personalized counseling sessions.',
      priority: 'medium',
      image: "https://images.unsplash.com/photo-1551836026-d5c88ac5d691?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      featured: true,
      isSupport: true,
      contact: 'Guidance Office'
    }
  ];

  // Helper functions to get next Thursday and Sunday
  function getNextThursday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    return nextThursday.toISOString().split('T')[0];
  }

  function getNextSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = (0 - dayOfWeek + 7) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday.toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchCounselingSessions();
  }, []);

  // Filter sessions based on active tab and search term
  const filteredSessions = counselingSessions.filter(session => {
    const matchesTab = activeTab === 'all' || session.category === activeTab;
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.counselor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const styles = {
      scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      ongoing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };

    return (
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.scheduled}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Scheduled'}
      </div>
    );
  };

  // Priority Indicator Component
  const PriorityIndicator = ({ priority }) => {
    const styles = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${styles[priority] || styles.medium}`} />
        <span className="text-xs text-slate-300 capitalize">{priority || 'medium'} priority</span>
      </div>
    );
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      academic: 'bg-blue-500/20 text-blue-300',
      emotional: 'bg-purple-500/20 text-purple-300',
      devotion: 'bg-purple-500/20 text-purple-300',
      worship: 'bg-purple-500/20 text-purple-300',
      support: 'bg-green-500/20 text-green-300',
      drugs: 'bg-red-500/20 text-red-300',
      health: 'bg-green-500/20 text-green-300',
      relationship: 'bg-pink-500/20 text-pink-300',
      peer: 'bg-indigo-500/20 text-indigo-300'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4 text-lg">Loading Guidance & Counseling Sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-8">
              <FiShield className="text-xl" />
              <span className="font-semibold">Complete Student Support System</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Guidance & Counseling
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Comprehensive support for academic excellence, emotional well-being, spiritual growth, and 24/7 guidance
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto mt-12">
              {[
                { number: counselingSessions.length, label: 'Active Sessions', icon: FiCalendar },
                { number: '24/7', label: 'Support Available', icon: FiPhoneCall },
                { number: '100%', label: 'Confidential', icon: FiShield },
                { number: categories.length - 1, label: 'Categories', icon: FiUsers }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center hover:bg-white/15 transition-all duration-300">
                  <stat.icon className="text-2xl text-white mb-2 mx-auto" />
                  <div className="text-xl lg:text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* 24/7 Support Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600 mb-4">
              <FiPhoneCall className="text-green-400" />
              <span className="text-slate-300 text-sm font-semibold">24/7 Support</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Always Here For You</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Round-the-clock support from our dedicated team. Never hesitate to reach out.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {supportTeam.map((member) => (
              <div
                key={member.id}
                className="bg-slate-800 rounded-2xl border border-slate-700 p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 border-4 border-blue-500/30 group-hover:border-blue-400 transition-all duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <FiUser className="text-white text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-blue-400 font-semibold mb-3">{member.role}</p>
                  <p className="text-slate-300 mb-6">{member.specialization}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <FiClock className="text-green-400" />
                    <span className="text-sm">{member.availability}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <FiPhone className="text-blue-400" />
                    <span className="text-sm">{member.contact}</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <p className="text-slate-300 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Counseling Sessions Section */}
        <section className="mb-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Available Sessions</h2>
              <p className="text-xl text-slate-300">Browse all available guidance and counseling sessions</p>
            </div>
            <div className="relative mt-6 lg:mt-0">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search sessions, counselors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
          </div>

          {/* Dynamic Category Tabs */}
          {categories.length > 0 && (
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${
                      activeTab === category.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedSession(session)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={session.image}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1541336032412-2048a678540d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80";
                    }}
                  />
                  {session.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      <FiStar className="inline mr-1" />
                      Featured
                    </div>
                  )}
                  {session.isSupport && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      <FiPhoneCall className="inline mr-1" />
                      24/7 Support
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(session.category)}`}>
                      {session.type}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-slate-300 mb-4 line-clamp-2">{session.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <FiCalendar className="text-blue-400" />
                      <span className="text-sm">
                        {session.date === 'Always Available' || session.date === 'Monday - Friday' 
                          ? session.date 
                          : session.date 
                            ? new Date(session.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) 
                            : 'Date not set'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <FiClock className="text-green-400" />
                      <span className="text-sm">{session.time || 'Time not set'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <FiUser className="text-purple-400" />
                      <span className="text-sm">{session.counselor || 'Counselor not specified'}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-3 text-slate-400">
                        <FiMapPin className="text-red-400" />
                        <span className="text-sm">{session.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <PriorityIndicator priority={session.priority} />
                    <button className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2">
                      View Details <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
              <FiUsers className="mx-auto text-6xl text-slate-600 mb-4" />
              <p className="text-slate-300 text-xl mb-2">No sessions found</p>
              <p className="text-slate-500">Try adjusting your search criteria or check back later</p>
            </div>
          )}
        </section>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="relative h-80 flex-shrink-0">
              <img
                src={selectedSession.image}
                alt={selectedSession.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1541336032412-2048a678540d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80";
                }}
              />
              <button 
                onClick={() => setSelectedSession(null)}
                className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-sm p-3 rounded-full hover:bg-slate-800 transition-colors shadow-lg"
              >
                <FiArrowRight className="text-slate-300 text-xl rotate-180" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <StatusBadge status={selectedSession.status} />
                  <PriorityIndicator priority={selectedSession.priority} />
                  {selectedSession.featured && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <FiStar className="inline mr-1" />
                      Featured Session
                    </span>
                  )}
                  {selectedSession.isSupport && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <FiPhoneCall className="inline mr-1" />
                      24/7 Support Available
                    </span>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">{selectedSession.title}</h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">{selectedSession.description}</p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-white text-xl">Session Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-slate-300">
                        <FiCalendar className="text-blue-400 text-xl" />
                        <div>
                          <div className="font-medium">Date</div>
                          <div className="text-slate-400">
                            {selectedSession.date === 'Always Available' || selectedSession.date === 'Monday - Friday' 
                              ? selectedSession.date 
                              : selectedSession.date 
                                ? new Date(selectedSession.date).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) 
                                : 'Date not set'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-slate-300">
                        <FiClock className="text-green-400 text-xl" />
                        <div>
                          <div className="font-medium">Time</div>
                          <div className="text-slate-400">{selectedSession.time || 'Time not set'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-slate-300">
                        <FiUser className="text-purple-400 text-xl" />
                        <div>
                          <div className="font-medium">Counselor</div>
                          <div className="text-slate-400">{selectedSession.counselor || 'Not specified'}</div>
                        </div>
                      </div>
                      {selectedSession.location && (
                        <div className="flex items-center gap-4 text-slate-300">
                          <FiMapPin className="text-red-400 text-xl" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-slate-400">{selectedSession.location}</div>
                          </div>
                        </div>
                      )}
                      {selectedSession.contact && (
                        <div className="flex items-center gap-4 text-slate-300">
                          <FiPhone className="text-green-400 text-xl" />
                          <div>
                            <div className="font-medium">Contact</div>
                            <div className="text-slate-400">{selectedSession.contact}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="font-semibold text-white text-xl">Session Information</h4>
                    <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                      <p className="text-slate-300 leading-relaxed mb-4">
                        This is a <strong>{selectedSession.type}</strong> session focused on <strong>{getCategoryDisplayName(selectedSession.category)}</strong>.
                        {selectedSession.category === 'devotion' && ' Join us for spiritual growth and worship in our weekly devotion sessions.'}
                        {selectedSession.category === 'worship' && ' Experience meaningful worship with fellow students in our youth worship services.'}
                        {selectedSession.category === 'support' && ' This support service is available to help you with any concerns or challenges you may be facing.'}
                      </p>
                      {selectedSession.notes && (
                        <div className="mt-4 p-4 bg-slate-600/50 rounded-lg border border-slate-500">
                          <p className="text-slate-300 text-sm leading-relaxed">
                            <strong>Additional Notes:</strong> {selectedSession.notes}
                          </p>
                        </div>
                      )}
                    </div>
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