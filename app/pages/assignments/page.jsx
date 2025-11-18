'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiCalendar,
  FiBook,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiEye,
  FiEdit,
  FiUpload,
  FiBarChart2,
  FiAward,
  FiTrendingUp,
  FiX,
  FiTarget,
  FiFileText,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { 
  IoSparkles,
  IoDocumentText,
  IoTime,
  IoCheckmarkDone
} from 'react-icons/io5';

const API_BASE_URL = '/api/assignment';

export default function StudentAssignmentPortal() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [allAssignments, setAllAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const assignmentsPerPage = 4;

  useEffect(() => {
    setIsClient(true);
    fetchAllAssignments();
  }, []);

  const fetchAllAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAllAssignments(data.assignments || []);
      } else {
        throw new Error(data.error || 'Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
      setAllAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allAssignments.length === 0) return;

    let filtered = [...allAssignments];

    if (selectedClass !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.className === selectedClass
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.subject === selectedSubject
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.status === selectedStatus
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(searchLower) ||
        assignment.teacher.toLowerCase().includes(searchLower) ||
        assignment.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssignments(filtered);
    setCurrentPage(1);
  }, [allAssignments, selectedClass, selectedSubject, selectedStatus, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not provided';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      const pad = (n) => String(n).padStart(2, '0');
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateStr;
    }
  };

  const downloadFile = async (filePath) => {
    try {
      const fullUrl = filePath.startsWith('http') 
        ? filePath 
        : `${window.location.origin}${filePath}`;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const filename = filePath.split('/').pop() || 'download';
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert(`Failed to download file: ${err.message}`);
    }
  };

  const downloadAllFiles = async (assignment) => {
    const allFiles = [
      ...(assignment.assignmentFiles || []),
      ...(assignment.attachments || [])
    ];
    
    if (allFiles.length === 0) {
      alert('No files available for download');
      return;
    }
    
    for (const filePath of allFiles) {
      await downloadFile(filePath);
    }
  };

  const classes = ['all', 'Grade 9A', 'Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B', 'Grade 11C', 'Grade 12A', 'Grade 12C'];
  const subjects = ['all', 'Mathematics', 'Science', 'English', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography', 'Music', 'Art', 'Computer Science'];
  const statuses = ['all', 'assigned', 'reviewed', 'extended'];

  const indexOfLastAssignment = currentPage * assignmentsPerPage;
  const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment);
  const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const assignmentsSection = document.getElementById('assignments-section');
    if (assignmentsSection) {
      window.scrollTo({
        top: assignmentsSection.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewed': return 'from-green-500 to-emerald-500';
      case 'assigned': return 'from-blue-500 to-cyan-500';
      case 'extended': return 'from-orange-500 to-amber-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reviewed': return <IoCheckmarkDone className="text-white" />;
      case 'assigned': return <IoTime className="text-white" />;
      case 'extended': return <FiAlertCircle className="text-white" />;
      default: return <FiClock className="text-white" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const clearFilters = () => {
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedStatus('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getLearningObjectives = (assignment) => {
    if (!assignment.learningObjectives) return [];
    if (Array.isArray(assignment.learningObjectives)) return assignment.learningObjectives;
    try {
      if (typeof assignment.learningObjectives === 'string') {
        return JSON.parse(assignment.learningObjectives);
      }
      return [];
    } catch {
      return [];
    }
  };

  const getAssignmentFiles = (assignment) => {
    if (!assignment.assignmentFiles) return [];
    if (Array.isArray(assignment.assignmentFiles)) return assignment.assignmentFiles;
    try {
      if (typeof assignment.assignmentFiles === 'string') {
        return JSON.parse(assignment.assignmentFiles);
      }
      return [];
    } catch {
      return [];
    }
  };

  const getAttachments = (assignment) => {
    if (!assignment.attachments) return [];
    if (Array.isArray(assignment.attachments)) return assignment.attachments;
    try {
      if (typeof assignment.attachments === 'string') {
        return JSON.parse(assignment.attachments);
      }
      return [];
    } catch {
      return [];
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-xl">Loading Assignment Portal...</p>
        </div>
      </div>
    );
  }

  if (loading && allAssignments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-xl">Loading Assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Assignments</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={() => fetchAllAssignments()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-20 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <section className="relative py-16 z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 border border-white/20 backdrop-blur-sm"
            >
              <IoSparkles className="text-yellow-400" />
              <span className="text-sm font-medium">Student Assignment Portal</span>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Assignment <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Viewer</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Access your assignments, view teacher instructions, download materials, and track deadlines in one place.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 pb-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {allAssignments.filter(a => a.status === 'assigned').length}
              </div>
              <div className="text-blue-300 font-semibold flex items-center justify-center gap-2">
                <IoTime className="text-lg" />
                Assigned
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {allAssignments.filter(a => a.status === 'reviewed').length}
              </div>
              <div className="text-green-300 font-semibold flex items-center justify-center gap-2">
                <IoCheckmarkDone className="text-lg" />
                Reviewed
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {allAssignments.filter(a => a.status === 'extended').length}
              </div>
              <div className="text-orange-300 font-semibold flex items-center justify-center gap-2">
                <FiAlertCircle className="text-lg" />
                Extended
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {allAssignments.length}
              </div>
              <div className="text-purple-300 font-semibold flex items-center justify-center gap-2">
                <IoDocumentText className="text-lg" />
                Total
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-xl" />
                <input
                  type="text"
                  placeholder="Search assignments by title or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              {(selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-2xl border border-white/20 transition-colors backdrop-blur-sm"
                >
                  <FiX className="text-lg" />
                  Clear Filters
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white/60 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiUser className="text-white/40" />
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls} className="bg-slate-800">
                      {cls === 'all' ? 'All Classes' : cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiBook className="text-white/40" />
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject} className="bg-slate-800">
                      {subject === 'all' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiCheckCircle className="text-white/40" />
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status} className="bg-slate-800">
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="assignments-section" className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex justify-between items-center"
          >
            <h2 className="text-2xl font-bold text-white">
              Your Assignments <span className="text-blue-400">({filteredAssignments.length})</span>
            </h2>
            <div className="text-white/60 text-sm">
              {selectedClass !== 'all' && `${selectedClass} • `}
              {selectedSubject !== 'all' && `${selectedSubject} • `}
              {selectedStatus !== 'all' && `${selectedStatus}`}
              {selectedClass === 'all' && selectedSubject === 'all' && selectedStatus === 'all' && 'All assignments'}
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
            >
              <FiBook className="text-6xl text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/80 mb-2">No assignments found</h3>
              <p className="text-white/60">Try adjusting your filters or search terms</p>
            </motion.div>
          ) : (
            <>
              <div className="grid gap-6 mb-8">
                {currentAssignments.map((assignment, index) => {
                  const assignmentFiles = getAssignmentFiles(assignment);
                  const attachments = getAttachments(assignment);
                  const learningObjectives = getLearningObjectives(assignment);
                  
                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:border-white/30 transition-all duration-300 group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(assignment.status)} text-white flex items-center gap-2`}>
                              {getStatusIcon(assignment.status)}
                              <span className="capitalize">{assignment.status}</span>
                            </div>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold border border-blue-500/30">
                              {assignment.className}
                            </span>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                              {assignment.subject}
                            </span>
                            {assignment.priority && (
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(assignment.priority)}`}>
                                {assignment.priority} priority
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                            {assignment.title}
                          </h3>
                          <p className="text-white/70 mb-4 leading-relaxed">{assignment.description || 'No description provided'}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-4">
                            <div className="flex items-center gap-2">
                              <FiUser className="text-white/40" />
                              <span>{assignment.teacher}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-white/40" />
                              <span>Assigned: {formatDate(assignment.dateAssigned)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-white/40" />
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            </div>
                            {assignment.estimatedTime && (
                              <div className="flex items-center gap-2">
                                <FiClock className="text-white/40" />
                                <span>{assignment.estimatedTime}</span>
                              </div>
                            )}
                          </div>

                          {assignment.teacherRemarks && (
                            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                              <div className="flex items-center gap-2 text-blue-300 mb-2">
                                <FiMessageSquare className="text-blue-400" />
                                <span className="font-semibold">Teacher's Remarks</span>
                              </div>
                              <p className="text-blue-200 text-sm">{assignment.teacherRemarks}</p>
                            </div>
                          )}

                          {assignmentFiles.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                                <FiFileText className="text-white/60" />
                                Assignment Files:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {assignmentFiles.map((file, fileIndex) => (
                                  <motion.button
                                    key={fileIndex}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => downloadFile(file)}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors text-sm border border-blue-500/30"
                                  >
                                    <FiDownload className="text-blue-400" />
                                    {file.split('/').pop()}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}

                          {assignment.additionalWork && (
                            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                              <div className="flex items-center gap-2 text-green-300 mb-2">
                                <FiTrendingUp className="text-green-400" />
                                <span className="font-semibold">Additional Work</span>
                              </div>
                              <p className="text-green-200 text-sm">{assignment.additionalWork}</p>
                            </div>
                          )}

                          {assignment.feedback && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                              <div className="flex items-center gap-3 text-green-300">
                                <FiCheckCircle className="text-green-400 text-lg" />
                                <div>
                                  <span className="font-semibold">Reviewed</span>
                                </div>
                              </div>
                              <p className="text-green-200 text-sm mt-2">{assignment.feedback}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedAssignment(assignment)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap border border-white/20"
                          >
                            <FiEye className="text-lg" />
                            View Details
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => downloadAllFiles(assignment)}
                            className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2"
                          >
                            <FiDownload className="text-lg" />
                            Download All
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center items-center gap-4 mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  >
                    <FiChevronLeft className="text-lg" />
                    Previous
                  </motion.button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  >
                    Next
                    <FiChevronRight className="text-lg" />
                  </motion.button>

                  <div className="text-white/60 text-sm ml-4">
                    Page {currentPage} of {totalPages}
                  </div>
                </motion.div>
              )}

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-4 text-white/50 text-sm"
                >
                  <FiChevronDown className="inline mr-2 animate-bounce" />
                  Use pagination to view all {filteredAssignments.length} assignments
                  <FiChevronDown className="inline ml-2 animate-bounce" />
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur-md border-b border-white/20 p-6 flex items-center justify-between">
                <h3 className="text-3xl font-bold text-white">{selectedAssignment.title}</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <FiX className="text-2xl text-white/80 hover:text-white" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <h4 className="text-white/60 text-sm mb-2">Subject</h4>
                    <p className="text-white font-semibold text-lg">{selectedAssignment.subject}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <h4 className="text-white/60 text-sm mb-2">Class</h4>
                    <p className="text-white font-semibold text-lg">{selectedAssignment.className}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <h4 className="text-white/60 text-sm mb-2">Teacher</h4>
                    <p className="text-white font-semibold text-lg">{selectedAssignment.teacher}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <h4 className="text-white/60 text-sm mb-2">Status</h4>
                    <p className="text-white font-semibold text-lg capitalize">{selectedAssignment.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-white/60 text-sm mb-2">Date Assigned</h4>
                    <p className="text-white font-semibold">{formatDate(selectedAssignment.dateAssigned)}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-white/60 text-sm mb-2">Due Date</h4>
                    <p className="text-white font-semibold">{formatDate(selectedAssignment.dueDate)}</p>
                  </div>
                </div>

                {(() => {
                  const learningObjectives = getLearningObjectives(selectedAssignment);
                  return learningObjectives.length > 0 && (
                    <div>
                      <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                        <FiTarget className="text-blue-400" />
                        Learning Objectives
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                            <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-white text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                    <FiFileText className="text-blue-400" />
                    Assignment Description
                  </h4>
                  <p className="text-white leading-relaxed text-lg bg-white/5 p-6 rounded-2xl border border-white/10">
                    {selectedAssignment.description || 'No description provided'}
                  </p>
                </div>

                {selectedAssignment.instructions && (
                  <div>
                    <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                      <FiEdit className="text-green-400" />
                      Detailed Instructions
                    </h4>
                    <p className="text-white leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
                      {selectedAssignment.instructions}
                    </p>
                  </div>
                )}

                {selectedAssignment.teacherRemarks && (
                  <div>
                    <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                      <FiMessageSquare className="text-yellow-400" />
                      Teacher's Special Remarks
                    </h4>
                    <p className="text-yellow-200 leading-relaxed bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20 text-lg">
                      {selectedAssignment.teacherRemarks}
                    </p>
                  </div>
                )}

                {selectedAssignment.additionalWork && (
                  <div>
                    <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                      <FiTrendingUp className="text-green-400" />
                      Additional Work & Extensions
                    </h4>
                    <p className="text-green-200 leading-relaxed bg-green-500/10 p-6 rounded-2xl border border-green-500/20 text-lg">
                      {selectedAssignment.additionalWork}
                    </p>
                  </div>
                )}

                {(() => {
                  const assignmentFiles = getAssignmentFiles(selectedAssignment);
                  return assignmentFiles.length > 0 && (
                    <div>
                      <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                        <FiDownload className="text-purple-400" />
                        Download Assignment Files
                      </h4>
                      <div className="grid gap-3">
                        {assignmentFiles.map((file, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => downloadFile(file)}
                            className="flex items-center justify-between gap-4 px-6 py-4 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-colors text-base border border-white/20 w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <FiDownload className="text-purple-400 text-lg" />
                              <span className="font-medium">{file.split('/').pop()}</span>
                            </div>
                            <span className="text-white/60 text-sm">Click to download</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const attachments = getAttachments(selectedAssignment);
                  return attachments.length > 0 && (
                    <div>
                      <h4 className="text-white/60 text-lg mb-4 flex items-center gap-2">
                        <FiFileText className="text-blue-400" />
                        Additional Attachments
                      </h4>
                      <div className="grid gap-3">
                        {attachments.map((file, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => downloadFile(file)}
                            className="flex items-center justify-between gap-4 px-6 py-4 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-colors text-base border border-white/20 w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <FiDownload className="text-blue-400 text-lg" />
                              <span className="font-medium">{file.split('/').pop()}</span>
                            </div>
                            <span className="text-white/60 text-sm">Click to download</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {selectedAssignment.feedback && (
                  <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <h4 className="text-green-300 font-semibold text-xl mb-4 flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      Teacher Feedback
                    </h4>
                    <p className="text-green-200 text-lg leading-relaxed">{selectedAssignment.feedback}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-white/20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadAllFiles(selectedAssignment)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <FiDownload className="text-xl" />
                    Download All Files
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3 border border-white/20"
                  >
                    <FiX className="text-xl" />
                    Close Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}