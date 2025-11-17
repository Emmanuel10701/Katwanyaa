'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiUsers, 
  FiAward, 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiX,
  FiUser,
  FiCalendar,
  FiStar,
  FiTarget,
  FiCheck,
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiBook,
  FiActivity,
  FiMusic,
  FiCoffee,
  FiBell,
  FiShield,
  FiTruck,
  FiCloud,
  FiCpu,
  FiHeart,
  FiHome,
  FiImage,
  FiUpload,
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMapPin,
  FiBarChart2,
  FiArrowUpRight
} from 'react-icons/fi';

const StudentCouncil = () => {
  const [councilMembers, setCouncilMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Council positions with proper hierarchy
  const councilPositions = [
    // Presidency
    { value: 'President', label: 'President of the School', department: 'Presidency', level: 1 },
    { value: 'DeputyPresident', label: 'Deputy President', department: 'Presidency', level: 2 },
    
    // School Leadership
    { value: 'SchoolCaptain', label: 'School Captain', department: 'General', level: 1 },
    { value: 'DeputyCaptain', label: 'Deputy Captain', department: 'General', level: 2 },
    
    // Academic Department
    { value: 'AcademicsSecretary', label: 'Academics Secretary', department: 'Academics', level: 1 },
    { value: 'Assistant', label: 'Academic Assistant', department: 'Academics', level: 2 },
    
    // Sports Department
    { value: 'SportsSecretary', label: 'Sports Secretary', department: 'Sports', level: 1 },
    { value: 'Assistant', label: 'Sports Assistant', department: 'Sports', level: 2 },
    
    // Entertainment Department
    { value: 'EntertainmentSecretary', label: 'Entertainment Secretary', department: 'Entertainment', level: 1 },
    { value: 'Assistant', label: 'Entertainment Assistant', department: 'Entertainment', level: 2 },
    
    // Cleaning Department
    { value: 'CleaningSecretary', label: 'Cleaning Secretary', department: 'Cleaning', level: 1 },
    { value: 'Assistant', label: 'Cleaning Assistant', department: 'Cleaning', level: 2 },
    
    // Meals Department
    { value: 'MealsSecretary', label: 'Meals Secretary', department: 'Meals', level: 1 },
    { value: 'Assistant', label: 'Meals Assistant', department: 'Meals', level: 2 },
    
    // Discipline Department
    { value: 'DisciplineSecretary', label: 'Discipline Secretary', department: 'Discipline', level: 1 },
    { value: 'Assistant', label: 'Discipline Assistant', department: 'Discipline', level: 2 },
    
    // Health Department
    { value: 'HealthSecretary', label: 'Health Secretary', department: 'Health', level: 1 },
    { value: 'Assistant', label: 'Health Assistant', department: 'Health', level: 2 },
    
    // Library Department
    { value: 'LibrarySecretary', label: 'Library Secretary', department: 'Library', level: 1 },
    { value: 'Assistant', label: 'Library Assistant', department: 'Library', level: 2 },
    
    // Other Departments
    { value: 'BellRinger', label: 'Bell Ringer', department: 'General', level: 3 },
    { value: 'TransportSecretary', label: 'Transport Secretary', department: 'Transport', level: 1 },
    { value: 'EnvironmentSecretary', label: 'Environment Secretary', department: 'Environment', level: 1 },
    { value: 'SpiritualSecretary', label: 'Spiritual Secretary', department: 'Spiritual', level: 1 },
    { value: 'TechnologySecretary', label: 'Technology Secretary', department: 'Technology', level: 1 },
  ];

  const councilDepartments = [
    { value: 'Presidency', label: 'Presidency', color: 'from-purple-500 to-pink-600', icon: FiAward },
    { value: 'Academics', label: 'Academics', color: 'from-blue-500 to-cyan-600', icon: FiBook },
    { value: 'Sports', label: 'Sports', color: 'from-green-500 to-emerald-600', icon: FiActivity },
    { value: 'Entertainment', label: 'Entertainment', color: 'from-yellow-500 to-orange-600', icon: FiMusic },
    { value: 'Cleaning', label: 'Cleaning', color: 'from-indigo-500 to-purple-600', icon: FiHome },
    { value: 'Meals', label: 'Meals', color: 'from-red-500 to-pink-600', icon: FiCoffee },
    { value: 'Discipline', label: 'Discipline', color: 'from-gray-500 to-gray-700', icon: FiShield },
    { value: 'Health', label: 'Health', color: 'from-pink-500 to-rose-600', icon: FiHeart },
    { value: 'Library', label: 'Library', color: 'from-teal-500 to-green-600', icon: FiBook },
    { value: 'Transport', label: 'Transport', color: 'from-orange-500 to-red-600', icon: FiTruck },
    { value: 'Environment', label: 'Environment', color: 'from-lime-500 to-green-600', icon: FiHome },
    { value: 'Spiritual', label: 'Spiritual', color: 'from-violet-500 to-purple-600', icon: FiCloud },
    { value: 'Technology', label: 'Technology', color: 'from-cyan-500 to-blue-600', icon: FiCpu },
    { value: 'General', label: 'General', color: 'from-slate-500 to-gray-600', icon: FiUsers },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active', color: 'from-green-500 to-emerald-600' },
    { value: 'Inactive', label: 'Inactive', color: 'from-gray-500 to-gray-600' },
    { value: 'Graduated', label: 'Graduated', color: 'from-blue-500 to-cyan-600' }
  ];

  const [formData, setFormData] = useState({
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
    achievements: '',
    status: 'Active'
  });

// Fetch council members
const fetchCouncilMembers = async () => {
  try {
    setLoading(true);
    // CHANGE THIS LINE:
    const response = await fetch('/api/studentCouncil');
    const result = await response.json();

    if (result.success) {
      setCouncilMembers(result.councilMembers);
      setFilteredMembers(result.councilMembers);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching council members:', error);
    toast.error('Failed to load council members');
  } finally {
    setLoading(false);
  }
};
 // Search students
const searchStudents = async (term) => {
  if (!term.trim()) {
    setStudents([]);
    return;
  }

  try {
    setSearchLoading(true);
    // CHANGE THIS LINE:
    const response = await fetch(`/api/student?action=search-students&search=${encodeURIComponent(term)}`);
    const result = await response.json();

    if (result.success) {
      setStudents(result.students);
    }
  } catch (error) {
    console.error('Error searching students:', error);
    toast.error('Failed to search students');
  } finally {
    setSearchLoading(false);
  }
};;

  useEffect(() => {
    fetchCouncilMembers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchStudents(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Filter members
  useEffect(() => {
    let filtered = councilMembers;

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member => member.status === selectedStatus);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [selectedDepartment, selectedStatus, councilMembers]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-gray-700">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMembers.length)} of {filteredMembers.length} members
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <FiChevronLeft className="text-lg" />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => 
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, index, array) => (
            <div key={page} className="flex items-center">
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => paginate(page)}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            </div>
          ))
        }

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

  const handleCreate = () => {
    setFormData({
      position: '',
      department: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      responsibilities: '',
      achievements: '',
      status: 'Active'
    });
    setEditingMember(null);
    setSelectedStudent(null);
    setImagePreview(null);
    setImageFile(null);
    setShowStudentSearch(true);
  };

  const handleEdit = (member) => {
    setFormData({
      position: member.position,
      department: member.department,
      startDate: member.startDate.split('T')[0],
      endDate: member.endDate ? member.endDate.split('T')[0] : '',
      responsibilities: member.responsibilities,
      achievements: member.achievements || '',
      status: member.status
    });
    setEditingMember(member);
    setSelectedStudent(member.student);
    setImagePreview(member.image || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowStudentSearch(false);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedStudent) {
    toast.error('Please select a student');
    return;
  }

  try {
    setSubmitting(true);
    
    const formDataToSend = new FormData();
    
    if (editingMember) {
      formDataToSend.append('position', formData.position);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate || '');
      formDataToSend.append('responsibilities', formData.responsibilities);
      formDataToSend.append('achievements', formData.achievements || '');
      formDataToSend.append('status', formData.status);
      
      if (!imagePreview && editingMember.image) {
        formDataToSend.append('removeImage', 'true');
      }
    } else {
      // FOR NEW MEMBERS - Make sure studentId is correct
      formDataToSend.append('studentId', selectedStudent.id);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate || '');
      formDataToSend.append('responsibilities', formData.responsibilities);
      formDataToSend.append('achievements', formData.achievements || '');
      formDataToSend.append('status', 'Active'); // Ensure status is set
    }

    // Append image file if selected
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    const url = editingMember 
      ? `/api/studentCouncil/${editingMember.id}`
      : '/api/studentCouncil';

    const method = editingMember ? 'PUT' : 'POST';

    console.log('Sending data:', {
      studentId: selectedStudent?.id,
      position: formData.position,
      department: formData.department,
      startDate: formData.startDate,
      status: formData.status
    });

    const response = await fetch(url, {
      method,
      body: formDataToSend,
      // Don't set Content-Type header for FormData - browser will set it automatically
    });

    const result = await response.json();

    if (result.success) {
      await fetchCouncilMembers();
      setShowModal(false);
      setSelectedStudent(null);
      setImagePreview(null);
      setImageFile(null);
      toast.success(editingMember ? 'Council member updated successfully' : 'Council member added successfully');
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error saving council member:', error);
    toast.error(error.message || 'Failed to save council member');
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async (member) => {
    if (confirm(`Are you sure you want to remove ${member.student.name} from the council?`)) {
      try {
        const response = await fetch(`/api/studentCouncil/${member.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          await fetchCouncilMembers();
          toast.success('Council member removed successfully');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error deleting council member:', error);
        toast.error('Failed to remove council member');
      }
    }
  };

  const getPositionIcon = (position) => {
    const pos = councilPositions.find(p => p.value === position);
    const dept = councilDepartments.find(d => d.value === (pos?.department || 'General'));
    return dept ? dept.icon : FiUser;
  };

  const getDepartmentColor = (department) => {
    const dept = councilDepartments.find(d => d.value === department);
    return dept ? dept.color : 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status) => {
    const stat = statusOptions.find(s => s.value === status);
    return stat ? stat.color : 'from-gray-500 to-gray-600';
  };

  const getPositionLabel = (position, department) => {
    const pos = councilPositions.find(p => p.value === position && p.department === department);
    return pos ? pos.label : position;
  };

  const StatusBadge = ({ status }) => (
    <span className={`bg-gradient-to-r ${getStatusColor(status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
      {status}
    </span>
  );

  const DepartmentBadge = ({ department }) => {
    const dept = councilDepartments.find(d => d.value === department);
    const DeptIcon = dept?.icon || FiUsers;
    
    return (
      <span className={`bg-gradient-to-r ${getDepartmentColor(department)} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        <DeptIcon className="text-xs" />
        {dept?.label || department}
      </span>
    );
  };

  // Get members count by department
  const getMembersByDepartment = (department) => {
    return councilMembers.filter(m => m.department === department).length;
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Katwanyaa High School Student Council
          </h1>
          <p className="text-gray-600 mt-2">Manage student leadership positions and departmental responsibilities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-purple-500/25"
        >
          <FiPlus className="text-lg" />
          Add Council Member
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Members</p>
              <p className="text-3xl font-bold mt-2">{councilMembers.length}</p>
            </div>
            <FiUsers className="text-2xl text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Members</p>
              <p className="text-3xl font-bold mt-2">
                {councilMembers.filter(m => m.status === 'Active').length}
              </p>
            </div>
            <FiAward className="text-2xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Departments</p>
              <p className="text-3xl font-bold mt-2">
                {new Set(councilMembers.map(m => m.department)).size}
              </p>
            </div>
            <FiTarget className="text-2xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Leadership Roles</p>
              <p className="text-3xl font-bold mt-2">
                {councilMembers.filter(m => 
                  ['President', 'DeputyPresident', 'SchoolCaptain'].includes(m.position)
                ).length}
              </p>
            </div>
            <FiStar className="text-2xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
        {councilDepartments.map(dept => (
          <motion.div
            key={dept.value}
            whileHover={{ scale: 1.05, y: -2 }}
            className={`bg-gradient-to-br ${dept.color} rounded-2xl p-4 text-white cursor-pointer ${
              selectedDepartment === dept.value ? 'ring-2 ring-white ring-opacity-50' : ''
            }`}
            onClick={() => setSelectedDepartment(selectedDepartment === dept.value ? 'all' : dept.value)}
          >
            <div className="flex flex-col items-center text-center">
              <dept.icon className="text-xl mb-2" />
              <p className="text-xs font-semibold opacity-90">{dept.label}</p>
              <p className="text-lg font-bold mt-1">{getMembersByDepartment(dept.value)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {councilDepartments.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchCouncilMembers}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 w-full justify-center"
            >
              <FiRefreshCw className="text-lg" />
              Refresh
            </motion.button>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toast.info('Export feature coming soon')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 w-full justify-center"
            >
              <FiDownload className="text-lg" />
              Export CSV
            </motion.button>
          </div>
        </div>
      </div>

      {/* Council Members Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tenure</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentMembers.map((member) => {
                const PositionIcon = getPositionIcon(member.position);
                
                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(member)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.image ? (
                            <img 
                              src={member.image} 
                              alt={member.student.name}
                              className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {member.student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{member.student.name}</div>
                          <div className="text-sm text-gray-500">{member.student.admissionNumber}</div>
                          <div className="text-xs text-gray-400">{member.student.form} {member.student.stream}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <PositionIcon className="text-gray-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {getPositionLabel(member.position, member.department)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DepartmentBadge department={member.department} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(member.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.endDate ? `to ${new Date(member.endDate).toLocaleDateString()}` : 'Present'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(member);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="text-sm" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(member);
                          }}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="text-sm" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(member);
                          }}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="text-sm" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No council members found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add new members</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <Pagination />
        </div>
      )}

      {/* Student Search Modal */}
      <AnimatePresence>
        {showStudentSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowStudentSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Select Student for Council</h2>
                  <button
                    onClick={() => setShowStudentSearch(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="text-xl text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="relative mb-6">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name, admission number, form, or stream..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Searching students...</p>
                    </div>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <motion.div
                        key={student.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                          <p className="text-sm text-gray-500">{student.form} {student.stream} • {student.gender}</p>
                          <p className="text-xs text-gray-400 mt-1">Performance: {student.academicPerformance}</p>
                        </div>
                        <FiCheck className="text-green-500 text-xl" />
                      </motion.div>
                    ))
                  ) : searchTerm ? (
                    <div className="text-center py-8">
                      <FiUser className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-500">No students found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiSearch className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-500">Search for students to add to council</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Council Member Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Council Member Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="text-xl text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 mb-6">
                  <div className="flex-shrink-0">
                    {selectedMember.image ? (
                      <img 
                        src={selectedMember.image} 
                        alt={selectedMember.student.name}
                        className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl object-cover border border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {selectedMember.student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedMember.student.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <StatusBadge status={selectedMember.status} />
                      <DepartmentBadge department={selectedMember.department} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Admission: <span className="font-semibold text-gray-800">{selectedMember.student.admissionNumber}</span></p>
                        <p className="text-gray-600">Position: <span className="font-semibold text-gray-800">{getPositionLabel(selectedMember.position, selectedMember.department)}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Class: <span className="font-semibold text-gray-800">{selectedMember.student.form} {selectedMember.student.stream}</span></p>
                        <p className="text-gray-600">Gender: <span className="font-semibold text-gray-800">{selectedMember.student.gender}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Position Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiAward className="text-purple-500" />
                        Position Information
                      </h4>
                      <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-xl">
                        <p><span className="font-medium">Department:</span> {selectedMember.department}</p>
                        <p><span className="font-medium">Position:</span> {getPositionLabel(selectedMember.position, selectedMember.department)}</p>
                        <p><span className="font-medium">Start Date:</span> {new Date(selectedMember.startDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">End Date:</span> {selectedMember.endDate ? new Date(selectedMember.endDate).toLocaleDateString() : 'Present'}</p>
                        <p><span className="font-medium">Status:</span> {selectedMember.status}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiTarget className="text-purple-500" />
                        Responsibilities
                      </h4>
                      <div className="text-sm bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-800">{selectedMember.responsibilities}</p>
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiUser className="text-purple-500" />
                        Student Information
                      </h4>
                      <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-xl">
                        <p><span className="font-medium">Name:</span> {selectedMember.student.name}</p>
                        <p><span className="font-medium">Admission:</span> {selectedMember.student.admissionNumber}</p>
                        <p><span className="font-medium">Class:</span> {selectedMember.student.form} {selectedMember.student.stream}</p>
                        <p><span className="font-medium">Performance:</span> {selectedMember.student.academicPerformance}</p>
                      </div>
                    </div>

                    {selectedMember.achievements && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FiStar className="text-purple-500" />
                          Achievements
                        </h4>
                        <div className="text-sm bg-gray-50 p-4 rounded-xl">
                          <p className="text-gray-800">{selectedMember.achievements}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEdit(selectedMember);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Edit Member
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Council Member Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !submitting && setShowModal(false)}
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
                    {editingMember ? 'Edit Council Member' : 'Add Council Member'}
                  </h2>
                  <button
                    onClick={() => !submitting && setShowModal(false)}
                    disabled={submitting}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FiX className="text-xl text-gray-600" />
                  </button>
                </div>
              </div>

              {selectedStudent && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{selectedStudent.name}</h3>
                      <p className="text-gray-600">{selectedStudent.admissionNumber}</p>
                      <p className="text-gray-500">{selectedStudent.form} {selectedStudent.stream} • {selectedStudent.gender}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload Section */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiCamera className="text-purple-500" />
                    Council Member Photo
                  </h3>
                  
                  <div className="flex flex-col items-center gap-4">
                    {/* Image Preview */}
                    <div className="relative">
                      {imagePreview ? (
                        <>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 rounded-xl object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </>
                      ) : editingMember?.image ? (
                        <>
                          <img 
                            src={editingMember.image} 
                            alt="Current" 
                            className="w-32 h-32 rounded-xl object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </>
                      ) : (
                        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                          <FiImage className="text-2xl mb-2" />
                          <span className="text-xs text-center">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* File Input */}
                    <div className="text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                      >
                        <FiUpload className="text-sm" />
                        {imagePreview || editingMember?.image ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        JPEG, PNG, or WebP • Max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          department: e.target.value,
                          position: '' // Reset position when department changes
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {councilDepartments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      disabled={!formData.department}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Position</option>
                      {formData.department && councilPositions
                        .filter(pos => pos.department === formData.department)
                        .map(position => (
                          <option key={position.value} value={position.value}>
                            {position.label}
                          </option>
                        ))
                      }
                    </select>
                    {!formData.department && (
                      <p className="text-xs text-gray-500 mt-1">Please select a department first</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Responsibilities *
                    </label>
                    <textarea
                      required
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe the key responsibilities for this position..."
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Achievements (Optional)
                    </label>
                    <textarea
                      value={formData.achievements}
                      onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Notable achievements or qualifications..."
                    />
                  </div>

                  {editingMember && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingMember ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingMember ? 'Update Member' : 'Add to Council'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentCouncil;