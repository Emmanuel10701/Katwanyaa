'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiArrowRight,
  FiShare2,
  FiSearch,
  FiHeart,
  FiX,
  FiLink,
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiPlus,
  FiStar,
  FiTarget,
  FiShield,
  FiCheck,
  FiBookmark,
  FiMessageCircle
} from 'react-icons/fi';
import { 
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope
} from 'react-icons/fa';

export default function StudentCounseling() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedSessions, setLikedSessions] = useState(new Set());

  const counselingSessions = [
    {
      id: 1,
      studentName: 'John Kamau',
      studentId: 'KHS2024001',
      form: 'Form 4',
      stream: 'East',
      counselor: 'Mr. James Omondi',
      date: 'March 25, 2024',
      time: '10:00 AM - 11:00 AM',
      type: 'University Guidance',
      category: 'academic',
      status: 'completed',
      description: 'Discussed university applications and career pathways. Student showed strong interest in engineering fields and received guidance on subject requirements.',
      notes: 'Student demonstrated excellent understanding of career options. Recommended exploring engineering programs at University of Nairobi and JKUAT. Provided resources for scholarship applications and entrance exam preparation.',
      followUp: 'April 1, 2024',
      priority: 'medium',
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      featured: true,
      likes: 12
    },
    {
      id: 2,
      studentName: 'Mary Wanjiku',
      studentId: 'KHS2024002',
      form: 'Form 3',
      stream: 'West',
      counselor: 'Mrs. Sarah Mwangi',
      date: 'March 26, 2024',
      time: '2:00 PM - 3:00 PM',
      type: 'Emotional Support',
      category: 'emotional',
      status: 'scheduled',
      description: 'Managing social anxiety and building healthy friendships. Session focused on developing coping strategies and social skills.',
      notes: 'Student expressed concerns about social interactions. Introduced relaxation techniques and group activities. Discussed strategies for building confidence in social settings.',
      followUp: '',
      priority: 'high',
      image: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      featured: true,
      likes: 8
    },
    {
      id: 3,
      studentName: 'Peter Ochieng',
      studentId: 'KHS2024003',
      form: 'Form 2',
      stream: 'North',
      counselor: 'Student Council',
      date: 'March 27, 2024',
      time: '11:00 AM - 11:30 AM',
      type: 'Study Skills',
      category: 'peer',
      status: 'scheduled',
      description: 'Peer-led study group coordination and time management strategies for improved academic performance.',
      notes: 'Discussed effective study techniques and group collaboration methods. Created personalized study schedule and identified key areas for improvement.',
      followUp: '',
      priority: 'low',
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
      featured: false,
      likes: 5
    },
    {
      id: 4,
      studentName: 'Grace Achieng',
      studentId: 'KHS2024004',
      form: 'Form 1',
      stream: 'South',
      counselor: 'Mrs. Sarah Mwangi',
      date: 'March 24, 2024',
      time: '9:00 AM - 10:00 AM',
      type: 'Transition Support',
      category: 'emotional',
      status: 'completed',
      description: 'Helping student adjust to high school environment and build confidence in new academic setting.',
      notes: 'Student adapting well. Encouraged participation in extracurricular activities. Discussed time management and study habits for high school success.',
      followUp: 'April 14, 2024',
      priority: 'medium',
      image: "https://images.unsplash.com/photo-1541336032412-2048a678540d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      featured: false,
      likes: 15
    },
    {
      id: 5,
      studentName: 'David Mwiti',
      studentId: 'KHS2024005',
      form: 'Form 4',
      stream: 'East',
      counselor: 'Mr. James Omondi',
      date: 'March 28, 2024',
      time: '3:00 PM - 4:00 PM',
      type: 'Career Counseling',
      category: 'academic',
      status: 'completed',
      description: 'Exploring career options in medicine and healthcare professions.',
      notes: 'Student shows strong aptitude for sciences. Discussed medical school requirements and alternative healthcare careers.',
      followUp: 'April 5, 2024',
      priority: 'medium',
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      featured: false,
      likes: 7
    },
    {
      id: 6,
      studentName: 'Lucy Wambui',
      studentId: 'KHS2024006',
      form: 'Form 3',
      stream: 'West',
      counselor: 'Mrs. Sarah Mwangi',
      date: 'March 29, 2024',
      time: '10:30 AM - 11:30 AM',
      type: 'Stress Management',
      category: 'emotional',
      status: 'scheduled',
      description: 'Managing academic pressure and developing healthy coping mechanisms.',
      notes: 'Student experiencing exam anxiety. Introduced mindfulness techniques and study-break strategies.',
      followUp: '',
      priority: 'high',
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      featured: true,
      likes: 9
    }
  ];

  const counselors = [
    {
      id: 1,
      name: 'Mr. James Omondi',
      role: 'Guidance Teacher',
      specialization: 'Academic & Career Counseling',
      experience: '8 years',
      availability: 'Mon, Wed, Fri',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
      students: 45,
      rating: 4.9
    },
    {
      id: 2,
      name: 'Mrs. Sarah Mwangi',
      role: 'Counseling Teacher', 
      specialization: 'Emotional & Social Support',
      experience: '6 years',
      availability: 'Tue, Thu',
      image: 'https://images.unsplash.com/photo-1551836026-d5c88ac5d691?w=200&h=200&fit=crop&crop=face',
      students: 38,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Student Council',
      role: 'Peer Support',
      specialization: 'Student-led Initiatives',
      experience: 'Peer Support',
      availability: 'Daily',
      image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=200&h=200&fit=crop&crop=face',
      students: 120,
      rating: 4.7
    }
  ];

  const categories = [
    { id: 'all', name: 'All Sessions', count: counselingSessions.length, icon: FiBookOpen },
    { id: 'academic', name: 'Academic', count: counselingSessions.filter(s => s.category === 'academic').length, icon: FiTarget },
    { id: 'emotional', name: 'Emotional', count: counselingSessions.filter(s => s.category === 'emotional').length, icon: FiHeart },
    { id: 'peer', name: 'Peer Support', count: counselingSessions.filter(s => s.category === 'peer').length, icon: FiUsers }
  ];

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
      textColor: 'text-white',
      iconColor: '#1877F2',
      shareUrl: (url, title, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
      textColor: 'text-white',
      iconColor: '#1DA1F2',
      shareUrl: (url, title, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
      textColor: 'text-white',
      iconColor: '#0A66C2',
      shareUrl: (url, title, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
      textColor: 'text-white',
      iconColor: '#25D366',
      shareUrl: (url, title, text) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
      textColor: 'text-white',
      iconColor: '#EA4335',
      shareUrl: (url, title, text) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    }
  ];

  const filteredSessions = counselingSessions.filter(session => {
    const matchesTab = activeTab === 'all' || session.category === activeTab;
    const matchesSearch = session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.counselor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const StatusBadge = ({ status }) => {
    const styles = {
      scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };

    return (
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const PriorityIndicator = ({ priority }) => {
    const styles = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${styles[priority]}`} />
        <span className="text-xs text-slate-300 capitalize">{priority} priority</span>
      </div>
    );
  };

  const handleShare = (platform, session) => {
    const shareUrl = window.location.href;
    const title = `Counseling Session: ${session.studentName}`;
    const text = `${session.description}\n\nDate: ${session.date}\nTime: ${session.time}\nCounselor: ${session.counselor}`;
    
    const platformUrl = platform.shareUrl(shareUrl, title, text);
    if (platform.name === 'Email') {
      window.location.href = platformUrl;
    } else {
      window.open(platformUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = (session) => {
    const text = `${session.studentName} - Counseling Session\n${session.description}\n\nDate: ${session.date}\nTime: ${session.time}\nCounselor: ${session.counselor}\nStatus: ${session.status}\n\n${window.location.href}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openShareModal = (session) => {
    setSelectedSession(session);
    setShowShareModal(true);
  };

  const toggleLike = (sessionId, e) => {
    e.stopPropagation();
    setLikedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-purple-400/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-8"
            >
              <FiShield className="text-xl" />
              <span className="font-semibold">Student Support System</span>
            </motion.div>
            
            <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Guidance & Counseling
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Empowering students to achieve academic excellence and emotional well-being through personalized support and professional guidance
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl shadow-blue-500/25 flex items-center gap-3"
              >
                <FiPlus className="text-xl" />
                Book Counseling Session
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center gap-3"
              >
                <FiTarget className="text-xl" />
                Meet Our Team
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-7xl mx-auto px-8 mt-16"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: '24', label: 'Active Students', icon: FiUsers },
              { number: '18', label: 'Monthly Sessions', icon: FiCalendar },
              { number: '92%', label: 'Success Rate', icon: FiTrendingUp },
              { number: '3', label: 'Expert Counselors', icon: FiAward }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300"
              >
                <stat.icon className="text-2xl text-white mb-3 mx-auto" />
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Support Team */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600 mb-4"
            >
              <FiStar className="text-yellow-400" />
              <span className="text-slate-300 text-sm font-semibold">Expert Team</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Meet Your Support Champions</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our dedicated team of professionals is here to guide you through every step of your academic and personal journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {counselors.map((counselor, index) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group"
              >
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-6 border-4 border-blue-500/30 group-hover:border-blue-400 transition-all duration-500">
                    <img
                      src={counselor.image}
                      alt={counselor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{counselor.name}</h3>
                <p className="text-blue-400 font-semibold mb-3">{counselor.role}</p>
                <p className="text-slate-300 mb-6">{counselor.specialization}</p>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{counselor.students}</div>
                    <div className="text-xs text-slate-400">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{counselor.rating}</div>
                    <div className="text-xs text-slate-400">Rating</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-sm text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <FiCalendar className="text-blue-400" />
                    <span>{counselor.availability}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <FiAward className="text-yellow-400" />
                    <span>{counselor.experience} experience</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Counseling Sessions */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Active Counseling Sessions</h2>
              <p className="text-xl text-slate-300">Track and manage ongoing student support sessions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto mt-6 lg:mt-0">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students, counselors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-12 overflow-x-auto pb-2"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-6 py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${
                    activeTab === category.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Icon className="text-lg" />
                  {category.name} ({category.count})
                </button>
              );
            })}
          </motion.div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer group"
                onClick={() => setSelectedSession(session)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={session.image}
                    alt={session.studentName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {session.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      <FiStar className="inline mr-1" />
                      Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={(e) => toggleLike(session.id, e)}
                      className="bg-slate-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-slate-800 transition-colors shadow-lg"
                    >
                      <FiHeart 
                        className={`${
                          likedSessions.has(session.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-slate-300'
                        } transition-colors`} 
                      />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openShareModal(session);
                      }}
                      className="bg-slate-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-slate-800 transition-colors shadow-lg"
                    >
                      <FiShare2 className="text-slate-300" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      session.category === 'academic' ? 'bg-blue-500/20 text-blue-300' :
                      session.category === 'emotional' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {session.type}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {session.studentName}
                  </h3>
                  <p className="text-slate-300 mb-4 line-clamp-2">{session.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <FiCalendar className="text-blue-400" />
                      <span className="text-sm">{session.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <FiClock className="text-green-400" />
                      <span className="text-sm">{session.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <FiUser className="text-purple-400" />
                      <span className="text-sm">{session.counselor}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <PriorityIndicator priority={session.priority} />
                    <button className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2">
                      View Details <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700"
            >
              <FiUsers className="mx-auto text-6xl text-slate-600 mb-4" />
              <p className="text-slate-300 text-xl mb-2">No counseling sessions found</p>
              <p className="text-slate-500">Try adjusting your search criteria</p>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && !showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div className="relative h-80 flex-shrink-0">
                <img
                  src={selectedSession.image}
                  alt={selectedSession.studentName}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-sm p-3 rounded-full hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <FiX className="text-slate-300 text-xl" />
                </button>
              </div>
              
              {/* Scrollable Content */}
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
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">{selectedSession.studentName}</h2>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">{selectedSession.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <h4 className="font-semibold text-white text-xl">Session Details</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-300">
                          <FiCalendar className="text-blue-400 text-xl" />
                          <div>
                            <div className="font-medium">Date</div>
                            <div className="text-slate-400">{selectedSession.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                          <FiClock className="text-green-400 text-xl" />
                          <div>
                            <div className="font-medium">Time</div>
                            <div className="text-slate-400">{selectedSession.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                          <FiUser className="text-purple-400 text-xl" />
                          <div>
                            <div className="font-medium">Counselor</div>
                            <div className="text-slate-400">{selectedSession.counselor}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                          <FiBookOpen className="text-yellow-400 text-xl" />
                          <div>
                            <div className="font-medium">Class</div>
                            <div className="text-slate-400">{selectedSession.form} {selectedSession.stream}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="font-semibold text-white text-xl">Session Notes</h4>
                      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                        <p className="text-slate-300 leading-relaxed">{selectedSession.notes}</p>
                      </div>

                      {selectedSession.followUp && (
                        <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                          <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <FiCalendar className="text-green-400" />
                            Follow-up Scheduled
                          </h5>
                          <p className="text-green-300">Next session: {selectedSession.followUp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-6 border-t border-slate-700">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openShareModal(selectedSession)}
                      className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-lg"
                    >
                      <FiShare2 className="text-xl" />
                      Share Session
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Share Session</h3>
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
                <p className="text-slate-300 mt-2">Share counseling session details</p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={selectedSession.image}
                      alt={selectedSession.studentName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{selectedSession.studentName}</h4>
                    <p className="text-slate-400 text-sm truncate">{selectedSession.type}</p>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <motion.button
                        key={platform.name}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShare(platform, selectedSession)}
                        className={`${platform.color} ${platform.textColor} p-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3`}
                      >
                        <Icon style={{ color: platform.iconColor }} className="text-xl" />
                        <span>{platform.name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Copy Link Section */}
                <div className="space-y-3">
                  <label className="text-slate-300 text-sm font-medium">Or copy direct link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-300 text-sm truncate">
                      {typeof window !== 'undefined' ? window.location.href : ''}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(selectedSession)}
                      className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-4 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="text-green-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiLink />
                          <span>Copy</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700 bg-slate-700/20">
                <p className="text-slate-400 text-sm text-center">
                  Share this session with other staff members or parents
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}