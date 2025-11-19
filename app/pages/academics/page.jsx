'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { 
  FiBook, 
  FiUsers, 
  FiAward, 
  FiBarChart2, 
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiPlay,
  FiDownload,
  FiCalendar,
  FiStar,
  FiVideo,
  FiMapPin,
  FiMail,
  FiPhone,
  FiUser,
  FiAperture,
  FiFilter,
  FiSearch,
  FiX,
  FiEye,
  FiDollarSign,
  FiHome,
  FiCoffee,
  FiShield,
  FiGlobe,
  FiCpu,
  FiHeart,
  FiMusic,
  FiActivity,
  FiBookOpen,
  FiLayers,
  FiTrendingUp,
  FiBookmark
} from 'react-icons/fi';
import { 
  IoRocketOutline,
  IoLibraryOutline,
  IoCalculatorOutline,
  IoFlaskOutline,
  IoMusicalNotesOutline,
  IoBasketballOutline,
  IoSparkles,
  IoLanguageOutline,
  IoBusinessOutline,
  IoHomeOutline,
  IoClose,
  IoSchoolOutline,
  IoPeopleOutline,
  IoSettingsOutline
} from 'react-icons/io5';
import Image from 'next/image';

// Loading Spinner Component
const LoadingSpinner = ({ size = 40 }) => (
  <div className="flex justify-center items-center p-8">
    <CircularProgress size={size} style={{ color: '#3b82f6' }} />
  </div>
);

// Video Modal Component
const VideoModal = ({ videoTour, videoType, onClose }) => {
  const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&showinfo=0` : null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Katwanyaa High School Virtual Tour</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose className="text-xl sm:text-2xl text-gray-600" />
          </button>
        </div>
        
        <div className="aspect-video bg-black">
          {videoType === 'youtube' ? (
            <iframe
              src={getYouTubeEmbedUrl(videoTour)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Katwanyaa High School Virtual Tour"
            />
          ) : (
            <video
              controls
              className="w-full h-full"
              src={videoTour}
              title="Katwanyaa High School Virtual Tour"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Student Council Detail Modal Component
const StudentCouncilModal = ({ member, onClose }) => {
  if (!member) return null;

  const getDepartmentColor = (department) => {
    const colors = {
      'Presidency': 'from-purple-500 to-pink-600',
      'Sports': 'from-green-500 to-emerald-600',
      'General': 'from-blue-500 to-cyan-600',
      'Academics': 'from-blue-500 to-indigo-600',
      'Arts': 'from-pink-500 to-rose-600',
      'Technology': 'from-cyan-500 to-blue-600',
      'Discipline': 'from-gray-500 to-gray-700',
      'Health': 'from-red-500 to-pink-600',
      'Library': 'from-teal-500 to-green-600',
      'default': 'from-gray-500 to-gray-600'
    };
    return colors[department] || colors.default;
  };

  const calculateTenure = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getDepartmentColor(member.department)} text-white p-6 sm:p-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold mb-2">Student Leadership Profile</h2>
              <p className="text-white/90 text-sm sm:text-base">Comprehensive leadership details and achievements</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 sm:p-3 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FiX className="text-xl sm:text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start mb-6">
            {/* Profile Image */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              {member.image ? (
                <img 
                  src={member.image} 
                  alt={member.student.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-4xl font-bold shadow-2xl">
                  {member.student.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{member.student.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                  {member.position.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                  {member.department} Department
                </span>
                <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                  member.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.status}
                </span>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-800">{member.student.form}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Class</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-800">{member.student.stream}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Stream</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-800">{calculateTenure(member.startDate, member.endDate)}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Months</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-800">{member.student.academicPerformance || 'A-'}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Student Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <FiUser className="text-blue-500 text-lg sm:text-xl" />
                  Student Information
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Admission Number</label>
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">{member.student.admissionNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Full Name</label>
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">{member.student.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Class</label>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{member.student.form}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Stream</label>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{member.student.stream}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Gender</label>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{member.student.gender}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Academic Performance</label>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{member.student.academicPerformance || 'Excellent'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leadership Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 rounded-2xl p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <FiAward className="text-blue-500 text-lg sm:text-xl" />
                  Leadership Details
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Position</label>
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">{member.position.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Department</label>
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">{member.department}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Start Date</label>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{new Date(member.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">End Date</label>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {member.endDate ? new Date(member.endDate).toLocaleDateString() : 'Present'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Tenure Duration</label>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {calculateTenure(member.startDate, member.endDate)} months
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600">Status</label>
                    <p className={`font-semibold text-sm sm:text-base ${
                      member.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {member.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsibilities & Achievements */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <FiTarget className="text-orange-500 text-lg sm:text-xl" />
                  Key Responsibilities
                </h4>
                <div className="bg-orange-50 rounded-xl p-3 sm:p-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{member.responsibilities}</p>
                </div>
              </div>

              {member.achievements && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <FiStar className="text-yellow-500 text-lg sm:text-xl" />
                    Notable Achievements
                  </h4>
                  <div className="bg-yellow-50 rounded-xl p-3 sm:p-4">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{member.achievements}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <IoSparkles className="text-purple-500" />
                Leadership Impact
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>• Represents student body in school meetings</p>
                <p>• Coordinates departmental activities and events</p>
                <p>• Serves as role model for other students</p>
                <p>• Facilitates communication between staff and students</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiTrendingUp className="text-green-500" />
                Performance Metrics
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>• Maintains good academic standing</p>
                <p>• Demonstrates leadership qualities</p>
                <p>• Active participation in school activities</p>
                <p>• Positive peer and teacher feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Fees Information Component
const FeesInformation = ({ schoolInfo }) => {
  if (!schoolInfo) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">School Fees Structure</h3>
      
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Boarding Fees */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiHome className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">Boarding Students</h4>
              <p className="text-blue-600 font-semibold text-sm sm:text-base">Full accommodation</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
              KES {schoolInfo.feesBoarding?.toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Per term</p>
          </div>
        </div>

        {/* Day School Fees */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <FiUsers className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">Day Scholars</h4>
              <p className="text-green-600 font-semibold text-sm sm:text-base">Meals included</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
              KES {schoolInfo.feesDay?.toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Per term</p>
          </div>
        </div>
      </div>

      {/* Fees Distribution */}
      {schoolInfo.feesDistribution && (
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">Fees Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(schoolInfo.feesDistribution).map(([category, amount], index) => (
              <div key={category} className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
                  KES {amount?.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 text-xs sm:text-sm">
          * Fees are payable per term. Payment plans and scholarships available for qualifying students.
        </p>
      </div>
    </div>
  );
};

export default function KatwanyaaAcademicsPage() {
  const [academicTab, setAcademicTab] = useState('departments');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [councilMembers, setCouncilMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showCouncilModal, setShowCouncilModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDepartmentFilter, setStudentDepartmentFilter] = useState('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(8);

  // Online images for academic sections
  const academicImages = {
    stem: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    arts: "https://images.unsplash.com/photo-1547036967-23d11aacaee0",
    sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    library: "https://images.unsplash.com/photo-1589998059171-988d887df646",
    classroom: "https://images.unsplash.com/photo-1588072432836-e10032774350",
    science: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69",
    computer: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"
  };

  // CBC Competencies
  const cbcCompetencies = [
    {
      icon: IoLanguageOutline,
      title: 'Communication & Collaboration',
      description: 'Developing effective communication skills and ability to work in teams across different subjects',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiCpu,
      title: 'Digital Literacy',
      description: 'Mastering technology tools for learning, research, and problem-solving in modern education',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiHeart,
      title: 'Critical Thinking & Problem Solving',
      description: 'Analytical thinking and creative solutions to real-world challenges across all subjects',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FiUsers,
      title: 'Creativity & Imagination',
      description: 'Fostering innovation and creative expression in academic and co-curricular activities',
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Fetch all data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [schoolResponse, councilResponse] = await Promise.all([
        fetch('/api/school').then(res => res.json()),
        fetch('/api/studentCouncil').then(res => res.json())
      ]);

      if (schoolResponse.success) setSchoolInfo(schoolResponse.school);
      if (councilResponse.success) setCouncilMembers(councilResponse.councilMembers);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions for data handling
  const getSubjectsData = (subjects) => {
    if (!subjects) return [];
    return Array.isArray(subjects) ? subjects : [];
  };

  const getDepartmentsData = (departments) => {
    if (!departments) return [];
    if (Array.isArray(departments)) return departments;
    if (typeof departments === 'object') {
      return Object.values(departments).flat();
    }
    return [];
  };

  // Filter council members
  const filteredCouncilMembers = councilMembers.filter(member => {
    const matchesSearch = studentSearch === '' || 
      member.student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      member.position.toLowerCase().includes(studentSearch.toLowerCase()) ||
      member.department.toLowerCase().includes(studentSearch.toLowerCase());
    
    const matchesDepartment = studentDepartmentFilter === 'all' || member.department === studentDepartmentFilter;
    const matchesStatus = studentStatusFilter === 'all' || member.status === studentStatusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredCouncilMembers.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredCouncilMembers.length / studentsPerPage);

  // Get unique departments for filter
  const uniqueDepartments = ['all', ...new Set(councilMembers.map(member => member.department))];

  // Academic Stats from real data
  const schoolSubjects = getSubjectsData(schoolInfo?.subjects);
  const schoolDepartments = getDepartmentsData(schoolInfo?.departments);

  const academicStats = [
    { 
      value: schoolInfo?.studentCount ? schoolInfo.studentCount.toLocaleString() : '1,300', 
      label: 'Total Students', 
      icon: FiUsers, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Enrolled across all forms'
    },
    { 
      value: schoolInfo?.staffCount ? schoolInfo.staffCount.toLocaleString() : '55', 
      label: 'Teaching Staff', 
      icon: FiBook, 
      color: 'from-purple-500 to-pink-500',
      description: 'Qualified educators'
    },
    { 
      value: schoolSubjects.length.toString(), 
      label: 'Subjects Offered', 
      icon: FiBarChart2, 
      color: 'from-green-500 to-emerald-500',
      description: 'Comprehensive curriculum'
    },
    { 
      value: councilMembers.length.toString(), 
      label: 'Student Leaders', 
      icon: FiAward, 
      color: 'from-orange-500 to-red-500',
      description: 'Active leadership roles'
    },
    { 
      value: '8-4-4 & CBC', 
      label: 'Curriculum Systems', 
      icon: FiLayers, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Dual curriculum approach'
    },
    { 
      value: '98%', 
      label: 'Success Rate', 
      icon: FiTrendingUp, 
      color: 'from-teal-500 to-green-500',
      description: 'Academic excellence'
    }
  ];

  // Enhanced Departments with CBC and 8-4-4 integration
  const departments = [
    {
      id: 'stem',
      name: 'Science & Technology',
      icon: IoRocketOutline,
      description: 'Comprehensive STEM education with modern laboratories and technology integration',
      image: academicImages.science,
      color: 'from-blue-500 to-cyan-500',
      curriculum: ['8-4-4', 'CBC Pathways'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Studies'],
      programs: [
        {
          name: 'Advanced Sciences Program',
          description: 'Comprehensive science education with modern laboratories and research opportunities',
          duration: '4 Years',
          requirements: 'Strong performance in Mathematics and Sciences, interest in research',
          courses: ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
          features: ['Science Laboratories', 'Research Projects', 'STEM Competitions', 'University Partnerships'],
          curriculum: ['8-4-4', 'CBC STEM Pathway'],
          facilities: ['Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Computer Lab'],
          careerPaths: ['Engineering', 'Medicine', 'Research', 'Technology']
        },
        {
          name: 'Computer & Technology Studies',
          description: 'Modern computer education with programming, networking, and digital skills',
          duration: '4 Years',
          requirements: 'Logical thinking, interest in technology',
          courses: ['Programming', 'Computer Networks', 'Digital Literacy', 'Web Development', 'Database Management'],
          features: ['Computer Labs', 'Coding Clubs', 'Tech Competitions', 'Industry Visits'],
          curriculum: ['8-4-4', 'CBC Digital Literacy'],
          facilities: ['Computer Laboratory', 'Programming Lab', 'Internet Access'],
          careerPaths: ['Software Development', 'IT Support', 'Network Administration', 'Data Science']
        }
      ]
    },
    {
      id: 'humanities',
      name: 'Humanities & Languages',
      icon: IoLanguageOutline,
      description: 'Language mastery and social sciences with cultural exchange programs',
      image: academicImages.arts,
      color: 'from-purple-500 to-pink-500',
      curriculum: ['8-4-4', 'CBC'],
      subjects: ['English', 'Kiswahili', 'History', 'Geography', 'Business Studies', 'CRE'],
      programs: [
        {
          name: 'Languages & Communication Arts',
          description: 'Developing excellent communication skills in multiple languages',
          duration: '4 Years',
          requirements: 'Interest in languages and communication',
          courses: ['English Language', 'Kiswahili', 'Literature', 'Communication Skills', 'French'],
          features: ['Language Lab', 'Debate Club', 'Cultural Exchange', 'Public Speaking'],
          curriculum: ['8-4-4', 'CBC Communication'],
          facilities: ['Language Laboratory', 'Library', 'Auditorium'],
          careerPaths: ['Journalism', 'Teaching', 'Translation', 'Public Relations']
        },
        {
          name: 'Social Sciences & Business',
          description: 'Understanding human society and business principles',
          duration: '4 Years',
          requirements: 'Interest in social studies and business',
          courses: ['History', 'Geography', 'Business Studies', 'Economics', 'Entrepreneurship'],
          features: ['Business Club', 'Field Trips', 'Guest Lectures', 'Entrepreneurship Projects'],
          curriculum: ['8-4-4', 'CBC Social Sciences'],
          facilities: ['Business Lab', 'Research Center', 'Conference Room'],
          careerPaths: ['Business Management', 'Economics', 'History', 'Geography']
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical & Applied Sciences',
      icon: IoSettingsOutline,
      description: 'Practical skills and technical education with workshops and industry exposure',
      image: academicImages.computer,
      color: 'from-green-500 to-teal-500',
      curriculum: ['8-4-4', 'CBC Talent'],
      subjects: ['Agriculture', 'Home Science', 'Art & Design', 'Music', 'Physical Education'],
      programs: [
        {
          name: 'Agricultural Sciences',
          description: 'Modern agricultural techniques and sustainable farming practices',
          duration: '4 Years',
          requirements: 'Interest in agriculture and environment',
          courses: ['Crop Production', 'Animal Husbandry', 'Agricultural Economics', 'Soil Science', 'Agribusiness'],
          features: ['School Farm', 'Greenhouse', 'Agricultural Projects', 'Field Visits'],
          curriculum: ['8-4-4', 'CBC Agriculture'],
          facilities: ['School Farm', 'Greenhouse', 'Agricultural Lab'],
          careerPaths: ['Agronomy', 'Veterinary', 'Agricultural Economics', 'Food Science']
        },
        {
          name: 'Creative Arts & Design',
          description: 'Developing creative talents in visual and performing arts',
          duration: '4 Years',
          requirements: 'Creative ability and interest in arts',
          courses: ['Drawing & Painting', 'Sculpture', 'Music', 'Drama', 'Design'],
          features: ['Art Studio', 'Music Room', 'Drama Club', 'Art Exhibitions'],
          curriculum: ['8-4-4', 'CBC Creative Arts'],
          facilities: ['Art Studio', 'Music Room', 'Performance Space'],
          careerPaths: ['Fine Arts', 'Graphic Design', 'Music', 'Theater Arts']
        }
      ]
    }
  ];

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredCouncilMembers.length)} of{' '}
          {filteredCouncilMembers.length} student leaders
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
          >
            <FiArrowRight className="transform rotate-180 text-sm sm:text-base" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">...</span>
                )}
              </>
            )}
            
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                  currentPage === number
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
            
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
          >
            Next
            <FiArrowRight className="text-sm sm:text-base" />
          </button>
        </div>

        {/* Items Per Page Selector */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <span>Show:</span>
          <select
            value={studentsPerPage}
            onChange={(e) => {
              setStudentsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={20}>20</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    );
  };

  const handleVideoTour = () => {
    if (schoolInfo?.videoTour) {
      setShowVideoModal(true);
    } else {
      alert('Video tour not available at the moment');
    }
  };

  const handleDownloadCurriculum = () => {
    if (schoolInfo?.curriculumPDF) {
      window.open(schoolInfo.curriculumPDF, '_blank');
    } else {
      alert('Curriculum PDF not available at the moment');
    }
  };

  const handleViewMemberDetails = (member) => {
    setSelectedMember(member);
    setShowCouncilModal(true);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [studentSearch, studentDepartmentFilter, studentStatusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={60} />
          <p className="text-gray-600 mt-4 text-base sm:text-lg">Loading Katwanyaa High School Academics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-3 py-1 sm:px-4 sm:py-2 mb-4 sm:mb-6 border border-blue-200"
              >
                <IoSparkles className="text-blue-600 text-sm sm:text-lg" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Excellence in Education Since 1985</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                {schoolInfo?.name || 'Katwanyaa Secondary School'}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mt-2">
                  Academic Excellence
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                {schoolInfo?.description || 'Committed to bringing the best quality of education to our students with comprehensive academic programs, modern facilities, and dedicated leadership. Offering both 8-4-4 and CBC curriculum systems.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadCurriculum}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm sm:text-base border border-blue-500 shadow-lg"
                >
                  <FiDownload className="text-sm sm:text-lg" />
                  Download Curriculum
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVideoTour}
                  className="bg-white text-blue-600 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold border border-blue-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <FiPlay className="text-sm sm:text-lg" />
                  Watch Tour
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
                {academicStats.slice(0, 3).map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="text-center"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${stat.color} mb-2 sm:mb-3 shadow-lg`}>
                      <stat.icon className="text-white text-lg sm:text-2xl" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-gray-600 font-semibold text-xs sm:text-sm">{stat.label}</div>
                    <div className="text-gray-500 text-xs mt-1">{stat.description}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50">
                <div className="relative h-48 sm:h-64 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                  <Image
                    src={academicImages.classroom}
                    alt="Katwanyaa High School Modern Classroom"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                    <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Modern Learning Environment</h3>
                    <p className="text-white/90 text-sm sm:text-base lg:text-lg">State-of-the-art facilities and technology</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {academicStats.slice(3).map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center border border-blue-100 shadow-lg"
                    >
                      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} mb-2 sm:mb-3 shadow-md`}>
                        <stat.icon className="text-white text-sm sm:text-base lg:text-xl" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-gray-600 text-xs sm:text-sm font-semibold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fees Information Section */}
      {schoolInfo?.feesBoarding && (
        <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FeesInformation schoolInfo={schoolInfo} />
          </div>
        </section>
      )}

      {/* Academic Tabs Navigation */}
      <section className="py-4 sm:py-6 bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAcademicTab('departments')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center gap-2 ${
                academicTab === 'departments'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <IoLibraryOutline className="text-base sm:text-xl" />
              Departments
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAcademicTab('leadership')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center gap-2 ${
                academicTab === 'leadership'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <IoPeopleOutline className="text-base sm:text-xl" />
              Leadership
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAcademicTab('curriculum')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center gap-2 ${
                academicTab === 'curriculum'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <FiBookOpen className="text-base sm:text-xl" />
              Curriculum
            </motion.button>
          </div>
        </div>
      </section>

      {/* Academic Departments Section */}
      {academicTab === 'departments' && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
                Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Departments</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
                Comprehensive academic departments offering both 8-4-4 and CBC curriculum systems with modern facilities and experienced faculty
              </p>
            </motion.div>

            {/* Departments Grid */}
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              {departments.map((dept, index) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200 group cursor-pointer"
                  onClick={() => setSelectedProgram(dept.id === selectedProgram ? null : dept.id)}
                >
                  {/* Department Header */}
                  <div className={`bg-gradient-to-r ${dept.color} p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                      <div className="flex gap-1 sm:gap-2">
                        {dept.curriculum.map((curr, idx) => (
                          <span key={idx} className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                            {curr}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <dept.icon className="text-white text-xl sm:text-2xl lg:text-3xl" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">{dept.name}</h3>
                        <p className="text-white/80 text-xs sm:text-sm">{dept.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Department Content */}
                  <div className="p-4 sm:p-6">
                    {/* Subjects */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <FiBook className="text-blue-500 text-sm sm:text-base" />
                        Offered Subjects
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {dept.subjects.map((subject, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-xs border border-blue-200"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Programs */}
                    <div className="space-y-3 sm:space-y-4">
                      {dept.programs.map((program, pIndex) => (
                        <motion.div
                          key={pIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: pIndex * 0.1 }}
                          className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <h5 className="font-bold text-gray-800 text-base sm:text-lg">{program.name}</h5>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {program.duration}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{program.description}</p>
                          
                          <AnimatePresence>
                            {selectedProgram === dept.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 sm:space-y-3"
                              >
                                {/* Curriculum */}
                                <div>
                                  <h6 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 sm:mb-2">Curriculum Systems</h6>
                                  <div className="flex gap-1 sm:gap-2">
                                    {program.curriculum.map((curr, idx) => (
                                      <span key={idx} className="bg-purple-50 text-purple-800 px-2 py-1 rounded text-xs">
                                        {curr}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Facilities */}
                                <div>
                                  <h6 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 sm:mb-2">Facilities</h6>
                                  <div className="flex flex-wrap gap-1">
                                    {program.facilities.map((facility, idx) => (
                                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        {facility}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Career Paths */}
                                <div>
                                  <h6 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 sm:mb-2">Career Paths</h6>
                                  <div className="flex flex-wrap gap-1">
                                    {program.careerPaths.map((career, idx) => (
                                      <span key={idx} className="bg-orange-50 text-orange-800 px-2 py-1 rounded text-xs">
                                        {career}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProgram(dept.id === selectedProgram ? null : dept.id);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm flex items-center gap-1 mt-2 sm:mt-3"
                          >
                            {selectedProgram === dept.id ? 'Show Less' : 'Learn More'}
                            <FiArrowRight className={`transform ${selectedProgram === dept.id ? 'rotate-90' : ''} transition-transform text-xs sm:text-sm`} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Student Leadership Section */}
      {academicTab === 'leadership' && (
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
                Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Leadership</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
                Meet our dedicated student leaders who represent and serve the Katwanyaa High School community across various departments and roles
              </p>
            </motion.div>

            {/* Filters */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative lg:col-span-2">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    placeholder="Search leaders by name, position..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white shadow-sm"
                  />
                </div>
                
                <select
                  value={studentDepartmentFilter}
                  onChange={(e) => setStudentDepartmentFilter(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white shadow-sm"
                >
                  <option value="all">All Departments</option>
                  {uniqueDepartments.filter(dept => dept !== 'all').map(dept => (
                    <option key={dept} value={dept}>{dept} Department</option>
                  ))}
                </select>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active Leaders</option>
                  <option value="Inactive">Past Leaders</option>
                </select>
              </div>
              <div className="mt-3 text-center lg:text-right">
                <p className="text-gray-600 text-sm sm:text-base">
                  Showing <span className="font-bold text-blue-600">{filteredCouncilMembers.length}</span> of {councilMembers.length} leaders
                </p>
              </div>
            </div>

            {/* Student Leaders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentStudents.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.1, 0.5) }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => handleViewMemberDetails(member)}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl group"
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.student.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl object-cover border-2 sm:border-4 border-gray-100 group-hover:border-blue-200 transition-colors shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-lg">
                          {member.student.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">{member.student.name}</h4>
                      <p className="text-blue-600 font-semibold text-xs sm:text-sm truncate">
                        {member.position.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{member.department} Department</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Class:</span>
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm">{member.student.form} {member.student.stream}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Admission:</span>
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm">{member.student.admissionNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Performance:</span>
                      <span className="font-semibold text-green-600 text-xs sm:text-sm">{member.student.academicPerformance || 'Excellent'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Status:</span>
                      <span className={`font-semibold text-xs sm:text-sm ${
                        member.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Since {new Date(member.startDate).getFullYear()}</span>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg">
                        <FiEye className="text-xs sm:text-sm" />
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination />

            {/* Empty State */}
            {currentStudents.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <FiUser className="mx-auto text-4xl sm:text-6xl text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-lg sm:text-xl mb-2">No student leaders found</p>
                <p className="text-gray-400 text-sm sm:text-base">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Curriculum Systems Section */}
      {academicTab === 'curriculum' && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
                Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Systems</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
                Katwanyaa High School offers both 8-4-4 and Competency Based Curriculum (CBC) systems to cater to diverse learning needs and talents
              </p>
            </motion.div>

            {/* Curriculum Systems Grid */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {/* 8-4-4 System */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <IoSchoolOutline className="text-white text-xl sm:text-2xl lg:text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">8-4-4 System</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Traditional Academic Pathway</p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-2 sm:mb-3">Structure</h4>
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                      <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">8</div>
                        <div className="text-gray-600 text-xs sm:text-sm">Years Primary</div>
                      </div>
                      <div className="bg-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">4</div>
                        <div className="text-gray-600 text-xs sm:text-sm">Years Secondary</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">4</div>
                        <div className="text-gray-600 text-xs sm:text-sm">Years University</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">12+</div>
                        <div className="text-gray-600 text-xs sm:text-sm">Subjects</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-2 sm:mb-3">Key Features</h4>
                    <ul className="space-y-1 sm:space-y-2 text-gray-600 text-sm sm:text-base">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500 text-sm sm:text-base" />
                        Comprehensive subject coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500 text-sm sm:text-base" />
                        KCSE national examination preparation
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500 text-sm sm:text-base" />
                        University pathway preparation
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500 text-sm sm:text-base" />
                        Proven track record of success
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* CBC System */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <FiTrendingUp className="text-white text-xl sm:text-2xl lg:text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">CBC System</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Competency Based Education</p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-2 sm:mb-3">Pathways</h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div className="bg-purple-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-600">STEM</div>
                        <div className="text-gray-600 text-xs">Science & Technology</div>
                      </div>
                      <div className="bg-pink-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-xl font-bold text-pink-600">Arts</div>
                        <div className="text-gray-600 text-xs">Creative Arts</div>
                      </div>
                      <div className="bg-teal-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-xl font-bold text-teal-600">Sports</div>
                        <div className="text-gray-600 text-xs">Athletics</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-2 sm:mb-3">Core Competencies</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {cbcCompetencies.map((competency, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <competency.icon className={`text-sm sm:text-base ${
                              competency.color && competency.color.split(' ')[2] 
                                ? competency.color.split(' ')[2].replace('to-', 'text-')
                                : 'text-blue-500'
                            }`} />
                            <span className="font-semibold text-gray-800 text-xs sm:text-sm">{competency.title}</span>
                          </div>
                          <p className="text-gray-600 text-xs">{competency.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Subjects Offered */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200"
            >
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Subjects Offered</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {schoolSubjects.map((subject, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-blue-200"
                  >
                    <FiBookOpen className="text-blue-500 text-lg sm:text-xl lg:text-2xl mx-auto mb-1 sm:mb-2" />
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">{subject}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Available in both systems</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal 
          videoTour={schoolInfo?.videoTour} 
          videoType={schoolInfo?.videoType}
          onClose={() => setShowVideoModal(false)} 
        />
      )}

      {/* Student Council Modal */}
      {showCouncilModal && (
        <StudentCouncilModal 
          member={selectedMember} 
          onClose={() => {
            setShowCouncilModal(false);
            setSelectedMember(null);
          }} 
        />
      )}
    </div>
  );
}