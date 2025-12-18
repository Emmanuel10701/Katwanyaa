'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  FiBook, 
  FiCalendar, 
  FiFileText, 
  FiCheckCircle,
  FiClock,
  FiAward,
  FiUsers,
  FiHome,
  FiMail,
  FiPhone,
  FiDownload,
  FiStar,
  FiHelpCircle,
  FiChevronDown,
  FiBarChart2,
  FiTarget,
  FiBookOpen,
  FiCpu,
  FiActivity,
  FiZap,
  FiTrendingUp,
  FiLayers,
  FiPlus,
  FiX,
  FiFilter,
  FiSearch,
  FiRotateCw,
  FiEye,
  FiGrid,
  FiFolder,
  FiList,
  FiSettings,
  FiGlobe,
  FiPlay,
  FiPieChart,
  FiTool,
  FiSmartphone,
  FiCode,
  FiShield,
  FiHeart,
  FiTarget as FiTargetIcon
} from 'react-icons/fi';
import { 
  IoSchoolOutline,
  IoDocumentsOutline,
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoLibraryOutline,
  IoStatsChartOutline,
  IoRocketOutline,
  IoEarthOutline,
  IoCalculatorOutline,
  IoSparkles,
  IoAccessibilityOutline,
  IoBuildOutline,
  IoAnalyticsOutline,
  IoBulbOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { useRouter } from 'next/navigation';

// Modern Modal Component
const ModernModal = ({ children, open, onClose, maxWidth = '700px' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
        style={{ 
          width: '85%',
          maxWidth: maxWidth,
          maxHeight: '85vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Program Card Component
const ProgramCard = ({ program, onLearnMore, index }) => {
  const ProgramIcon = program.icon;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md">
      {/* Content */}
      <div className="p-5">
        {/* Title and Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${program.color} bg-opacity-10`}>
            <ProgramIcon className={`text-xl ${program.color.split('from-')[1].split('to-')[0].replace('-500', '-600')}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{program.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <FiClock className="text-gray-400" />
              <span>{program.duration}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {program.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-5">
          {program.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
              <FiCheckCircle className="text-green-500 flex-shrink-0" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>

        {/* Info and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              program.type === 'CBC' ? 'bg-blue-100 text-blue-800' :
              program.type === '8-4-4' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {program.type}
            </div>
            <div className="text-xs text-gray-500">
              {program.students} students
            </div>
          </div>
          <button
            onClick={onLearnMore}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ feature, onLearnMore }) => {
  const FeatureIcon = feature.icon;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Icon Header */}
      <div className={`p-5 bg-gradient-to-r ${feature.color} bg-opacity-10`}>
        <div className="flex items-center justify-between">
          <div className="p-3 bg-white rounded-xl shadow-xs">
            <FeatureIcon className={`text-2xl ${feature.color.split('from-')[1].split('to-')[0].replace('-500', '-600')}`} />
          </div>
          <span className="text-xs font-medium px-3 py-1 bg-white/80 rounded-full text-gray-700">
            {feature.badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-3">{feature.title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {feature.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-bold text-gray-900">{feature.stats.students}</div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-bold text-gray-900">{feature.stats.success}</div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onLearnMore}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Explore Feature
        </button>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ stat }) => {
  const StatIcon = stat.icon;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 p-5 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
          <p className="text-lg font-bold text-gray-900">{stat.number}</p>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-10`}>
          <StatIcon className={`text-lg ${stat.color.split('from-')[1].split('to-')[0].replace('-500', '-600')}`} />
        </div>
      </div>
      <p className="text-xs text-gray-500">{stat.sublabel}</p>
    </div>
  );
};

// Subject Card Component
const SubjectCard = ({ subject, index }) => {
  const SubjectIcon = subject.icon;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 p-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-gradient-to-r ${subject.color} rounded-lg`}>
          <SubjectIcon className="text-white text-lg" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{subject.name}</h4>
          <p className="text-gray-500 text-xs">{subject.category}</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm">{subject.description}</p>
      <div className="flex items-center gap-2 mt-3">
        <span className={`text-xs px-2 py-1 rounded ${
          subject.type === 'Core' ? 'bg-blue-100 text-blue-800' :
          subject.type === 'Elective' ? 'bg-purple-100 text-purple-800' :
          'bg-green-100 text-green-800'
        }`}>
          {subject.type}
        </span>
        <span className="text-xs text-gray-500">{subject.grades}</span>
      </div>
    </div>
  );
};

// Curriculum Card Component
const CurriculumCard = ({ curriculum, icon: Icon, color }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className="text-2xl text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{curriculum.name}</h3>
          <p className="text-gray-500 text-sm">{curriculum.description}</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {curriculum.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <IoCheckmarkCircleOutline className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-700 text-sm">{feature.title}</p>
              <p className="text-gray-500 text-xs">{feature.details}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Grades</p>
            <p className="font-bold text-gray-900">{curriculum.grades}</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({ faq, index, openFaq, setOpenFaq }) => {
  const isOpen = openFaq === index;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden transition-all duration-300 hover:shadow-sm">
      <button
        onClick={() => setOpenFaq(isOpen ? null : index)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 pr-4 text-sm md:text-base">{faq.question}</h3>
        <FiChevronDown 
          className={`text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

export default function AcademicPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  // Data for the page
  const academicStats = [
    { 
      icon: IoPeopleOutline, 
      number: '98%', 
      label: 'Pass Rate', 
      sublabel: 'KCSE 2023',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      icon: FiTrendingUp, 
      number: 'A-', 
      label: 'Mean Grade', 
      sublabel: '2023 Performance',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: IoSparkles, 
      number: '500+', 
      label: 'University', 
      sublabel: 'Placements',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: FiAward, 
      number: '150+', 
      label: 'Awards', 
      sublabel: 'National Level',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const academicPrograms = [
    {
      title: 'CBC Junior Secondary',
      icon: FiBookOpen,
      description: 'Grades 7-9 focusing on competency-based education and practical skills',
      features: ['Digital Literacy', 'Practical Skills', 'Project-Based Learning', 'Talent Development'],
      duration: '3 Years',
      type: 'CBC',
      students: '350+',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Senior Secondary (8-4-4)',
      icon: IoSchoolOutline,
      description: 'Forms 1-4 with comprehensive curriculum for KCSE excellence',
      features: ['Science & Arts Streams', 'KCSE Preparation', 'Career Guidance', 'Exam Excellence'],
      duration: '4 Years',
      type: '8-4-4',
      students: '500+',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'STEM Program',
      icon: FiCpu,
      description: 'Advanced Science, Technology, Engineering and Mathematics focus',
      features: ['Robotics Club', 'Coding Classes', 'Science Labs', 'Math Olympiad'],
      duration: '4 Years',
      type: 'Special',
      students: '200+',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const academicFeatures = [
    {
      icon: IoRocketOutline,
      title: 'Modern Laboratories',
      description: 'State-of-the-art science and computer labs for practical learning',
      features: ['Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Computer Lab'],
      badge: 'Advanced',
      color: 'from-blue-500 to-cyan-500',
      stats: { students: '100%', success: '95%' }
    },
    {
      icon: IoLibraryOutline,
      title: 'Digital Library',
      description: 'Comprehensive library with digital resources and study spaces',
      features: ['E-Books', 'Research Databases', 'Study Rooms', 'Online Journals'],
      badge: 'Digital',
      color: 'from-purple-500 to-pink-500',
      stats: { students: '500+', success: '98%' }
    },
    {
      icon: IoBuildOutline,
      title: 'Skill Development',
      description: 'Practical skills and vocational training programs',
      features: ['Entrepreneurship', 'Technical Skills', 'Leadership', 'Community Service'],
      badge: 'Practical',
      color: 'from-green-500 to-emerald-500',
      stats: { students: '300+', success: '90%' }
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBook },
    { id: 'curriculum', label: 'Curriculum', icon: FiLayers },
    { id: 'programs', label: 'Programs', icon: FiFolder },
    { id: 'subjects', label: 'Subjects', icon: FiList },
    { id: 'facilities', label: 'Facilities', icon: FiSettings },
    { id: 'faq', label: 'FAQ', icon: FiHelpCircle },
  ];

  // Subjects Data
  const subjectsData = {
    core: [
      { 
        name: 'Mathematics', 
        icon: IoCalculatorOutline, 
        category: 'Science & Technology',
        description: 'Advanced mathematics including calculus, algebra, and statistics',
        type: 'Core',
        grades: 'All Grades',
        color: 'from-blue-500 to-cyan-500'
      },
      { 
        name: 'English', 
        icon: FiBook, 
        category: 'Languages',
        description: 'Language skills, literature, and communication studies',
        type: 'Core',
        grades: 'All Grades',
        color: 'from-purple-500 to-pink-500'
      },
      { 
        name: 'Kiswahili', 
        icon: FiGlobe, 
        category: 'Languages',
        description: 'National language, literature, and cultural studies',
        type: 'Core',
        grades: 'All Grades',
        color: 'from-green-500 to-emerald-500'
      },
      { 
        name: 'Physics', 
        icon: FiZap, 
        category: 'Sciences',
        description: 'Physical sciences, experiments, and practical applications',
        type: 'Core',
        grades: 'Forms 3-4',
        color: 'from-orange-500 to-red-500'
      },
      { 
        name: 'Chemistry', 
        icon: FiActivity, 
        category: 'Sciences',
        description: 'Chemical sciences, laboratory work, and applications',
        type: 'Core',
        grades: 'Forms 3-4',
        color: 'from-yellow-500 to-amber-500'
      },
      { 
        name: 'Biology', 
        icon: FiHeart, 
        category: 'Sciences',
        description: 'Biological sciences, anatomy, and environmental studies',
        type: 'Core',
        grades: 'Forms 3-4',
        color: 'from-teal-500 to-emerald-500'
      }
    ],
    elective: [
      { 
        name: 'Computer Studies', 
        icon: FiCpu, 
        category: 'Technology',
        description: 'Programming, hardware, and digital literacy',
        type: 'Elective',
        grades: 'Forms 1-4',
        color: 'from-blue-500 to-indigo-500'
      },
      { 
        name: 'Business Studies', 
        icon: FiBarChart2, 
        category: 'Commerce',
        description: 'Entrepreneurship, accounting, and business management',
        type: 'Elective',
        grades: 'Forms 1-4',
        color: 'from-green-500 to-teal-500'
      },
      { 
        name: 'Geography', 
        icon: FiGlobe, 
        category: 'Humanities',
        description: 'Physical and human geography with fieldwork',
        type: 'Elective',
        grades: 'Forms 1-4',
        color: 'from-purple-500 to-pink-500'
      },
      { 
        name: 'History & Government', 
        icon: FiBook, 
        category: 'Humanities',
        description: 'Historical studies and government systems',
        type: 'Elective',
        grades: 'Forms 1-4',
        color: 'from-orange-500 to-red-500'
      },
      { 
        name: 'CRE/IRE', 
        icon: FiHeart, 
        category: 'Religion',
        description: 'Religious education and moral studies',
        type: 'Elective',
        grades: 'Forms 1-4',
        color: 'from-yellow-500 to-amber-500'
      },
      { 
        name: 'Home Science', 
        icon: FiHome, 
        category: 'Practical',
        description: 'Life skills, nutrition, and home management',
        type: 'Elective',
        grades: 'Forms 1-4',
        color: 'from-pink-500 to-rose-500'
      }
    ]
  };

  // Curriculum Structure Data
  const curriculumStructure = [
    {
      name: 'CBC System',
      description: 'Competency Based Curriculum for Junior Secondary',
      features: [
        { title: 'Competency Focus', details: '7 Core Competencies Development' },
        { title: 'Practical Learning', details: 'Project-Based and Hands-on' },
        { title: 'Digital Integration', details: 'Technology in Learning' },
        { title: 'Continuous Assessment', details: 'Regular Progress Evaluation' }
      ],
      grades: 'Grades 7-9'
    },
    {
      name: '8-4-4 System',
      description: 'Traditional curriculum for Senior Secondary',
      features: [
        { title: 'Subject Specialization', details: 'Science & Arts Streams' },
        { title: 'Exam Preparation', details: 'KCSE Focus' },
        { title: 'Career Guidance', details: 'University Pathways' },
        { title: 'Comprehensive Subjects', details: 'Core & Elective Options' }
      ],
      grades: 'Forms 1-4'
    }
  ];

  // Facilities Data
  const facilitiesData = [
    {
      icon: FiCpu,
      title: 'Computer Labs',
      description: 'Modern computer labs with high-speed internet and latest software',
      features: ['Programming', 'Digital Literacy', 'Research', 'Online Learning']
    },
    {
      icon: FiActivity,
      title: 'Science Labs',
      description: 'Fully equipped laboratories for Physics, Chemistry and Biology',
      features: ['Experiments', 'Research', 'Practical Skills', 'Innovation']
    },
    {
      icon: IoLibraryOutline,
      title: 'Library',
      description: 'Digital and physical library with extensive resources',
      features: ['E-Books', 'Study Spaces', 'Research', 'Quiet Zones']
    },
    {
      icon: FiSmartphone,
      title: 'Smart Classrooms',
      description: 'Technology-enabled classrooms for interactive learning',
      features: ['Projectors', 'Digital Boards', 'Online Resources', 'Collaboration']
    }
  ];

  // FAQ Data
  const faqs = [
    {
      question: 'What are the academic performance standards?',
      answer: 'We maintain high academic standards with 98% KCSE pass rate and A- mean grade. Students are supported through regular assessments, remedial classes, and personalized academic guidance.'
    },
    {
      question: 'How are CBC and 8-4-4 systems integrated?',
      answer: 'We offer both systems with smooth transition pathways. Junior Secondary follows CBC (Grades 7-9), while Senior Secondary follows 8-4-4 (Forms 1-4). Students can transition between systems with proper guidance.'
    },
    {
      question: 'What support is available for weak students?',
      answer: 'We provide comprehensive support including remedial classes, peer tutoring, personalized learning plans, counseling, and regular parent-teacher consultations to ensure every student succeeds.'
    },
    {
      question: 'How are digital skills integrated into the curriculum?',
      answer: 'Digital literacy is embedded across all subjects. We have computer labs, coding classes, online learning platforms, and technology integration in teaching methods to prepare students for the digital age.'
    }
  ];

  const handleLearnMore = (program) => {
    toast.success(`Learning more about ${program.title}`);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Academic data refreshed successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 p-4 md:p-6">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <IoSchoolOutline className="text-white text-lg w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Academic Excellence
                </h1>
                <p className="text-gray-600 mt-1">Nyaribu Secondary School - Quality Education & Innovation</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 shadow-xs border border-gray-200 font-medium disabled:opacity-50 text-sm md:text-base"
            >
              <FiRotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => router.push('/academic-calendar')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 shadow-lg font-medium text-sm md:text-base"
            >
              <FiCalendar className="w-4 h-4" />
              Academic Calendar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {academicStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search programs, subjects, or facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
              >
                <option value="all">All Programs</option>
                <option value="cbc">CBC Program</option>
                <option value="844">8-4-4 Program</option>
                <option value="stem">STEM Program</option>
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="inline-flex items-center gap-2 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
              >
                <FiFilter className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 overflow-hidden mb-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <TabIcon className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Academic Excellence at Nyaribu
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                  Committed to providing quality education through innovative teaching methods, 
                  comprehensive curriculum, and state-of-the-art facilities for holistic student development.
                </p>
              </div>

              {/* Academic Programs */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Our Academic Programs</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {academicPrograms.map((program, index) => (
                    <ProgramCard
                      key={program.title}
                      program={program}
                      index={index}
                      onLearnMore={() => handleLearnMore(program)}
                    />
                  ))}
                </div>
              </div>

              {/* Academic Features */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Features</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {academicFeatures.map((feature, index) => (
                    <FeatureCard
                      key={feature.title}
                      feature={feature}
                      onLearnMore={() => handleLearnMore(feature)}
                    />
                  ))}
                </div>
              </div>

              {/* Key Features Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Our Academic Program?</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: IoBulbOutline,
                      title: 'Innovative Teaching',
                      description: 'Modern methods and technology integration'
                    },
                    {
                      icon: FiAward,
                      title: 'Proven Excellence',
                      description: 'Consistent high academic performance'
                    },
                    {
                      icon: FiUsers,
                      title: 'Expert Faculty',
                      description: 'Qualified and experienced teachers'
                    },
                    {
                      icon: FiTargetIcon,
                      title: 'Career Focus',
                      description: 'University and career preparation'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="text-2xl text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Curriculum Systems
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  We offer comprehensive curriculum systems designed to meet diverse learning needs 
                  and prepare students for future success.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {curriculumStructure.map((curriculum, index) => (
                  <CurriculumCard
                    key={curriculum.name}
                    curriculum={curriculum}
                    icon={index === 0 ? FiBookOpen : IoSchoolOutline}
                    color={index === 0 ? 'bg-blue-50' : 'bg-green-50'}
                  />
                ))}
              </div>

              {/* Curriculum Highlights */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Curriculum Highlights</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: FiCode,
                      title: 'Digital Literacy',
                      description: 'Technology integration across subjects'
                    },
                    {
                      icon: FiTool,
                      title: 'Practical Skills',
                      description: 'Hands-on learning experiences'
                    },
                    {
                      icon: FiShield,
                      title: 'Quality Assurance',
                      description: 'Regular curriculum reviews'
                    },
                    {
                      icon: FiPieChart,
                      title: 'Assessment',
                      description: 'Continuous evaluation system'
                    }
                  ].map((highlight, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <highlight.icon className="text-xl text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">{highlight.title}</h4>
                      <p className="text-gray-600 text-xs">{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Academic Programs
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Diverse academic programs designed to cater to different learning needs and career aspirations.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {academicPrograms.map((program, index) => (
                  <ProgramCard
                    key={program.title}
                    program={program}
                    index={index}
                    onLearnMore={() => handleLearnMore(program)}
                  />
                ))}
              </div>

              {/* Program Benefits */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Program Benefits</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Learning Outcomes</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Critical thinking and problem solving
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Effective communication skills
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Digital literacy and technology skills
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Leadership and teamwork abilities
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Support Systems</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Academic counseling and guidance
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Remedial and enrichment classes
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Career guidance and university placement
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-purple-500" />
                        Parent-teacher collaboration
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Subject Offerings
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Comprehensive subject options across sciences, humanities, languages, and practical skills.
                </p>
              </div>

              {/* Core Subjects */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Core Subjects</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectsData.core.map((subject, index) => (
                    <SubjectCard key={index} subject={subject} index={index} />
                  ))}
                </div>
              </div>

              {/* Elective Subjects */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Elective Subjects</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectsData.elective.map((subject, index) => (
                    <SubjectCard key={index} subject={subject} index={index} />
                  ))}
                </div>
              </div>

              {/* Subject Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <FiInfo className="text-2xl text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">Subject Selection Guidelines</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">For Science Stream:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-blue-500" />
                            Physics, Chemistry, Biology
                          </li>
                          <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-blue-500" />
                            Mathematics (Compulsory)
                          </li>
                          <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-blue-500" />
                            Choose 1-2 electives
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">For Arts Stream:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-blue-500" />
                            History, Geography, CRE
                          </li>
                          <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-blue-500" />
                            Business Studies
                          </li>
                          <li className="flex items-center gap-2">
                            <FiCheckCircle className="text-blue-500" />
                            Choose 1-2 electives
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === 'facilities' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Academic Facilities
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  State-of-the-art facilities designed to enhance learning and provide practical experiences.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {facilitiesData.map((facility, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xs border border-gray-200/60 p-6 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                        <facility.icon className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{facility.title}</h3>
                        <p className="text-gray-600 text-sm">{facility.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="font-medium text-gray-700 text-sm">Features:</p>
                      {facility.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <FiCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Facilities */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Additional Learning Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Study Resources:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Online learning platform
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Digital textbooks
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Research databases
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Past papers library
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Support Facilities:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Counseling rooms
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Career guidance center
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Group study rooms
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-amber-500" />
                        Audio-visual rooms
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Academic FAQ
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Find answers to common questions about our academic programs, curriculum, and facilities.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    faq={faq}
                    index={index}
                    openFaq={openFaq}
                    setOpenFaq={setOpenFaq}
                  />
                ))}
              </div>

              {/* Contact Support */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Need Academic Support?</h3>
                    <p className="text-gray-600">Our academic department is ready to assist you.</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                      <a href="tel:+254712345678" className="flex items-center gap-2">
                        <FiPhone />
                        Call Academic Office
                      </a>
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                      <a href="mailto:academics@nyaribu.ac.ke" className="flex items-center gap-2">
                        <FiMail />
                        Email Academics
                      </a>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Excel Academically with Us</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Join our community dedicated to academic excellence, innovative learning, 
            and holistic development for future success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/admissions')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
            >
              Apply Now
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Contact Academics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing FiInfo icon import
const FiInfo = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);