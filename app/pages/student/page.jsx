'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  FiUpload, 
  FiFileText, 
  FiCheckCircle, 
  FiXCircle, 
  FiDownload,
  FiUsers,
  FiAlertCircle,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiEdit,
  FiFilter,
  FiGrid,
  FiList,
  FiPlus,
  FiEdit2,
  FiSave,
  FiX
} from 'react-icons/fi';
import { 
  IoCloudUpload,
  IoCloseCircle,
  IoDocumentAttach,
  IoStatsChart,
  IoDownloadOutline,
  IoCheckmarkCircle,
  IoWarning,
  IoInformationCircle
} from 'react-icons/io5';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Import or define streams
const STREAMS = ['East', 'West', 'North', 'South', 'Day', 'Boarding', 'Unassigned'];
const FORMS = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];

export default function StudentBulkUploadModern() {
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
    globalStats: {
      totalStudents: 0,
      form1: 0,
      form2: 0,
      form3: 0,
      form4: 0
    },
    streamStats: {}
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('grid');
  const [replaceOption, setReplaceOption] = useState('skip'); // 'skip' or 'replace'
  const [editMode, setEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const fileInputRef = useRef(null);

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
        setStats({
          totalStudents: data.stats.totalStudents,
          formStats: data.formStats,
          globalStats: data.stats,
          streamStats: data.streamStats || {}
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
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load students');
      }
      
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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      if (validExtensions.some(ext => droppedFile.name.toLowerCase().endsWith(ext))) {
        setFile(droppedFile);
        setResult(null);
        toast.success('File selected successfully');
      } else {
        toast.error('Please upload a CSV or Excel file');
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      if (validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))) {
        setFile(selectedFile);
        setResult(null);
        toast.success('File selected successfully');
      } else {
        toast.error('Please upload a CSV or Excel file');
        e.target.value = '';
      }
    }
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
      setResult({
        success: false,
        message: error.message || 'Upload failed. Please try again.',
        batch: { 
          id: '', 
          fileName: file?.name || 'Unknown', 
          status: 'failed' 
        },
        stats: { 
          totalRows: 0, 
          validRows: 0, 
          skippedRows: 0, 
          errorRows: 1, 
          errors: [error.message || 'Network error'] 
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteBatch = async (batchId) => {
    if (!confirm('Are you sure you want to delete this upload batch and all its students?')) return;
    
    try {
      const res = await fetch(`/api/studentupload?batchId=${batchId}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || 'Batch deleted successfully');
        await Promise.all([loadStudents(1), loadUploadHistory(1), loadStats()]);
      } else {
        toast.error(data.message || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete batch');
    }
  };

  const deleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    
    try {
      const res = await fetch(`/api/studentupload?studentId=${studentId}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || 'Student deleted successfully');
        await Promise.all([loadStudents(pagination.page), loadStats()]);
        setSelectedStudent(null);
      } else {
        toast.error(data.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete student');
    }
  };

  const loadStudentDetails = async (studentId) => {
    try {
      const res = await fetch(`/api/studentupload?studentId=${studentId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load student details');
      }
      
      if (data.success) {
        setSelectedStudent(data.student);
        setView('studentDetails');
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
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Download CSV Template
  const downloadCSVTemplate = () => {
    const template = `admissionNumber,firstName,middleName,lastName,form,stream,dateOfBirth,gender,parentPhone,email
3407,John,Michael,Doe,Form 1,East,2008-05-15,Male,+254712345678,john.doe@example.com
3408,Jane,,Smith,Form 2,West,2007-08-22,Female,+254723456789,jane.smith@example.com
3409,Robert,James,Wilson,Form 3,North,2006-11-30,Male,+254734567890,robert.wilson@example.com
3410,Sarah,Anne,Johnson,Form 4,South,2005-03-10,Female,+254745678901,sarah.johnson@example.com
3411,Michael,,Brown,Form 1,Day,2008-07-18,Male,+254756789012,michael.brown@example.com
3412,Emily,Rose,Davis,Form 2,Boarding,2007-12-05,Female,+254767890123,emily.davis@example.com
3413,David,Joseph,Miller,Form 3,East,2006-04-25,Male,+254778901234,david.miller@example.com
3414,Lisa,Mary,Taylor,Form 4,West,2005-09-12,Female,+254789012345,lisa.taylor@example.com
3415,Thomas,Paul,Anderson,Form 1,North,2008-02-28,Male,+254790123456,thomas.anderson@example.com
3416,Jennifer,Louise,Thomas,Form 2,South,2007-10-14,Female,+254701234567,jennifer.thomas@example.com`;

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

  // Download Excel Template
  const downloadExcelTemplate = () => {
    try {
      const sampleData = [
        ['admissionNumber', 'firstName', 'middleName', 'lastName', 'form', 'stream', 'dateOfBirth', 'gender', 'parentPhone', 'email'],
        ['3407', 'John', 'Michael', 'Doe', 'Form 1', 'East', '2008-05-15', 'Male', '+254712345678', 'john.doe@example.com'],
        ['3408', 'Jane', '', 'Smith', 'Form 2', 'West', '2007-08-22', 'Female', '+254723456789', 'jane.smith@example.com'],
        ['3409', 'Robert', 'James', 'Wilson', 'Form 3', 'North', '2006-11-30', 'Male', '+254734567890', 'robert.wilson@example.com'],
        ['3410', 'Sarah', 'Anne', 'Johnson', 'Form 4', 'South', '2005-03-10', 'Female', '+254745678901', 'sarah.johnson@example.com']
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

  // Export current students to CSV
  const exportStudentsToCSV = () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const headers = ['Admission Number', 'First Name', 'Middle Name', 'Last Name', 'Form', 'Stream', 'Status', 'Email', 'Parent Phone'];
    const data = students.map(student => [
      student.admissionNumber,
      student.firstName,
      student.middleName || '',
      student.lastName,
      student.form,
      student.stream || '',
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
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${students.length} students to CSV`);
  };

  // Clear all filters
  const clearFilters = () => {
    setFormFilter('');
    setStreamFilter('');
    setSearchTerm('');
    loadStudents(1);
    toast.success('Filters cleared');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group students by form and stream for organized view
  const organizeStudents = () => {
    const organized = {};
    students.forEach(student => {
      if (!organized[student.form]) {
        organized[student.form] = {};
      }
      const stream = student.stream || 'Unassigned';
      if (!organized[student.form][stream]) {
        organized[student.form][stream] = [];
      }
      organized[student.form][stream].push(student);
    });
    return organized;
  };

  const organizedStudents = organizeStudents();

  // Chart data for form distribution
  const chartData = Object.entries(stats.formStats || {}).map(([name, value]) => ({
    name,
    value,
    color: 
      name === 'Form 1' ? '#3B82F6' :
      name === 'Form 2' ? '#10B981' :
      name === 'Form 3' ? '#F59E0B' :
      '#8B5CF6'
  }));

  // Stream distribution data
  const streamChartData = Object.entries(stats.streamStats || {}).map(([name, value]) => ({
    name,
    value,
    color: 
      name === 'East' ? '#3B82F6' :
      name === 'West' ? '#10B981' :
      name === 'North' ? '#F59E0B' :
      name === 'South' ? '#8B5CF6' :
      name === 'Day' ? '#EC4899' :
      name === 'Boarding' ? '#06B6D4' :
      '#94A3B8'
  }));

  // Handle edit student
  const handleEditStudent = (student) => {
    setEditingStudent({ ...student });
  };

  const handleSaveEdit = async () => {
    if (!editingStudent.firstName || !editingStudent.lastName || !editingStudent.form) {
      toast.error('First name, last name, and form are required');
      return;
    }

    await updateStudent(editingStudent.id, editingStudent);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('upload')}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                view === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUpload /> Bulk Upload
            </button>
            <button
              onClick={() => {
                setView('students');
                loadStudents(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                view === 'students'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUsers /> Students ({stats.totalStudents || 0})
            </button>
            <button
              onClick={() => {
                setView('organized');
                loadStudents(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                view === 'organized'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiGrid /> Organized View
            </button>
            <button
              onClick={() => {
                setView('history');
                loadUploadHistory(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                view === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IoDocumentAttach /> Upload History
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                <FiDownload /> Download Template
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={downloadCSVTemplate}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <IoDownloadOutline /> CSV Template
                </button>
                <button
                  onClick={downloadExcelTemplate}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <IoDownloadOutline /> Excel Template
                </button>
                <button
                  onClick={exportStudentsToCSV}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  disabled={students.length === 0}
                >
                  <FiDownload /> Export Current Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Upload View */}
        {view === 'upload' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.globalStats.totalStudents || 0}</p>
                  </div>
                  <FiUsers className="text-2xl text-blue-600" />
                </div>
              </div>
              
              {FORMS.map(form => (
                <div key={form} className={`bg-gradient-to-br ${
                  form === 'Form 1' ? 'from-emerald-50 to-emerald-100 border-emerald-200' :
                  form === 'Form 2' ? 'from-amber-50 to-amber-100 border-amber-200' :
                  form === 'Form 3' ? 'from-orange-50 to-orange-100 border-orange-200' :
                  'from-purple-50 to-purple-100 border-purple-200'
                } rounded-xl p-4 border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        form === 'Form 1' ? 'text-emerald-700' :
                        form === 'Form 2' ? 'text-amber-700' :
                        form === 'Form 3' ? 'text-orange-700' :
                        'text-purple-700'
                      }`}>
                        {form}
                      </p>
                      <p className={`text-2xl font-bold ${
                        form === 'Form 1' ? 'text-emerald-900' :
                        form === 'Form 2' ? 'text-amber-900' :
                        form === 'Form 3' ? 'text-orange-900' :
                        'text-purple-900'
                      }`}>
                        {stats.globalStats[form.toLowerCase().replace(' ', '')] || 0}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg ${
                      form === 'Form 1' ? 'bg-emerald-100' :
                      form === 'Form 2' ? 'bg-amber-100' :
                      form === 'Form 3' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      <span className={`font-bold ${
                        form === 'Form 1' ? 'text-emerald-700' :
                        form === 'Form 2' ? 'text-amber-700' :
                        form === 'Form 3' ? 'text-orange-700' :
                        'text-purple-700'
                      }`}>
                        {form.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Duplicate Handling Options */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <IoInformationCircle className="text-blue-600" />
                Duplicate Handling
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="skipDuplicates"
                    checked={replaceOption === 'skip'}
                    onChange={() => setReplaceOption('skip')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="skipDuplicates" className="text-gray-700">
                    Skip duplicates (recommended)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="replaceDuplicates"
                    checked={replaceOption === 'replace'}
                    onChange={() => setReplaceOption('replace')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="replaceDuplicates" className="text-gray-700">
                    Replace existing records
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {replaceOption === 'skip' 
                  ? 'Students with existing admission numbers will be skipped.'
                  : 'Existing students will be updated with new data.'}
              </p>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="max-w-md mx-auto">
                <IoCloudUpload className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  Drop your CSV or Excel file here
                </p>
                <p className="text-gray-600 mb-6">
                  Upload student data in bulk. Supports .csv, .xls, .xlsx formats
                </p>
                
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FiUpload /> Browse Files
                  </div>
                </label>
                
                <p className="text-sm text-gray-500 mt-4">
                  Maximum file size: 10MB • Download templates from the button above
                </p>
              </div>
            </div>

            {/* Selected File */}
            {file && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl border">
                      <FiFileText className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{file.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="text-sm px-2 py-1 bg-gray-200 rounded-md">
                          {file.name.endsWith('.csv') ? 'CSV' : 'Excel'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                        toast.success('File removed');
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                    >
                      <IoCloseCircle className="text-xl" />
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <FiRefreshCw className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiUpload />
                          Upload Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Results */}
            {result && (
              <div className={`rounded-2xl p-6 border-2 ${
                result.success
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                  : 'border-red-200 bg-gradient-to-br from-red-50 to-white'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full ${
                    result.success ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {result.success ? (
                      <IoCheckmarkCircle className="text-3xl text-emerald-600" />
                    ) : (
                      <IoWarning className="text-3xl text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {result.success ? 'Upload Successful!' : 'Upload Failed'}
                    </h3>
                    <p className="text-gray-600">{result.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border text-center">
                    <p className="text-sm text-gray-600">Total Rows</p>
                    <p className="text-2xl font-bold text-gray-900">{result.stats.totalRows}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border text-center">
                    <p className="text-sm text-gray-600">Valid Rows</p>
                    <p className="text-2xl font-bold text-emerald-600">{result.stats.validRows}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border text-center">
                    <p className="text-sm text-gray-600">Skipped Rows</p>
                    <p className="text-2xl font-bold text-amber-600">{result.stats.skippedRows}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border text-center">
                    <p className="text-sm text-gray-600">Error Rows</p>
                    <p className="text-2xl font-bold text-red-600">{result.stats.errorRows}</p>
                  </div>
                </div>

                {result.summary && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-2">Summary:</h4>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        New: {result.summary.new}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Updated: {result.summary.updated}
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                        Skipped: {result.summary.skipped}
                      </span>
                    </div>
                  </div>
                )}

                {result.stats.errors && result.stats.errors.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <IoWarning className="text-amber-600" />
                      Errors ({result.stats.errors.length}):
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {result.stats.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                      {result.stats.errors.length > 10 && (
                        <p className="text-sm text-gray-600">
                          ... and {result.stats.errors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Students List View */}
        {view === 'students' && (
          <div className="space-y-6">
            {/* Filters and Display Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDisplayMode('grid')}
                    className={`p-2 rounded-lg ${displayMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <FiGrid size={20} />
                  </button>
                  <button
                    onClick={() => setDisplayMode('list')}
                    className={`p-2 rounded-lg ${displayMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <FiList size={20} />
                  </button>
                </div>
                
                <select
                  value={formFilter}
                  onChange={(e) => {
                    setFormFilter(e.target.value);
                    loadStudents(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Forms</option>
                  {FORMS.map(form => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>

                <select
                  value={streamFilter}
                  onChange={(e) => {
                    setStreamFilter(e.target.value);
                    loadStudents(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Streams</option>
                  {STREAMS.map(stream => (
                    <option key={stream} value={stream}>{stream}</option>
                  ))}
                </select>

                {(formFilter || streamFilter || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                  >
                    <FiX /> Clear Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Search by name or admission #"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <FiSearch /> Search
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <FiRefreshCw className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading students...</p>
              </div>
            )}

            {/* Grid View */}
            {!loading && displayMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FiUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students found</p>
                    {(formFilter || streamFilter || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Clear filters to see all students
                      </button>
                    )}
                  </div>
                ) : (
                  students.map(student => (
                    <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiUser className="text-blue-600 text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">#{student.admissionNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadStudentDetails(student.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View details"
                          >
                            <FiEye className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <FiEdit className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FiTrash2 className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Form</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
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
                            <span className="text-sm text-gray-600">Stream</span>
                            <span className="text-sm font-medium text-gray-900">{student.stream}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        
                        {student.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Email</span>
                            <span className="text-sm truncate max-w-[150px]">{student.email}</span>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Added {formatDate(student.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* List View */}
            {!loading && displayMode === 'list' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Student Records</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      Showing {students.length} of {pagination?.total || 0} students
                    </div>
                    <button
                      onClick={() => loadStudents(pagination.page)}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admission #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Form
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stream
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        students.map(student => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">#{student.admissionNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                              </div>
                              {student.email && (
                                <div className="text-sm text-gray-500">{student.email}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                student.form === 'Form 1' ? 'bg-blue-100 text-blue-800' :
                                student.form === 'Form 2' ? 'bg-emerald-100 text-emerald-800' :
                                student.form === 'Form 3' ? 'bg-amber-100 text-amber-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {student.form}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{student.stream || 'Unassigned'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                student.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => loadStudentDetails(student.id)}
                                  className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditStudent(student)}
                                  className="text-emerald-600 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteStudent(student.id)}
                                  className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && students.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {pagination?.page || 1} of {pagination?.pages || 1} • Total: {pagination?.total || 0} students
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange((pagination?.page || 1) - 1)}
                    disabled={(pagination?.page || 1) === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: Math.min(5, pagination?.pages || 1) }, (_, i) => {
                    let pageNum;
                    const totalPages = pagination?.pages || 1;
                    const currentPage = pagination?.page || 1;
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange((pagination?.page || 1) + 1)}
                    disabled={(pagination?.page || 1) === (pagination?.pages || 1)}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Student Modal */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Edit Student</h3>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <IoCloseCircle className="text-2xl text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={editingStudent.firstName || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={editingStudent.lastName || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={editingStudent.middleName || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, middleName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admission Number *
                      </label>
                      <input
                        type="text"
                        value={editingStudent.admissionNumber || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, admissionNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Form *
                      </label>
                      <select
                        value={editingStudent.form || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, form: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Form</option>
                        {FORMS.map(form => (
                          <option key={form} value={form}>{form}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stream
                      </label>
                      <select
                        value={editingStudent.stream || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, stream: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Stream</option>
                        {STREAMS.map(stream => (
                          <option key={stream} value={stream}>{stream}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={editingStudent.gender || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editingStudent.status || 'active'}
                        onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editingStudent.dateOfBirth ? editingStudent.dateOfBirth.split('T')[0] : ''}
                        onChange={(e) => setEditingStudent({...editingStudent, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Phone
                      </label>
                      <input
                        type="tel"
                        value={editingStudent.parentPhone || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, parentPhone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+254712345678"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editingStudent.email || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="student@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <FiSave /> Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Details View */}
        {view === 'studentDetails' && selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setView('students')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <FiChevronLeft /> Back to Students
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEditStudent(selectedStudent)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <FiEdit /> Edit Student
                </button>
                <button
                  onClick={() => deleteStudent(selectedStudent.id)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <FiTrash2 /> Delete Student
                </button>
              </div>
            </div>
            
            {/* Student Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <FiUser className="text-3xl text-blue-600" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {selectedStudent.firstName} {selectedStudent.middleName || ''} {selectedStudent.lastName}
                  </h4>
                  <p className="text-gray-600">Admission: #{selectedStudent.admissionNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Form</p>
                  <p className="font-semibold text-gray-900">{selectedStudent.form}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Stream</p>
                  <p className="font-semibold text-gray-900">{selectedStudent.stream || 'Not assigned'}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedStudent.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudent.status}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Date Added</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedStudent.createdAt)}</p>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-4">
                  {selectedStudent.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">@</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedStudent.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.parentPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">📱</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parent Phone</p>
                        <p className="font-medium text-gray-900">{selectedStudent.parentPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-4">
                  {selectedStudent.gender && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{selectedStudent.gender}</p>
                    </div>
                  )}
                  {selectedStudent.dateOfBirth && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Upload Batch Information */}
            {selectedStudent.uploadBatch && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Upload Information</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Uploaded via</p>
                    <p className="font-medium text-gray-900">{selectedStudent.uploadBatch.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Upload Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedStudent.uploadBatch.uploadDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedStudent.uploadBatch.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : selectedStudent.uploadBatch.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStudent.uploadBatch.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Organized View (Forms & Streams) */}
        {view === 'organized' && (
          <div className="space-y-6">
            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Form Distribution</h3>
                <div className="h-64">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No student data available</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Stream Distribution</h3>
                <div className="h-64">
                  {streamChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={streamChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                        <Bar dataKey="value">
                          {streamChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No stream data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Organized by Form and Stream */}
            <div className="space-y-8">
              {Object.keys(organizedStudents).length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No organized data available</p>
                  <button
                    onClick={() => loadStudents(1)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Load students
                  </button>
                </div>
              ) : (
                Object.entries(organizedStudents).map(([form, streams]) => (
                  <div key={form} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          form === 'Form 1' ? 'bg-blue-500' :
                          form === 'Form 2' ? 'bg-emerald-500' :
                          form === 'Form 3' ? 'bg-amber-500' :
                          'bg-purple-500'
                        }`}></span>
                        {form} - {Object.values(streams).flat().length} Students
                      </h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(streams).map(([stream, streamStudents]) => (
                          <div key={stream} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">{stream}</h4>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {streamStudents.length} students
                              </span>
                            </div>
                            
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                              {streamStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {student.firstName} {student.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">#{student.admissionNumber}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      loadStudentDetails(student.id);
                                      setView('studentDetails');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Upload History</h3>
              <button
                onClick={() => loadUploadHistory(1)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
            
            {uploadHistory.length === 0 ? (
              <div className="text-center py-12">
                <IoDocumentAttach className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upload history found</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Upload Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statistics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadHistory.map(upload => (
                        <tr key={upload.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <FiFileText className="text-gray-400" />
                              <span className="font-medium text-gray-900 truncate max-w-xs">
                                {upload.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {upload.fileType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              upload.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : upload.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {upload.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(upload.uploadDate)}
                            </div>
                            {upload.processedDate && (
                              <div className="text-xs text-gray-500">
                                Processed: {formatDate(upload.processedDate)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600">{upload.validRows || 0} valid</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-amber-600">{upload.skippedRows || 0} skipped</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-red-600">{upload.errorRows || 0} errors</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Total: {upload.totalRows || 0} rows
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteBatch(upload.id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
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
    </div>
  );
}