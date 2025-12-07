'use client'

import { useState, useEffect } from 'react'
import { 
  FaUser, 
  FaCalendar, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaBook,
  FaSchool,
  FaGraduationCap,
  FaHeartbeat,
  FaRunning,
  FaMusic,
  FaEdit,
  FaEye,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSort,
  FaTimes,
  FaSpinner,
  FaPrint,
  FaDownload,
  FaShareAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaStar,
  FaChartBar,
  FaUsers,
  FaPlus,
  FaRedo,
  FaChevronRight,
  FaFileExport,
  FaFilterCircleDollar,
  FaFilterCircleXmark,
  FaEyeSlash,
  FaThumbsUp,
  FaThumbsDown,
  FaCrown,
  FaAward,
  FaMedal,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilePdf,
  FaFileExcel,
  FaClipboardList,
  FaClipboardCheck,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaMapPin,
  FaHome,
  FaBirthdayCake,
  FaVenusMars,
  FaGlobe,
  FaChalkboardTeacher,
  FaStethoscope,
  FaHeart,
  FaTrophy,
  FaCertificate,
  FaBrain,
  FaComments,
  FaInfoCircle,
  FaExclamationTriangle,
  FaBell,
  FaCalendarCheck,
  FaCalendarTimes,
  FaCalendarAlt
} from 'react-icons/fa'
import { toast } from 'sonner'

export default function ApplicationManager() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStream, setFilterStream] = useState('all')
  const [filterCounty, setFilterCounty] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState(null)
  const [applicationToUpdate, setApplicationToUpdate] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState(new Set())
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    interviewed: 0,
    byStream: {},
    byCounty: {}
  })

  // Stream data
  const streams = [
    { value: 'SCIENCE', label: 'Science', icon: '🔬', color: 'from-blue-500 to-cyan-500' },
    { value: 'ARTS', label: 'Arts', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { value: 'BUSINESS', label: 'Business', icon: '💼', color: 'from-green-500 to-emerald-500' },
    { value: 'TECHNICAL', label: 'Technical', icon: '⚙️', color: 'from-orange-500 to-red-500' }
  ]

  // Status options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', icon: FaHourglassHalf, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'UNDER_REVIEW', label: 'Under Review', icon: FaEye, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', icon: FaCalendarCheck, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { value: 'INTERVIEWED', label: 'Interviewed', icon: FaUserCheck, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'ACCEPTED', label: 'Accepted', icon: FaCheckCircle, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'CONDITIONAL_ACCEPTANCE', label: 'Conditional', icon: FaClipboardCheck, color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { value: 'WAITLISTED', label: 'Waitlisted', icon: FaUserClock, color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'REJECTED', label: 'Rejected', icon: FaTimesCircle, color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { value: 'WITHDRAWN', label: 'Withdrawn', icon: FaUserTimes, color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ]

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/applyadmission')
      const data = await response.json()
      
      if (data.success) {
        setApplications(data.applications)
        updateStats(data.applications)
      } else {
        toast.error('Failed to load applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setRefreshing(false)
    }
  }

  const updateStats = (apps) => {
    const stats = {
      total: apps.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      interviewed: 0,
      byStream: {},
      byCounty: {}
    }

    apps.forEach(app => {
      // Status counts
      if (app.status === 'PENDING') stats.pending++
      if (app.status === 'ACCEPTED') stats.accepted++
      if (app.status === 'REJECTED') stats.rejected++
      if (app.status === 'INTERVIEWED') stats.interviewed++

      // Stream distribution
      stats.byStream[app.preferredStream] = (stats.byStream[app.preferredStream] || 0) + 1

      // County distribution
      stats.byCounty[app.county] = (stats.byCounty[app.county] || 0) + 1
    })

    setStats(stats)
  }

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = 
        app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone?.includes(searchTerm) ||
        app.applicationNumber?.includes(searchTerm)
      
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus
      const matchesStream = filterStream === 'all' || app.preferredStream === filterStream
      const matchesCounty = filterCounty === 'all' || app.county === filterCounty
      
      return matchesSearch && matchesStatus && matchesStream && matchesCounty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        case 'score-high':
          return (b.kcpeMarks || 0) - (a.kcpeMarks || 0)
        case 'score-low':
          return (a.kcpeMarks || 0) - (b.kcpeMarks || 0)
        default:
          return 0
      }
    })

  const viewApplicationDetails = async (application) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applyadmission/${application._id}`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedApplication(data.application)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load application details')
      }
    } catch (error) {
      console.error('Error fetching application details:', error)
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (application) => {
    setApplicationToDelete(application)
    setShowDeleteModal(true)
  }

  const deleteApplication = async () => {
    if (!applicationToDelete) return

    try {
      const response = await fetch(`/api/applyadmission/${applicationToDelete._id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Application deleted successfully')
        setApplications(applications.filter(app => app._id !== applicationToDelete._id))
        updateStats(applications.filter(app => app._id !== applicationToDelete._id))
        setShowDeleteModal(false)
        setApplicationToDelete(null)
      } else {
        toast.error(data.error || 'Failed to delete application')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const openStatusUpdate = (application) => {
    setApplicationToUpdate(application)
    setNewStatus(application.status)
    setShowStatusModal(true)
  }

  const updateApplicationStatus = async () => {
    if (!applicationToUpdate || !newStatus) return

    try {
      const response = await fetch(`/api/applyadmission/${applicationToUpdate._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Application status updated successfully')
        setApplications(applications.map(app => 
          app._id === applicationToUpdate._id ? { ...app, status: newStatus } : app
        ))
        updateStats(applications.map(app => 
          app._id === applicationToUpdate._id ? { ...app, status: newStatus } : app
        ))
        setShowStatusModal(false)
        setApplicationToUpdate(null)
        setNewStatus('')
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const toggleSelectApplication = (applicationId) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId)
    } else {
      newSelected.add(applicationId)
    }
    setSelectedApplications(newSelected)
  }

  const selectAllApplications = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set())
    } else {
      const allIds = new Set(filteredApplications.map(app => app._id))
      setSelectedApplications(allIds)
    }
  }

  const deleteSelectedApplications = async () => {
    if (selectedApplications.size === 0) return

    try {
      const response = await fetch('/api/applyadmission/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationIds: Array.from(selectedApplications) }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Deleted ${selectedApplications.size} application(s)`)
        setApplications(applications.filter(app => !selectedApplications.has(app._id)))
        updateStats(applications.filter(app => !selectedApplications.has(app._id)))
        setSelectedApplications(new Set())
        setShowBulkActions(false)
      } else {
        toast.error(data.error || 'Failed to delete applications')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const updateSelectedApplicationsStatus = async (status) => {
    if (selectedApplications.size === 0) return

    try {
      const response = await fetch('/api/applyadmission/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationIds: Array.from(selectedApplications),
          status: status 
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Updated ${selectedApplications.size} application(s) to ${status}`)
        setApplications(applications.map(app => 
          selectedApplications.has(app._id) ? { ...app, status } : app
        ))
        updateStats(applications.map(app => 
          selectedApplications.has(app._id) ? { ...app, status } : app
        ))
        setSelectedApplications(new Set())
        setShowBulkActions(false)
      } else {
        toast.error(data.error || 'Failed to update applications')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const exportApplications = async (format) => {
    try {
      const response = await fetch('/api/applyadmission/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationIds: Array.from(selectedApplications),
          format: format 
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `applications-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success(`Exported ${selectedApplications.size} application(s)`)
      } else {
        toast.error('Failed to export applications')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0]
    const Icon = statusConfig.icon
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
        <Icon className="text-xs" />
        {statusConfig.label}
      </span>
    )
  }

  const getStreamBadge = (streamValue) => {
    const stream = streams.find(s => s.value === streamValue) || streams[0]
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200">
        <span>{stream.icon}</span>
        {stream.label}
      </span>
    )
  }

  const getApplicationScore = (application) => {
    // Calculate a score based on various factors
    let score = 0
    
    // KCPE Marks (max 500)
    if (application.kcpeMarks) {
      score += (application.kcpeMarks / 500) * 40 // 40% weight
    }
    
    // Previous school performance
    if (application.previousClass === 'Class 8') score += 10
    if (application.meanGrade === 'A' || application.meanGrade === 'A-') score += 20
    
    // Extracurricular activities
    const hasExtracurricular = application.sportsInterests || application.clubsInterests || application.talents
    if (hasExtracurricular) score += 10
    
    // Complete application
    const completeFields = ['fatherName', 'motherName', 'medicalCondition', 'bloodGroup']
    const completed = completeFields.filter(field => application[field]).length
    score += (completed / completeFields.length) * 20
    
    return Math.min(100, Math.round(score))
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-green-500'
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (score >= 40) return 'bg-gradient-to-r from-amber-500 to-orange-500'
    return 'bg-gradient-to-r from-rose-500 to-red-500'
  }

  const getScoreBadge = (score) => {
    if (score >= 90) return { icon: FaCrown, label: 'Excellent', color: 'text-yellow-500' }
    if (score >= 80) return { icon: FaAward, label: 'Outstanding', color: 'text-purple-500' }
    if (score >= 70) return { icon: FaMedal, label: 'Very Good', color: 'text-blue-500' }
    if (score >= 60) return { icon: FaStar, label: 'Good', color: 'text-emerald-500' }
    if (score >= 50) return { icon: FaThumbsUp, label: 'Average', color: 'text-amber-500' }
    return { icon: FaThumbsDown, label: 'Needs Review', color: 'text-rose-500' }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100">
              <FaUsers className="text-blue-600 text-lg" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-emerald-900 bg-clip-text text-transparent">
              Admission Applications Manager
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Manage and review student admission applications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchApplications}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xs border border-gray-200 font-medium cursor-pointer disabled:opacity-50"
          >
            <FaRedo className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium cursor-pointer"
          >
            <FaClipboardList className="text-sm" />
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { 
            label: 'Total Applications', 
            value: stats.total, 
            icon: FaUsers, 
            color: 'blue',
            change: `${stats.total} students`
          },
          { 
            label: 'Pending Review', 
            value: stats.pending,
            icon: FaHourglassHalf, 
            color: 'yellow',
            change: `${Math.round((stats.pending / stats.total) * 100) || 0}% of total`
          },
          { 
            label: 'Accepted', 
            value: stats.accepted,
            icon: FaCheckCircle, 
            color: 'emerald',
            change: `${Math.round((stats.accepted / stats.total) * 100) || 0}% acceptance rate`
          },
          { 
            label: 'Interviews', 
            value: stats.interviewed,
            icon: FaUserCheck, 
            color: 'purple',
            change: `${stats.interviewed} completed`
          },
          { 
            label: 'Avg Score', 
            value: applications.length > 0 ? 
              Math.round(applications.reduce((acc, app) => acc + getApplicationScore(app), 0) / applications.length) : 0,
            icon: FaChartBar, 
            color: 'indigo',
            change: 'Overall application quality'
          }
        ].map((stat, index) => (
          <div 
            key={stat.label}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-200/60 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-50 rounded-xl`}>
                <stat.icon className={`text-${stat.color}-600 text-lg`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stream Distribution */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-200/60 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChalkboardTeacher className="text-blue-500" />
          Stream Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {streams.map(stream => {
            const count = stats.byStream[stream.value] || 0
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
            
            return (
              <div key={stream.value} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{stream.icon}</span>
                    <span className="font-semibold text-gray-800">{stream.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">{percentage}% of applications</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaClipboardList className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Bulk Actions</h4>
                <p className="text-sm text-blue-700">
                  {selectedApplications.size} application(s) selected
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={selectAllApplications}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                {selectedApplications.size === filteredApplications.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <select 
                onChange={(e) => updateSelectedApplicationsStatus(e.target.value)}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                <option value="">Update Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    Set to {status.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => exportApplications('pdf')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                <FaFilePdf className="text-sm" />
                Export PDF
              </button>
              
              <button
                onClick={() => exportApplications('excel')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                <FaFileExcel className="text-sm" />
                Export Excel
              </button>
              
              <button
                onClick={deleteSelectedApplications}
                disabled={selectedApplications.size === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTrash className="text-sm" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-200/60 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or application number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <select 
              value={filterStream}
              onChange={(e) => setFilterStream(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
            >
              <option value="all">All Streams</option>
              {streams.map(stream => (
                <option key={stream.value} value={stream.value}>{stream.label}</option>
              ))}
            </select>
            
            <select 
              value={filterCounty}
              onChange={(e) => setFilterCounty(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
            >
              <option value="all">All Counties</option>
              {Array.from(new Set(applications.map(app => app.county))).sort().map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="score-high">Highest Score</option>
              <option value="score-low">Lowest Score</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all duration-200 text-sm cursor-pointer"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && applicationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-500 text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Application
                </h4>
                <p className="text-gray-600">
                  Are you sure you want to delete the application for <strong>{applicationToDelete.firstName} {applicationToDelete.lastName}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition duration-200 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteApplication}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition duration-200 cursor-pointer font-medium"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && applicationToUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Update Application Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Updating status for <strong>{applicationToUpdate.firstName} {applicationToUpdate.lastName}</strong>
                </p>
                
                <div className="space-y-3">
                  {statusOptions.map(status => (
                    <label key={status.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={newStatus === status.value}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className={`p-2 rounded-lg ${status.color.split(' ')[0]}`}>
                        <status.icon className="text-sm" />
                      </div>
                      <span className="font-medium">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition duration-200 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateApplicationStatus}
                  disabled={!newStatus}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition duration-200 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Application Modal */}
      {showViewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </h3>
                <p className="text-gray-600 mt-1">
                  Application #{selectedApplication.applicationNumber} • 
                  Submitted {new Date(selectedApplication.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium cursor-pointer"
                >
                  <FaPrint className="text-sm" />
                  Print
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Application Score */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Application Score</h4>
                    <p className="text-blue-700">
                      Based on academic performance and application completeness
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-900 mb-1">
                      {getApplicationScore(selectedApplication)}
                      <span className="text-2xl text-blue-700">/100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreColor(getApplicationScore(selectedApplication))}`}
                          style={{ width: `${getApplicationScore(selectedApplication)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-700">
                        {getScoreBadge(getApplicationScore(selectedApplication)).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaUser className="text-blue-500" />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaVenusMars className="text-gray-400" />
                        <span className="text-gray-700">Gender: <strong>{selectedApplication.gender}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaBirthdayCake className="text-gray-400" />
                        <span className="text-gray-700">
                          Date of Birth: <strong>{selectedApplication.dateOfBirth}</strong> 
                          ({calculateAge(selectedApplication.dateOfBirth)} years)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaGlobe className="text-gray-400" />
                        <span className="text-gray-700">Nationality: <strong>{selectedApplication.nationality}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaGraduationCap className="text-blue-500" />
                      Academic Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaSchool className="text-gray-400" />
                        <span className="text-gray-700">Previous School: <strong>{selectedApplication.previousSchool}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaBook className="text-gray-400" />
                        <span className="text-gray-700">Previous Class: <strong>{selectedApplication.previousClass}</strong></span>
                      </div>
                      {selectedApplication.kcpeMarks && (
                        <div className="flex items-center gap-3">
                          <FaCertificate className="text-gray-400" />
                          <span className="text-gray-700">KCPE Marks: <strong>{selectedApplication.kcpeMarks}/500</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <FaChalkboardTeacher className="text-gray-400" />
                        <span className="text-gray-700">Preferred Stream: <strong>{getStreamBadge(selectedApplication.preferredStream)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaEnvelope className="text-blue-500" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-gray-700">Email: <strong>{selectedApplication.email}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaPhone className="text-gray-400" />
                        <span className="text-gray-700">Phone: <strong>{selectedApplication.phone}</strong></span>
                      </div>
                      {selectedApplication.alternativePhone && (
                        <div className="flex items-center gap-3">
                          <FaPhone className="text-gray-400" />
                          <span className="text-gray-700">Alt Phone: <strong>{selectedApplication.alternativePhone}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <FaHome className="text-gray-400" />
                        <span className="text-gray-700">Postal Address: <strong>{selectedApplication.postalAddress}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaMapPin className="text-blue-500" />
                      Location Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-700">County: <strong>{selectedApplication.county}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-700">Constituency: <strong>{selectedApplication.constituency}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-700">Ward: <strong>{selectedApplication.ward}</strong></span>
                      </div>
                      {selectedApplication.village && (
                        <div className="flex items-center gap-3">
                          <FaHome className="text-gray-400" />
                          <span className="text-gray-700">Village: <strong>{selectedApplication.village}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-500" />
                  Parent/Guardian Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-700 mb-2">Father's Information</h5>
                    {selectedApplication.fatherName && (
                      <p className="text-gray-600">Name: <strong>{selectedApplication.fatherName}</strong></p>
                    )}
                    {selectedApplication.fatherPhone && (
                      <p className="text-gray-600">Phone: <strong>{selectedApplication.fatherPhone}</strong></p>
                    )}
                    {selectedApplication.fatherOccupation && (
                      <p className="text-gray-600">Occupation: <strong>{selectedApplication.fatherOccupation}</strong></p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-700 mb-2">Mother's Information</h5>
                    {selectedApplication.motherName && (
                      <p className="text-gray-600">Name: <strong>{selectedApplication.motherName}</strong></p>
                    )}
                    {selectedApplication.motherPhone && (
                      <p className="text-gray-600">Phone: <strong>{selectedApplication.motherPhone}</strong></p>
                    )}
                    {selectedApplication.motherOccupation && (
                      <p className="text-gray-600">Occupation: <strong>{selectedApplication.motherOccupation}</strong></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical & Interests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaHeartbeat className="text-blue-500" />
                    Medical Information
                  </h4>
                  <div className="space-y-3">
                    {selectedApplication.medicalCondition ? (
                      <p className="text-gray-600">Conditions: <strong>{selectedApplication.medicalCondition}</strong></p>
                    ) : (
                      <p className="text-gray-500 italic">No medical conditions reported</p>
                    )}
                    {selectedApplication.allergies ? (
                      <p className="text-gray-600">Allergies: <strong>{selectedApplication.allergies}</strong></p>
                    ) : (
                      <p className="text-gray-500 italic">No allergies reported</p>
                    )}
                    {selectedApplication.bloodGroup && (
                      <p className="text-gray-600">Blood Group: <strong>{selectedApplication.bloodGroup}</strong></p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaTrophy className="text-blue-500" />
                    Talents & Interests
                  </h4>
                  <div className="space-y-3">
                    {selectedApplication.sportsInterests && (
                      <div className="flex items-center gap-3">
                        <FaRunning className="text-gray-400" />
                        <span className="text-gray-600">Sports: <strong>{selectedApplication.sportsInterests}</strong></span>
                      </div>
                    )}
                    {selectedApplication.clubsInterests && (
                      <div className="flex items-center gap-3">
                        <FaBrain className="text-gray-400" />
                        <span className="text-gray-600">Clubs: <strong>{selectedApplication.clubsInterests}</strong></span>
                      </div>
                    )}
                    {selectedApplication.talents && (
                      <div className="flex items-center gap-3">
                        <FaMusic className="text-gray-400" />
                        <span className="text-gray-600">Talents: <strong>{selectedApplication.talents}</strong></span>
                      </div>
                    )}
                    {!selectedApplication.sportsInterests && !selectedApplication.clubsInterests && !selectedApplication.talents && (
                      <p className="text-gray-500 italic">No interests specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => openStatusUpdate(selectedApplication)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium cursor-pointer"
                >
                  <FaEdit className="text-sm" />
                  Update Status
                </button>
                <button
                  onClick={() => confirmDelete(selectedApplication)}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-medium cursor-pointer"
                >
                  <FaTrash className="text-sm" />
                  Delete Application
                </button>
                <button
                  onClick={() => window.open(`/admissions/print/${selectedApplication._id}`, '_blank')}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium cursor-pointer"
                >
                  <FaPrint className="text-sm" />
                  Print Full Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-200/60">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {searchTerm || filterStatus !== 'all' || filterStream !== 'all' || filterCounty !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No applications have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredApplications.map((application) => {
              const score = getApplicationScore(application)
              const scoreBadge = getScoreBadge(score)
              const Icon = scoreBadge.icon
              
              return (
                <div 
                  key={application._id} 
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-200/60 p-6 hover:shadow-md transition-all duration-300 hover:border-gray-300/60 cursor-default"
                >
                  {/* Selection Checkbox */}
                  {showBulkActions && (
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(application._id)}
                          onChange={() => toggleSelectApplication(application._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Select for bulk action</span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <FaUser className="text-white text-lg" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getScoreColor(score)} rounded-full flex items-center justify-center`}>
                            <Icon className="text-white text-xs" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                            {application.firstName} {application.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {calculateAge(application.dateOfBirth)} years • {application.gender}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(application.status)}
                          {getStreamBadge(application.preferredStream)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaEnvelope className="text-gray-400" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaPhone className="text-gray-400" />
                            <span>{application.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>{application.county}, {application.constituency}</span>
                        </div>
                        
                        {application.kcpeMarks && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-700">KCPE:</span>
                            <span className="text-gray-600">{application.kcpeMarks}/500</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                style={{ width: `${(application.kcpeMarks / 500) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Application Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Application Score</span>
                      <span className="text-lg font-bold text-gray-900">{score}/100</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(score)}`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{scoreBadge.label}</span>
                      <span className="text-xs text-gray-500">
                        {application.kcpeMarks ? `KCPE: ${application.kcpeMarks}` : 'No KCPE'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => viewApplicationDetails(application)}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium cursor-pointer flex-1"
                    >
                      <FaEye className="text-sm" />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => openStatusUpdate(application)}
                      className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-all duration-200 text-sm font-medium cursor-pointer flex-1"
                    >
                      <FaEdit className="text-sm" />
                      Update Status
                    </button>
                    
                    <button
                      onClick={() => confirmDelete(application)}
                      className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium cursor-pointer"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>

                  {/* Application Metadata */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-xs" />
                      {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaInfoCircle className="text-xs" />
                      #{application.applicationNumber}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}