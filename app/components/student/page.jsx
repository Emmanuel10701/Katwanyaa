'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import {
  FaUpload, FaFileExcel, FaFileCsv, FaDownload, FaUsers,
  FaUserGraduate, FaChalkboardTeacher, FaSchool, FaFilter,
  FaSearch, FaEye, FaEdit, FaTrash, FaSync, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaChartBar, FaChartPie,
  FaChartLine, FaCalendar, FaEnvelope, FaPhone, FaUser,
  FaGraduationCap, FaBuilding, FaUniversity, FaMapMarkerAlt,
  FaClock, FaArrowRight, FaArrowLeft, FaPlus, FaSave,
  FaTimes, FaList, FaTh, FaChevronDown, FaChevronUp,
  FaExternalLinkAlt, FaFile, FaFilePdf, FaFileWord,
  FaInfoCircle, FaArrowDown, FaArrowUp, FaSort,
  FaSortUp, FaSortDown, FaCog, FaHistory
} from 'react-icons/fa';
import {
  FiUpload, FiDownload, FiUsers, FiUser, FiEdit,
  FiTrash2, FiEye, FiSearch, FiFilter, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiCalendar, FiMail,
  FiPhone, FiSave, FiX, FiList, FiGrid, FiPlus
} from 'react-icons/fi';
import { CircularProgress, Modal, Box, TextField } from '@mui/material';
import * as XLSX from 'xlsx';

// Reuse the ModernLoadingSpinner from School Info
function ModernLoadingSpinner({ message = "Loading student data...", size = "medium" }) {
  const sizes = {
    small: { outer: 48, inner: 24 },
    medium: { outer: 64, inner: 32 },
    large: { outer: 80, inner: 40 }
  }

  const { outer, inner } = sizes[size]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="relative">
            <CircularProgress 
              size={outer} 
              thickness={5}
              className="text-indigo-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full animate-ping opacity-25"
                   style={{ width: inner, height: inner }}></div>
            </div>
          </div>
          <div className="absolute -inset-6 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full blur-xl opacity-30 animate-pulse"></div>
        </div>
        
        <div className="mt-6 space-y-3">
          <span className="block text-lg font-semibold text-gray-800">
            {message}
          </span>
          
          <div className="flex justify-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" 
                   style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
          
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch student records
          </p>
        </div>
      </div>
    </div>
  )
}

// Modern Delete Confirmation Modal (Enhanced from School Info)
function ModernDeleteModal({ 
  onClose, 
  onConfirm, 
  loading, 
  title = "Confirm Deletion",
  description = "This action cannot be undone",
  itemName = "",
  type = "student"
}) {
  const [confirmText, setConfirmText] = useState('')

  const getConfirmPhrase = () => {
    if (type === "batch") return "DELETE UPLOAD BATCH";
    if (type === "student") return "DELETE STUDENT";
    return "DELETE";
  }

  const handleConfirm = () => {
    const phrase = getConfirmPhrase();
    if (confirmText === phrase) {
      onConfirm()
    } else {
      toast.error(`Please type "${phrase}" exactly to confirm deletion`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <FaExclamationTriangle className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-red-100 opacity-90 text-xs mt-0.5">{description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2 border border-red-200">
              <FaTrash className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Delete {itemName ? `"${itemName}"` : `this ${type}`}?
            </h3>
            <p className="text-gray-600 text-xs">
              This will permanently delete the record and cannot be recovered.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Type <span className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">{getConfirmPhrase()}</span> to confirm:
            </label>
            <input 
              type="text" 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value)} 
              placeholder={`Type "${getConfirmPhrase()}" here`}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 text-sm"
            />
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-2 border border-red-200">
            <h4 className="font-bold text-gray-900 text-xs mb-1 flex items-center gap-1">
              <FaExclamationTriangle className="text-red-600 text-xs" />
              What will happen:
            </h4>
            <div className="space-y-0.5 text-xs text-gray-700">
              {type === "batch" ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    <span>All students from this upload batch will be deleted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    <span>Upload record will be removed from history</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    <span>Student record will be permanently deleted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    <span>All associated data will be removed</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-3 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-bold disabled:opacity-50 cursor-pointer text-sm"
          >
            <FaTimesCircle className="text-sm" /> Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading || confirmText !== getConfirmPhrase()}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 rounded-lg transition-all duration-300 font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <CircularProgress size={12} className="text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FaTrash /> Delete Forever
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modern File Upload Component
function ModernFileUpload({ onFileSelect, file, onRemove, dragActive, onDrag }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsm'];
    
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase();
      if (validExtensions.some(valid => ext.endsWith(valid))) {
        onFileSelect(selectedFile);
        toast.success('File selected successfully');
      } else {
        toast.error('Please upload a CSV or Excel file');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
        dragActive 
          ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 ring-4 ring-blue-50' 
          : 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-sm'
      }`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={(e) => {
        e.preventDefault();
        onDrag(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) handleFileChange({ target: { files } });
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="relative">
        <FaUpload className={`mx-auto text-2xl mb-2 transition-all duration-300 ${
          dragActive ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-500'
        }`} />
      </div>
      <p className="text-gray-700 mb-1 font-medium transition-colors duration-300 group-hover:text-gray-800 text-sm">
        {dragActive ? '📁 Drop file here!' : file ? 'Click to replace file' : 'Drag & drop or click to upload'}
      </p>
      <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
        CSV, Excel (.xlsx, .xls) • Max 10MB
      </p>
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".csv,.xlsx,.xls,.xlsm"
        onChange={handleFileChange}
        className="hidden" 
      />
    </div>
  );
}

// Modern Student Detail Modal
function ModernStudentDetailModal({ student, onClose, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFormColor = (form) => {
    switch (form) {
      case 'Form 1': return 'from-blue-500 to-blue-600';
      case 'Form 2': return 'from-emerald-500 to-emerald-600';
      case 'Form 3': return 'from-amber-500 to-amber-600';
      case 'Form 4': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '800px',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaUserGraduate className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Student Details</h2>
                <p className="text-blue-100 opacity-90 text-xs mt-0.5">
                  View and manage student information
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 cursor-pointer">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {/* Student Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 flex items-center justify-center shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                <FaUser className="text-white text-3xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}
                </h3>
                <p className="text-slate-600 text-sm font-medium">Admission #{student.admissionNumber}</p>
              </div>
              <div className={`px-4 py-2 bg-gradient-to-r ${getFormColor(student.form)} text-white rounded-xl font-bold text-sm`}>
                {student.form}
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Academic Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaGraduationCap className="text-blue-600" />
                Academic Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Form Level</span>
                  <span className="font-bold text-gray-900">{student.form}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stream</span>
                  <span className="font-bold text-gray-900">{student.stream || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-emerald-600" />
                Personal Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gender</span>
                  <span className="font-bold text-gray-900">{student.gender || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date of Birth</span>
                  <span className="font-bold text-gray-900">{formatDate(student.dateOfBirth)}</span>
                </div>
                {student.age && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Age</span>
                    <span className="font-bold text-gray-900">{student.age} years</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaEnvelope className="text-purple-600" />
                Contact Information
              </h4>
              <div className="space-y-3">
                {student.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">{student.email}</span>
                  </div>
                )}
                {student.parentPhone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{student.parentPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Info */}
            {student.uploadBatch && (
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaHistory className="text-amber-600" />
                  Upload Information
                </h4>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Uploaded via</p>
                    <p className="font-medium text-gray-900">{student.uploadBatch.fileName}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Upload Date</p>
                    <p className="font-medium text-gray-900">{formatDate(student.uploadBatch.uploadDate)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold shadow"
            >
              <FaEdit /> Edit Student
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold shadow"
            >
              <FaTrash /> Delete Student
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// Modern Student Edit Modal
function ModernStudentEditModal({ student, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    middleName: student?.middleName || '',
    lastName: student?.lastName || '',
    admissionNumber: student?.admissionNumber || '',
    form: student?.form || 'Form 1',
    stream: student?.stream || '',
    gender: student?.gender || '',
    dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
    email: student?.email || '',
    parentPhone: student?.parentPhone || '',
    status: student?.status || 'active'
  });

  const FORMS = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  const STREAMS = ['East', 'West', 'North', 'South', 'Day', 'Boarding'];
  const GENDERS = ['Male', 'Female', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(student.id, formData);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '800px',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaEdit className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Edit Student</h2>
                <p className="text-blue-100 opacity-90 text-xs mt-0.5">
                  Update student information
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 cursor-pointer">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Academic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Admission Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Form *
                  </label>
                  <select
                    required
                    value={formData.form}
                    onChange={(e) => setFormData({...formData, form: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  >
                    {FORMS.map(form => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Stream
                  </label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  >
                    <option value="">Select Stream</option>
                    {STREAMS.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} className="text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// Modern Chart Component (20% larger)
function ModernChart({ data, type = 'pie', title, colors }) {
  const ChartComponent = type === 'pie' ? FaChartPie : 
                        type === 'bar' ? FaChartBar : 
                        FaChartLine;

  return (
    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-3xl opacity-60" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 flex items-center justify-center shadow-xl shadow-blue-200 ring-4 ring-blue-50">
              <ChartComponent className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500">Visual distribution analysis</p>
            </div>
          </div>
        </div>

        <div className="h-72"> {/* 20% larger than standard */}
          {data.length > 0 ? (
            <div className="flex items-center justify-center h-full">
              {/* Simulated chart - replace with actual chart library */}
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                {data.map((item, index) => {
                  const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100;
                  const rotation = data.slice(0, index).reduce((sum, d) => 
                    sum + (d.value / data.reduce((total, d2) => total + d2.value, 0)) * 360, 0);
                  
                  return (
                    <div
                      key={index}
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        clipPath: `conic-gradient(from ${rotation}deg, ${item.color} ${percentage}%, transparent ${percentage}%)`
                      }}
                    />
                  );
                })}
                <div className="absolute inset-8 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900">
                      {data.reduce((sum, d) => sum + d.value, 0)}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Total</div>
                  </div>
                </div>
              </div>
              <div className="ml-8 space-y-3">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <div className="text-sm font-medium text-slate-700">{item.name}</div>
                    <div className="text-sm font-bold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Modernized Component
export default function ModernStudentBulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [view, setView] = useState('upload');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [formFilter, setFormFilter] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
const [stats, setStats] = useState({
  totalStudents: 0,
  formStats: {},
  globalStats: { totalStudents: 0, form1: 0, form2: 0, form3: 0, form4: 0 },
  demographics: { gender: {}, age: {} }
});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('grid');
  const [replaceOption, setReplaceOption] = useState('skip');
  const [editMode, setEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });
  const [demographics, setDemographics] = useState({
    gender: [],
    ageGroups: [],
    formDistribution: []
  });

  const fileInputRef = useRef(null);
  const FORMS = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];

  // Load initial data
  useEffect(() => {
    loadStats();
    loadStudents();
    loadUploadHistory();
  }, []);

const loadStats = async () => {
  try {
    const res = await fetch('/api/studentupload?action=stats');
    const data = await res.json();
    if (data.success) {
      // Update this section - the API returns stats directly, not under globalStats
      const apiStats = data.stats || {
        totalStudents: 0,
        form1: 0,
        form2: 0,
        form3: 0,
        form4: 0
      };
      
      setStats({
        totalStudents: data.totalStudents || 0,
        formStats: data.formStats || {},
        globalStats: apiStats, // This is where we map the API stats
        demographics: { gender: {}, age: {} }
      });
      
      // Process demographics data
      const genderData = Object.entries(data.stats?.demographics?.gender || {}).map(([name, value]) => ({
        name,
        value,
        color: name === 'Male' ? '#3B82F6' : name === 'Female' ? '#EC4899' : '#8B5CF6'
      }));
      
      const formData = Object.entries(data.formStats || {}).map(([name, value]) => ({
        name,
        value,
        color: 
          name === 'Form 1' ? '#3B82F6' :
          name === 'Form 2' ? '#10B981' :
          name === 'Form 3' ? '#F59E0B' :
          '#8B5CF6'
      }));

      setDemographics({
        gender: genderData,
        formDistribution: formData,
        ageGroups: [
          { name: '13-15', value: 25, color: '#3B82F6' },
          { name: '16-17', value: 45, color: '#10B981' },
          { name: '18+', value: 30, color: '#F59E0B' }
        ]
      });
    } else {
      toast.error('Failed to load statistics');
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    toast.error('Failed to load statistics');
  }
};

  const loadStudents = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/studentupload?page=${page}&limit=${pagination.limit}`;
      if (formFilter) url += `&form=${encodeURIComponent(formFilter)}`;
      if (streamFilter) url += `&stream=${encodeURIComponent(streamFilter)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load students');
      
      if (data.success) {
        setStudents(data.students || []);
        setPagination(data.pagination || {
          page: page,
          limit: pagination.limit,
          total: data.stats?.total || 0,
          pages: Math.ceil((data.stats?.total || 0) / pagination.limit)
        });
      } else {
        toast.error(data.message || 'Failed to load students');
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error(error.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadUploadHistory = async (page = 1) => {
    try {
      const res = await fetch(`/api/studentupload?action=uploads&page=${page}&limit=5`);
      const data = await res.json();
      if (data.success) {
        setUploadHistory(data.uploads || []);
      } else {
        toast.error('Failed to load upload history');
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load upload history');
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceExisting', replaceOption === 'replace');

    try {
      const response = await fetch('/api/studentupload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      
      setResult(data);
      
      if (data.success) {
        let message = `✅ Upload successful! ${data.stats.validRows} students processed.`;
        if (data.summary) {
          message = `✅ Upload complete: ${data.summary.new} new, ${data.summary.updated} updated, ${data.summary.skipped} skipped`;
        }
        toast.success(message);
        
        if (data.stats.errors && data.stats.errors.length > 0) {
          data.stats.errors.slice(0, 3).forEach(error => {
            toast.error(error, { duration: 5000 });
          });
          if (data.stats.errors.length > 3) {
            toast.error(`... and ${data.stats.errors.length - 3} more errors`, { duration: 5000 });
          }
        }
        
        await Promise.all([loadStudents(1), loadUploadHistory(1), loadStats()]);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBatch = async (batchId, batchName) => {
    setDeleteTarget({ type: 'batch', id: batchId, name: batchName });
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    setDeleteTarget({ type: 'student', id: studentId, name: studentName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      let url;
      if (deleteTarget.type === 'batch') {
        url = `/api/studentupload?batchId=${deleteTarget.id}`;
      } else {
        url = `/api/studentupload?studentId=${deleteTarget.id}`;
      }

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || 'Deleted successfully');
        await Promise.all([loadStudents(pagination.page), loadUploadHistory(1), loadStats()]);
        if (deleteTarget.type === 'student') {
          setSelectedStudent(null);
        }
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget({ type: '', id: '', name: '' });
    }
  };

  const loadStudentDetails = async (studentId) => {
    try {
      const res = await fetch(`/api/studentupload?studentId=${studentId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load student details');
      
      if (data.success) {
        setSelectedStudent(data.student);
      } else {
        toast.error(data.message || 'Failed to load student details');
      }
    } catch (error) {
      console.error('Failed to load student details:', error);
      toast.error(error.message || 'Failed to load student details');
    }
  };

  const updateStudent = async (studentId, studentData) => {
    try {
      const res = await fetch(`/api/studentupload/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Student updated successfully');
        await loadStudents(pagination.page);
        setEditingStudent(null);
        setSelectedStudent(data.student);
      } else {
        toast.error(data.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update student');
    }
  };

  const downloadCSVTemplate = () => {
    const template = `admissionNumber,firstName,middleName,lastName,form,stream,dateOfBirth,gender,parentPhone,email
3407,John,Michael,Doe,Form 1,East,2008-05-15,Male,+254712345678,john.doe@example.com
3408,Jane,,Smith,Form 2,West,2007-08-22,Female,+254723456789,jane.smith@example.com
3409,Robert,James,Wilson,Form 3,North,2006-11-30,Male,+254734567890,robert.wilson@example.com
3410,Sarah,Anne,Johnson,Form 4,South,2005-03-10,Female,+254745678901,sarah.johnson@example.com`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV template downloaded');
  };

  const downloadExcelTemplate = () => {
    try {
      const sampleData = [
        ['admissionNumber', 'firstName', 'middleName', 'lastName', 'form', 'stream', 'dateOfBirth', 'gender', 'parentPhone', 'email'],
        ['3407', 'John', 'Michael', 'Doe', 'Form 1', 'East', '2008-05-15', 'Male', '+254712345678', 'john.doe@example.com'],
        ['3408', 'Jane', '', 'Smith', 'Form 2', 'West', '2007-08-22', 'Female', '+254723456789', 'jane.smith@example.com']
      ];

      const ws = XLSX.utils.aoa_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, 'student_template.xlsx');
      toast.success('Excel template downloaded');
    } catch (error) {
      console.error('Error downloading Excel template:', error);
      toast.error('Failed to download template');
    }
  };

  const exportStudentsToCSV = () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const headers = ['Admission Number', 'First Name', 'Middle Name', 'Last Name', 'Form', 'Stream', 'Gender', 'Status', 'Email', 'Parent Phone'];
    const data = students.map(student => [
      student.admissionNumber,
      student.firstName,
      student.middleName || '',
      student.lastName,
      student.form,
      student.stream || '',
      student.gender || '',
      student.status,
      student.email || '',
      student.parentPhone || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `students_export_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${students.length} students to CSV`);
  };

  const clearFilters = () => {
    setFormFilter('');
    setStreamFilter('');
    setSearchTerm('');
    loadStudents(1);
    toast.success('Filters cleared');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      loadStudents(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadStudents(newPage);
    }
  };

  if (loading && students.length === 0 && view !== 'upload') {
    return <ModernLoadingSpinner message="Loading student records..." size="medium" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />

      {/* Main Header */}
      <div className="relative bg-gradient-to-br from-[#1e40af] via-[#7c3aed] to-[#2563eb] rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.37)] p-6 md:p-10 mb-10 border border-white/20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-5%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md ring-1 ring-white/40 shadow-inner group transition-all duration-500 hover:bg-white/20">
                <FaUserGraduate className="text-white text-3xl group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-emerald-400/30 backdrop-blur-md">
                    Student Management
                  </span>
                  <FaCheckCircle className="text-blue-300 text-[10px]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                  Student Bulk Upload
                </h1>
              </div>
            </div>
            
            <p className="text-blue-50/80 text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
              Manage student records efficiently with bulk upload, real-time filtering, 
              and comprehensive analytics for all forms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto bg-white/10 backdrop-blur-lg p-4 rounded-[2rem] border border-white/20">
            <button 
              onClick={loadStats}
              disabled={loading}
              className="flex-1 xl:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-sm shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" thickness={6} />
              ) : (
                <FaSync className="text-sm" /> 
              )}
              <span className="whitespace-nowrap">
                {loading ? 'Syncing...' : 'Refresh Stats'}
              </span>
            </button>
            
            <button 
              onClick={exportStudentsToCSV}
              disabled={students.length === 0}
              className="flex-1 xl:flex-initial flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-5 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 font-semibold text-sm active:scale-[0.98] disabled:opacity-50"
            >
              <FaDownload className="text-sm" /> 
              <span className="whitespace-nowrap">Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-[2.5rem] p-2 mb-8 border border-slate-200 shadow-xl shadow-slate-200/40">
        <div className="flex flex-wrap items-center gap-1 p-2">
          <button
            onClick={() => setView('upload')}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition-all duration-200 ${
              view === 'upload'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaUpload />
            Bulk Upload
          </button>
          <button
            onClick={() => {
              setView('students');
              loadStudents(1);
            }}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition-all duration-200 ${
              view === 'students'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaUsers />
            Students ({stats.totalStudents || 0})
          </button>
          <button
            onClick={() => {
              setView('demographics');
              loadStats();
            }}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition-all duration-200 ${
              view === 'demographics'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaChartPie />
            Demographics
          </button>
          <button
            onClick={() => {
              setView('history');
              loadUploadHistory(1);
            }}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition-all duration-200 ${
              view === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHistory />
            Upload History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Upload View */}
        {view === 'upload' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-blue-100/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                    <p className="text-3xl font-black text-slate-900">{stats.totalStudents || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 flex items-center justify-center shadow-xl shadow-blue-200">
                    <FaUsers className="text-white text-xl" />
                  </div>
                </div>
              </div>
              
              {FORMS.map(form => {
                const count = stats.globalStats[form.toLowerCase().replace(' ', '')] || 0;
                const colors = {
                  'Form 1': 'from-blue-500 to-blue-600',
                  'Form 2': 'from-emerald-500 to-emerald-600',
                  'Form 3': 'from-amber-500 to-amber-600',
                  'Form 4': 'from-purple-500 to-purple-600'
                };
                
                return (
                  <div key={form} className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-blue-100/50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{form}</p>
                        <p className="text-3xl font-black text-slate-900">{count}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${colors[form]} flex items-center justify-center shadow-xl`}>
                        <FaGraduationCap className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Upload Area */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Duplicate Handling */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2.5">
                    <FaInfoCircle className="text-blue-600 text-xl" />
                    Duplicate Handling Strategy
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 mb-3">
                    <div className="flex-1">
                      <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        replaceOption === 'skip' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          checked={replaceOption === 'skip'}
                          onChange={() => setReplaceOption('skip')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Skip Duplicates</div>
                          <div className="text-sm text-gray-600 mt-1">Preserve existing records</div>
                        </div>
                      </label>
                    </div>
                    <div className="flex-1">
                      <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        replaceOption === 'replace' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          checked={replaceOption === 'replace'}
                          onChange={() => setReplaceOption('replace')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Replace Records</div>
                          <div className="text-sm text-gray-600 mt-1">Update with new data</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <ModernFileUpload
                  onFileSelect={handleFileSelect}
                  file={file}
                  onRemove={() => setFile(null)}
                  dragActive={dragActive}
                  onDrag={(active) => setDragActive(active)}
                />

                {/* Selected File */}
                {file && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          {file.name.endsWith('.csv') ? (
                            <FaFileCsv className="text-blue-600 text-2xl" />
                          ) : (
                            <FaFileExcel className="text-green-600 text-2xl" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{file.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="text-sm px-2 py-1 bg-gray-100 rounded-lg">
                              {file.name.split('.').pop().toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFile(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        >
                          <FaTimes className="text-lg" />
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all duration-200"
                        >
                          {uploading ? (
                            <>
                              <FaSync className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <FaUpload />
                              Upload Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Template Downloads */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Download Templates</h3>
                  <div className="space-y-3">
                    <button
                      onClick={downloadCSVTemplate}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <FaFileCsv className="text-blue-600 text-xl" />
                      <span className="font-medium text-gray-900">CSV Template</span>
                    </button>
                    <button
                      onClick={downloadExcelTemplate}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <FaFileExcel className="text-green-600 text-xl" />
                      <span className="font-medium text-gray-900">Excel Template</span>
                    </button>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Upload Guidelines</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <span className="text-sm text-blue-800">Use provided templates</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <span className="text-sm text-blue-800">Ensure admission numbers are unique</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <span className="text-sm text-blue-800">Keep file size under 10MB</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Results */}
            {result && (
              <div className={`rounded-2xl p-8 border-2 transition-all duration-300 ${
                result.success
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                  : 'border-red-200 bg-gradient-to-br from-red-50 to-white'
              }`}>
                <div className="flex items-start gap-5 mb-8">
                  <div className={`p-4 rounded-2xl ${
                    result.success ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {result.success ? (
                      <FaCheckCircle className="text-4xl text-emerald-600" />
                    ) : (
                      <FaTimesCircle className="text-4xl text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {result.success ? 'Upload Completed Successfully!' : 'Upload Failed'}
                    </h3>
                    <p className="text-gray-600 mt-1.5">{result.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-5 border text-center hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Total Rows</p>
                    <p className="text-3xl font-bold text-gray-900">{result.stats.totalRows}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border text-center hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Valid Rows</p>
                    <p className="text-3xl font-bold text-emerald-600">{result.stats.validRows}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border text-center hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Skipped</p>
                    <p className="text-3xl font-bold text-amber-600">{result.stats.skippedRows}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border text-center hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Errors</p>
                    <p className="text-3xl font-bold text-red-600">{result.stats.errorRows}</p>
                  </div>
                </div>

                {result.summary && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-800 mb-4 text-lg">Summary:</h4>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-medium">
                        New: {result.summary.new}
                      </span>
                      <span className="px-4 py-2.5 bg-blue-100 text-blue-800 rounded-xl font-medium">
                        Updated: {result.summary.updated}
                      </span>
                      <span className="px-4 py-2.5 bg-amber-100 text-amber-800 rounded-xl font-medium">
                        Skipped: {result.summary.skipped}
                      </span>
                    </div>
                  </div>
                )}

                {result.stats.errors && result.stats.errors.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                      <FaExclamationTriangle className="text-amber-600 text-xl" />
                      Errors ({result.stats.errors.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {result.stats.errors.slice(0, 8).map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-100">
                          <div className="font-medium">Error {index + 1}</div>
                          <div className="mt-1">{error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Students View */}
        {view === 'students' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearch}
                      placeholder="Search students by name, admission, or email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-bold flex items-center gap-2 hover:border-blue-300 transition-all duration-300"
                  >
                    <FaFilter />
                    Filters
                    {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  
                  <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                    <button
                      onClick={() => setDisplayMode('grid')}
                      className={`p-2.5 rounded-lg transition-all duration-300 ${displayMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <FaTh size={18} />
                    </button>
                    <button
                      onClick={() => setDisplayMode('list')}
                      className={`p-2.5 rounded-lg transition-all duration-300 ${displayMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <FaList size={18} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleSearch({ type: 'click' })}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                  >
                    <FaSearch />
                    Search
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Filter by Form
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {FORMS.map(form => (
                          <button
                            key={form}
                            onClick={() => {
                              setFormFilter(formFilter === form ? '' : form);
                              loadStudents(1);
                            }}
                            className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                              formFilter === form
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {form}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Filter by Stream
                      </label>
                      <select
                        value={streamFilter}
                        onChange={(e) => {
                          setStreamFilter(e.target.value);
                          loadStudents(1);
                        }}
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                      >
                        <option value="">All Streams</option>
                        {['East', 'West', 'North', 'South', 'Day', 'Boarding'].map(stream => (
                          <option key={stream} value={stream}>{stream}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        disabled={!formFilter && !streamFilter && !searchTerm}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && students.length === 0 ? (
              <div className="text-center py-16">
                <ModernLoadingSpinner message="Loading student records..." size="medium" />
              </div>
            ) : (
              <>
                {/* Student Grid View */}
                {displayMode === 'grid' && students.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-slate-900">
                        Student Records ({pagination.total})
                      </h3>
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {students.map(student => (
                        <div 
                          key={student.id} 
                          className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 flex items-center justify-center shadow-xl shadow-blue-200">
                                <FaUser className="text-white text-xl" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                  {student.firstName} {student.lastName}
                                </h4>
                                <p className="text-sm text-slate-600 mt-0.5">#{student.admissionNumber}</p>
                              </div>
                            </div>
                            <div className="relative">
                              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                <FaCog />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Form</span>
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                student.form === 'Form 1' ? 'bg-blue-100 text-blue-800' :
                                student.form === 'Form 2' ? 'bg-emerald-100 text-emerald-800' :
                                student.form === 'Form 3' ? 'bg-amber-100 text-amber-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {student.form}
                              </span>
                            </div>
                            
                            {student.stream && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Stream</span>
                                <span className="text-sm font-bold text-slate-900">{student.stream}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Status</span>
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                student.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {student.status}
                              </span>
                            </div>
                            
                            {student.email && (
                              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                <FaEnvelope className="text-slate-400 text-sm" />
                                <span className="text-sm truncate flex-1">{student.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 mt-5 pt-5 border-t border-slate-100">
                            <button
                              onClick={() => loadStudentDetails(student.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all duration-200"
                            >
                              <FaEye /> View
                            </button>
                            <button
                              onClick={() => setEditingStudent(student)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all duration-200"
                            >
                              <FaEdit /> Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Student List View */}
                {displayMode === 'list' && students.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">Student Records</h3>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border">
                            {pagination.total} total students
                          </div>
                          <button
                            onClick={() => loadStudents(pagination.page)}
                            disabled={loading}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                          >
                            <FaSync className={loading ? 'animate-spin' : ''} />
                            Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Form
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Stream
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 flex items-center justify-center">
                                    <FaUser className="text-white text-sm" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                                    </div>
                                    <div className="text-sm text-slate-500">#{student.admissionNumber}</div>
                                    {student.email && (
                                      <div className="text-sm text-slate-500">{student.email}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                  student.form === 'Form 1' ? 'bg-blue-100 text-blue-800' :
                                  student.form === 'Form 2' ? 'bg-emerald-100 text-emerald-800' :
                                  student.form === 'Form 3' ? 'bg-amber-100 text-amber-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {student.form}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-slate-900 font-bold">{student.stream || 'Unassigned'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                  student.status === 'active' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => loadStudentDetails(student.id)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => setEditingStudent(student)}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {students.length === 0 && !loading && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <FaUsers className="text-5xl text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium">No students found</p>
                    {(formFilter || streamFilter || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Clear filters to see all students
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {students.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                    <div className="text-sm text-slate-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2.5 rounded-xl border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        <FaArrowLeft />
                      </button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-11 h-11 rounded-xl transition-all duration-200 ${
                              pagination.page === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="p-2.5 rounded-xl border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Demographics View */}
        {view === 'demographics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ModernChart 
                data={demographics.formDistribution}
                type="pie"
                title="Form Distribution"
              />
              <ModernChart 
                data={demographics.gender}
                type="pie"
                title="Gender Distribution"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center shadow-xl shadow-amber-200 ring-4 ring-amber-50">
                      <FaCalendar className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Age Distribution</h3>
                      <p className="text-sm text-slate-500">Student age groups analysis</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {demographics.ageGroups.map((group, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{group.name} years</span>
                          <span className="text-sm font-bold text-slate-900">{group.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${group.value}%`,
                              background: `linear-gradient(90deg, ${group.color} 0%, ${group.color}80 100%)`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-400 flex items-center justify-center shadow-xl shadow-purple-200 ring-4 ring-purple-50">
                      <FaChartLine className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Form Statistics</h3>
                      <p className="text-sm text-slate-500">Detailed form-level metrics</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {demographics.formDistribution.map((form, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-blue-200 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
                          <span className="font-medium text-slate-700">{form.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{form.value}</span>
                          <span className="text-xs text-slate-500 font-medium">students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Upload History</h3>
                <p className="text-slate-600 mt-1">Track all your bulk upload activities</p>
              </div>
              <button
                onClick={() => loadUploadHistory(1)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center gap-2.5 hover:shadow-lg transition-all duration-200"
              >
                <FaSync /> 
                Refresh
              </button>
            </div>
            
            {uploadHistory.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FaHistory className="text-5xl text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium">No upload history found</p>
                <p className="text-slate-500 mt-2">Upload your first file to see history here</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Upload Details
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Statistics
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {uploadHistory.map(upload => (
                        <tr key={upload.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-50 rounded-xl">
                                <FaFile className="text-blue-600 text-lg" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 truncate max-w-xs">
                                  {upload.fileName}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                  {new Date(upload.uploadDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                              upload.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : upload.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {upload.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="text-emerald-600 font-bold">{upload.validRows || 0} valid</span>
                                <span className="text-amber-600 font-bold">{upload.skippedRows || 0} skipped</span>
                                <span className="text-red-600 font-bold">{upload.errorRows || 0} errors</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Total: {upload.totalRows || 0} rows processed
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => handleDeleteBatch(upload.id, upload.fileName)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStudent && (
        <ModernStudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => {
            setEditingStudent(selectedStudent);
            setSelectedStudent(null);
          }}
          onDelete={(studentName) => handleDeleteStudent(selectedStudent.id, studentName)}
        />
      )}

      {editingStudent && (
        <ModernStudentEditModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={updateStudent}
          loading={loading}
        />
      )}

      {showDeleteModal && (
        <ModernDeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          loading={loading}
          type={deleteTarget.type}
          itemName={deleteTarget.name}
        />
      )}
    </div>
  );
}