'use client';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  FaFilePdf, FaUpload, FaTimes, FaTrash, FaEye,
  FaDownload, FaPlus, FaChartBar, FaSync,
  FaBook, FaMoneyBillWave, FaUniversity, FaAward,
  FaGraduationCap, FaFileAlt, FaFileVideo, FaFile,
  FaExternalLinkAlt, FaCheck, FaTimesCircle, 
  FaExclamationTriangle, FaCheckCircle, FaSave,
  FaArrowRight, FaArrowDown, FaCog, FaBuilding,
  FaShieldAlt, FaInfoCircle, FaCalendar, 
  FaUsers, FaChalkboardTeacher, FaDollarSign,
  FaUserCheck, FaClock, FaMapMarkerAlt, FaPhone,
  FaEnvelope, FaGlobe, FaChevronRight, FaChevronLeft,
  FaPercentage, FaTasks, FaClipboardList, FaUser,
  FaTag, FaCogs, FaBlackTie, FaPlay, FaPlayCircle,
  FaCamera, FaImage, FaHourglassHalf, FaBookOpen,
  FaUsersCog, FaRocket, FaArrowLeft, FaEyeDropper,
  FaEdit, FaList, FaCaretDown, FaCaretUp,
  FaSort, FaSortUp, FaSortDown, FaCalculator,
  FaInfo, FaQuestionCircle, FaDatabase,
  FaPencilAlt, FaEllipsisV, FaExclamationCircle, FaAlignLeft 
} from 'react-icons/fa';

import { 
  CircularProgress, Modal, Box, TextField,
  IconButton, Button, Chip, Stack, FormControl,
  InputLabel, Select, MenuItem, Divider,
  Paper, Typography, Card, CardContent,
  Grid, Tooltip, Alert, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// File Size Manager Context
const FileSizeContext = createContext();

function FileSizeProvider({ children }) {
  const [totalSize, setTotalSize] = useState(0);
  const [maxTotalSize] = useState(50 * 1024 * 1024); // 50MB total limit
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileCount, setFileCount] = useState(0);

  const addFile = (file, fileId = null) => {
    if (!file || !file.size) {
      toast.error('Invalid file');
      return false;
    }
    
    const newTotal = totalSize + file.size;
    if (newTotal > maxTotalSize) {
      toast.error(`Total file size would exceed ${(maxTotalSize / (1024 * 1024)).toFixed(0)}MB limit`);
      return false;
    }
    
    const fileWithId = {
      file,
      id: fileId || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      size: file.size,
      name: file.name
    };
    
    setUploadedFiles(prev => [...prev, fileWithId]);
    setTotalSize(newTotal);
    setFileCount(prev => prev + 1);
    return true;
  };

  const removeFile = (fileId) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRemove) return;
    
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setTotalSize(prev => prev - (fileToRemove.size || 0));
    setFileCount(prev => prev - 1);
  };

  const replaceFile = (oldFileId, newFile) => {
    const oldFile = uploadedFiles.find(f => f.id === oldFileId);
    if (!oldFile || !newFile) return false;
    
    const newTotal = totalSize - (oldFile.size || 0) + (newFile.size || 0);
    if (newTotal > maxTotalSize) {
      toast.error(`Total file size would exceed ${(maxTotalSize / (1024 * 1024)).toFixed(0)}MB limit`);
      return false;
    }
    
    setUploadedFiles(prev => 
      prev.map(f => f.id === oldFileId ? { ...f, file: newFile, size: newFile.size, name: newFile.name } : f)
    );
    setTotalSize(newTotal);
    return true;
  };

  const getTotalSizeMB = () => (totalSize / (1024 * 1024)).toFixed(2);
  const getMaxSizeMB = () => (maxTotalSize / (1024 * 1024)).toFixed(0);
  const getRemainingMB = () => Math.max(0, ((maxTotalSize - totalSize) / (1024 * 1024)).toFixed(2));
  const getPercentage = () => Math.min(100, (totalSize / maxTotalSize) * 100);

  return (
    <FileSizeContext.Provider value={{
      totalSize,
      maxTotalSize,
      uploadedFiles,
      fileCount,
      addFile,
      removeFile,
      replaceFile,
      getTotalSizeMB,
      getMaxSizeMB,
      getRemainingMB,
      getPercentage,
      reset: () => {
        setTotalSize(0);
        setUploadedFiles([]);
        setFileCount(0);
      }
    }}>
      {children}
    </FileSizeContext.Provider>
  );
}

function useFileSize() {
  const context = useContext(FileSizeContext);
  if (!context) {
    throw new Error('useFileSize must be used within FileSizeProvider');
  }
  return context;
}

// Modern Loading Spinner Component
function ModernLoadingSpinner({ message = "Loading school documents...", size = "medium" }) {
  const sizes = {
    small: { outer: 48, inner: 24 },
    medium: { outer: 64, inner: 32 },
    large: { outer: 80, inner: 40 }
  };

  const { outer, inner } = sizes[size];

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
          <span className="block text-lg font-bold text-gray-800">
            {message}
          </span>
          
          <div className="flex justify-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" 
                   style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
          
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch school documents
          </p>
        </div>
      </div>
    </div>
  );
}

// Dynamic Fee Category Component
function DynamicFeeCategory({ category, index, onChange, onRemove, type = 'day' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gradient-to-br ${type === 'boarding' ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-green-50 to-green-100 border-green-200'} rounded-2xl p-4 border-2 mb-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
          </button>
          <div className="flex items-center gap-2">
            <div className={`p-2 ${type === 'boarding' ? 'bg-blue-500' : 'bg-green-500'} text-white rounded-xl`}>
              <FaMoneyBillWave className="text-sm" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {category.name || `Fee Category ${index + 1}`}
              </h4>
              <p className="text-xs text-gray-600 font-bold">
                Amount: KES {category.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs font-bold bg-white/80 text-gray-700 rounded-lg hover:bg-white transition-colors border border-gray-200"
          >
            {isExpanded ? 'Collapse' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Remove category"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
      
      <Collapse in={isExpanded}>
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={category.name || ''}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                placeholder="e.g., Tuition, Uniform, Books, etc."
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Amount (KES) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={category.amount || ''}
                onChange={(e) => onChange(index, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={category.description || ''}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              placeholder="Brief description of this fee category..."
              rows="2"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold transition-all resize-none"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={category.optional || false}
                  onChange={(e) => onChange(index, 'optional', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Optional Fee
              </label>
            </div>
            
            {type === 'boarding' && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={category.boardingOnly || false}
                    onChange={(e) => onChange(index, 'boardingOnly', e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  Boarding Specific
                </label>
              </div>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  );
}

// Fee Breakdown Modal Component
function FeeBreakdownModal({ 
  open, 
  onClose, 
  onSave, 
  title = "Fee Structure Breakdown",
  existingBreakdown = [],
  type = 'day'
}) {
  const [categories, setCategories] = useState(existingBreakdown || []);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const total = Array.isArray(categories) 
      ? categories.reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0) 
      : 0;
    setTotalAmount(total);
  }, [categories]);

  const handleAddCategory = () => {
    const newCategory = {
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      amount: 0,
      description: '',
      optional: false,
      boardingOnly: type === 'boarding',
      order: categories.length
    };
    setCategories([...categories, newCategory]);
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleRemoveCategory = (index) => {
    if (categories.length <= 1) {
      toast.warning('At least one fee category is required');
      return;
    }
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const orderedItems = items.map((item, index) => ({ ...item, order: index }));
    setCategories(orderedItems);
  };

  const handleSave = () => {
    const validationErrors = [];
    categories.forEach((cat, index) => {
      if (!cat.name?.trim()) {
        validationErrors.push(`Category ${index + 1} requires a name`);
      }
      if (!cat.amount || cat.amount <= 0) {
        validationErrors.push(`Category "${cat.name || index + 1}" requires a valid amount`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix all validation errors');
      return;
    }

    setErrors([]);
    onSave(categories);
    onClose();
  };

  const presetCategories = type === 'day' ? [
    { name: 'Tuition', amount: 0, description: 'Academic tuition fees' },
    { name: 'Uniform', amount: 0, description: 'School uniform costs' },
    { name: 'Books', amount: 0, description: 'Textbooks and stationery' },
    { name: 'Activity Fee', amount: 0, description: 'Extra-curricular activities' },
    { name: 'Development Levy', amount: 0, description: 'School development fund' },
  ] : [
    { name: 'Tuition', amount: 0, description: 'Academic tuition fees' },
    { name: 'Boarding Fee', amount: 0, description: 'Accommodation and meals', boardingOnly: true },
    { name: 'Uniform', amount: 0, description: 'School uniform costs' },
    { name: 'Books', amount: 0, description: 'Textbooks and stationery' },
    { name: 'Medical Fee', amount: 0, description: 'Medical services for boarders', boardingOnly: true },
    { name: 'Activity Fee', amount: 0, description: 'Extra-curricular activities' },
    { name: 'Development Levy', amount: 0, description: 'School development fund' },
  ];

  const loadPreset = (preset) => {
    const loaded = preset.map((cat, index) => ({
      ...cat,
      id: `preset_${Date.now()}_${index}`,
      order: index
    }));
    setCategories(loaded);
    toast.success('Preset categories loaded. Update amounts as needed.');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '700px',
        maxHeight: '85vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className={`bg-gradient-to-r ${type === 'boarding' ? 'from-blue-600 via-blue-700 to-indigo-700' : 'from-green-600 via-green-700 to-emerald-700'} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaCalculator className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-white/90 text-sm mt-1 font-bold">
                  {type === 'day' ? 'Day School' : 'Boarding School'} Fee Structure Breakdown
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(85vh-180px)] overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-600" />
                <h4 className="text-sm font-bold text-red-700">Validation Errors</h4>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-xs text-red-600 font-bold">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Fee Categories</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset(presetCategories)}
                  className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Load Preset
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2"
                >
                  <FaPlus /> Add Category
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <FaMoneyBillWave className="mx-auto text-4xl text-gray-400 mb-4" />
                <h4 className="text-lg font-bold text-gray-700 mb-2">No Fee Categories</h4>
                <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto font-bold">
                  Start by adding fee categories or load a preset to get started.
                </p>
                <button
                  onClick={handleAddCategory}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-bold shadow-lg flex items-center gap-2 mx-auto"
                >
                  <FaPlus /> Add First Category
                </button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fee-categories">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {categories.map((category, index) => (
                        <Draggable 
                          key={category.id} 
                          draggableId={category.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="relative"
                            >
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 cursor-move" {...provided.dragHandleProps}>
                                <FaSort className="text-gray-400" />
                              </div>
                              <div className="ml-8">
                                <DynamicFeeCategory
                                  category={category}
                                  index={index}
                                  onChange={handleCategoryChange}
                                  onRemove={() => handleRemoveCategory(index)}
                                  type={type}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-white rounded-xl">
                  <FaCalculator className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Fee Summary</h3>
                  <p className="text-sm text-gray-600 font-bold">
                    {categories.length} categories defined
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-700">
                  KES {totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 font-bold mt-1">
                  Total Amount
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Required Fees</p>
                <p className="text-lg font-bold text-gray-900">
                  KES {categories.filter(c => !c.optional).reduce((sum, cat) => sum + (cat.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1 font-bold">
                  {categories.filter(c => !c.optional).length} categories
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Optional Fees</p>
                <p className="text-lg font-bold text-gray-900">
                  KES {categories.filter(c => c.optional).reduce((sum, cat) => sum + (cat.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1 font-bold">
                  {categories.filter(c => c.optional).length} categories
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-bold">
              <p>Total: <span className="text-emerald-700">KES {totalAmount.toLocaleString()}</span></p>
              <p className="text-xs mt-1 font-bold">{categories.length} fee categories configured</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition duration-200 font-bold w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={categories.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition duration-200 font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                Save Breakdown
              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// Enhanced Modern PDF Upload with all fixes
function ModernPdfUpload({ 
  pdfFile, 
  onPdfChange, 
  onRemove,
  feeBreakdown = null,
  onFeeBreakdownChange,
  label = "PDF File",
  required = false,
  existingPdf = null,
  existingFeeBreakdown = null,
  type = 'curriculum',
  onCancelExisting = null,
  onRemoveExisting = null,
  description = ""
}) {
  const fileSizeManager = useFileSize();
  const [previewName, setPreviewName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showAdmissionFeeModal, setShowAdmissionFeeModal] = useState(false);
  const [localFeeBreakdown, setLocalFeeBreakdown] = useState(feeBreakdown || existingFeeBreakdown || []);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileId, setFileId] = useState(null);
  const fileInputRef = useRef(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [selectedFileForMetadata, setSelectedFileForMetadata] = useState(null);

  // File size limit (0.5 MB individual file limit)
  const MAX_INDIVIDUAL_SIZE = 0.5 * 1024 * 1024;
  
  // Allowed file types
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

  useEffect(() => {
    if (pdfFile && typeof pdfFile === 'object') {
      setPreviewName(pdfFile.name);
      setFileSelected(true);
      if (!fileId) {
        const newFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setFileId(newFileId);
      }
    } else if (existingPdf) {
      setPreviewName(existingPdf.name || existingPdf.filename || 'Existing PDF');
      setFileSelected(true);
    } else {
      setPreviewName('');
      setFileSelected(false);
    }
  }, [pdfFile, existingPdf, fileId]);

  const validateFile = (file) => {
    // Check file type by extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      return false;
    }
    
    // Check individual file size
    if (file.size > MAX_INDIVIDUAL_SIZE) {
      toast.error(`Individual file must not exceed ${(MAX_INDIVIDUAL_SIZE / (1024 * 1024)).toFixed(1)} MB`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 1);
    
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file
    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check if it's an exam result type
    if (type === 'results') {
      setSelectedFileForMetadata(file);
      setShowMetadataModal(true);
    } else {
      // For non-exam files
      if (fileId) {
        // Replace existing file
        const success = fileSizeManager.replaceFile(fileId, file);
        if (!success) {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      } else {
        // Add new file
        const newFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const success = fileSizeManager.addFile(file, newFileId);
        if (!success) {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        setFileId(newFileId);
      }

      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 100);

      setTimeout(() => {
        onPdfChange(file);
        setPreviewName(file.name);
        setFileSelected(true);
        setUploadProgress(100);
        setIsReplacing(false);
        
        toast.success('File selected successfully');
        
        setTimeout(() => setUploadProgress(0), 1000);
      }, 500);
    }
  };

  const handleMetadataSave = (metadata) => {
    if (selectedFileForMetadata) {
      // Check total size for new file
      if (fileId) {
        // Replace existing file
        const success = fileSizeManager.replaceFile(fileId, selectedFileForMetadata);
        if (!success) {
          setShowMetadataModal(false);
          setSelectedFileForMetadata(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      } else {
        // Add new file
        const newFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const success = fileSizeManager.addFile(selectedFileForMetadata, newFileId);
        if (!success) {
          setShowMetadataModal(false);
          setSelectedFileForMetadata(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        setFileId(newFileId);
      }

      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 100);

      setTimeout(() => {
        onPdfChange(selectedFileForMetadata, metadata.year, metadata.description, metadata.term);
        setPreviewName(selectedFileForMetadata.name);
        setFileSelected(true);
        setUploadProgress(100);
        setIsReplacing(false);
        setShowMetadataModal(false);
        setSelectedFileForMetadata(null);
        
        toast.success('File with metadata saved successfully');
        
        setTimeout(() => setUploadProgress(0), 1000);
      }, 500);
    }
  };

  const handleFeeBreakdownSave = (breakdown) => {
    setLocalFeeBreakdown(breakdown);
    if (onFeeBreakdownChange) {
      onFeeBreakdownChange(breakdown);
    }
    toast.success('Fee breakdown saved successfully');
  };

  const handleAdmissionFeeSave = (breakdown) => {
    setLocalFeeBreakdown(breakdown);
    if (onFeeBreakdownChange) {
      onFeeBreakdownChange(breakdown);
    }
    toast.success('Admission fees saved successfully');
  };

  const calculateTotal = (breakdown) => {
    if (!breakdown || !Array.isArray(breakdown)) return 0;
    return breakdown.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleRemove = () => {
    if (fileId) {
      fileSizeManager.removeFile(fileId);
    }
    onRemove();
    setPreviewName('');
    setFileSelected(false);
    setFileId(null);
    setUploadProgress(0);
    toast.info('File removed');
  };

  const handleRemoveExisting = () => {
    if (onRemoveExisting) {
      onRemoveExisting();
    }
    setPreviewName('');
    setFileSelected(false);
    setFileId(null);
    toast.success('Existing PDF marked for removal');
  };

  const totalAmount = calculateTotal(localFeeBreakdown);
  const hasExistingPdf = existingPdf && !pdfFile;
  const hasNewPdf = pdfFile && typeof pdfFile === 'object';
  const hasFeeBreakdown = localFeeBreakdown && localFeeBreakdown.length > 0;

  const getDescription = () => {
    switch(type) {
      case 'curriculum':
        return "Upload the official school curriculum document outlining all subjects, courses, and academic programs offered.";
      case 'day':
        return "Upload the fee structure for day scholars. This document should detail all applicable fees for students who don't board at the school.";
      case 'boarding':
        return "Upload the fee structure for boarding students. This document should include accommodation, meals, and all boarding-related charges.";
      case 'admission':
        return "Upload the admission fee document outlining all charges new students need to pay upon admission.";
      case 'results':
        return "Upload the examination results document. Ensure it includes proper grading, subject scores, and student performance data.";
      default:
        return description;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="w-full max-w-2xl">
        {/* FILE SIZE NOTIFICATION */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <p className="text-sm font-bold text-yellow-800">
              Each file must not exceed 500kB. Allowed types: PDF, DOC, DOCX
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            {type === 'curriculum' && <FaBook className="text-red-500" />}
            {type === 'day' && <FaMoneyBillWave className="text-green-500" />}
            {type === 'boarding' && <FaBuilding className="text-blue-500" />}
            {type === 'admission' && <FaUserCheck className="text-purple-500" />}
            {type === 'results' && <FaAward className="text-orange-500" />}
            <span className="text-base">{label}</span>
            {required && <span className="text-red-500 ml-1">*</span>}
            {fileSelected && (
              <span className="flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">
                <FaCheck className="text-xs" />
                Selected
              </span>
            )}
          </label>
          
          {(type === 'day' || type === 'boarding') && (
            <button
              type="button"
              onClick={() => setShowFeeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition duration-200 font-bold text-sm shadow-lg"
            >
              <FaCalculator className="text-xs" />
              {hasFeeBreakdown ? 'Edit Breakdown' : 'Add Fee Breakdown'}
            </button>
          )}
          
          {type === 'admission' && (
            <button
              type="button"
              onClick={() => setShowAdmissionFeeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition duration-200 font-bold text-sm shadow-lg"
            >
              <FaMoneyBillWave className="text-xs" />
              {hasFeeBreakdown ? 'Edit Fees' : 'Add Admission Fees'}
            </button>
          )}
        </div>
        
        <div className="mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border-2 border-gray-200">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Why upload this document?</h4>
              <p className="text-xs text-gray-700 font-bold leading-relaxed">
                {getDescription()}
              </p>
            </div>
          </div>
        </div>

        {hasFeeBreakdown && (type === 'day' || type === 'boarding' || type === 'admission') && (
          <div className={`mb-4 bg-gradient-to-br ${type === 'admission' ? 'from-purple-50 to-purple-100 border-purple-200' : type === 'boarding' ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-green-50 to-green-100 border-green-200'} rounded-2xl p-4 border-2`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className={type === 'admission' ? 'text-purple-600' : type === 'boarding' ? 'text-blue-600' : 'text-green-600'} />
                <h4 className="text-sm font-bold text-gray-900">
                  {type === 'admission' ? 'Admission Fees' : `${type.charAt(0).toUpperCase() + type.slice(1)} School Fees`}
                </h4>
              </div>
              <span className={`text-lg font-bold ${type === 'admission' ? 'text-purple-700' : type === 'boarding' ? 'text-blue-700' : 'text-green-700'}`}>
                KES {totalAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              {localFeeBreakdown.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <span className="text-sm font-bold text-gray-800">{item.name}</span>
                    {item.optional && (
                      <span className="text-xs text-gray-500 ml-2 font-bold">(Optional)</span>
                    )}
                    {item.boardingOnly && (
                      <span className="text-xs text-green-600 ml-2 font-bold">(Boarding)</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    KES {item.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
              
              {localFeeBreakdown.length > 3 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={type === 'admission' ? () => setShowAdmissionFeeModal(true) : () => setShowFeeModal(true)}
                    className={`text-sm font-bold ${type === 'admission' ? 'text-purple-600 hover:text-purple-700' : type === 'boarding' ? 'text-blue-600 hover:text-blue-700' : 'text-green-600 hover:text-green-700'}`}
                  >
                    + {localFeeBreakdown.length - 3} more categories
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="w-full max-w-2xl">
        {(hasNewPdf || hasExistingPdf) ? (
          <div className="relative group">
            <div className={`relative overflow-hidden rounded-2xl border-2 ${fileSelected ? 'border-green-400 bg-green-50/20' : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'} shadow-lg transition-all duration-300 p-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${fileSelected ? 'bg-green-500' : type === 'curriculum' ? 'bg-red-500' : type === 'day' ? 'bg-green-500' : type === 'boarding' ? 'bg-blue-500' : type === 'admission' ? 'bg-purple-500' : 'bg-orange-500'} rounded-xl text-white`}>
                    {fileSelected ? <FaCheck className="text-lg" /> : <FaFilePdf className="text-lg" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                      {hasNewPdf ? pdfFile.name : (existingPdf.name || existingPdf.filename || 'Existing PDF')}
                    </p>
                    <p className="text-xs text-gray-600 font-bold">
                      {fileSelected ? '✓ File Selected' : 'No file selected'}
                      {hasNewPdf && pdfFile.size && ` • ${(pdfFile.size / 1024).toFixed(0)} KB`}
                      {hasFeeBreakdown && ` • ${localFeeBreakdown.length} categories`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasExistingPdf && (
                    <div className="flex gap-2">
                      {/* FIXED: Replace button now properly triggers file picker */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacing(true);
                          // Clear current selection
                          setPreviewName('');
                          setFileSelected(false);
                          setUploadProgress(0);
                          if (onCancelExisting) onCancelExisting();
                          toast.info('Select a replacement file');
                          // Directly trigger file input click
                          setTimeout(() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                              fileInputRef.current.click();
                            }
                          }, 100);
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-blue-600 hover:to-blue-700 flex items-center gap-1 text-sm font-bold"
                      >
                        <FaUpload className="text-xs" />
                        Replace File
                      </button>
                      {/* FIXED: Delete action now properly removes file */}
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveExisting();
                          // Clear file input
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-red-600 hover:to-red-700 flex items-center gap-1 text-sm font-bold"
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    </div>
                  )}
                  {hasNewPdf && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacing(true);
                          setPreviewName('');
                          setFileSelected(false);
                          setUploadProgress(0);
                          toast.info('Select a replacement file');
                          // Directly trigger file input click
                          setTimeout(() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                              fileInputRef.current.click();
                            }
                          }, 100);
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-blue-600 hover:to-blue-700 flex items-center gap-1 text-sm font-bold"
                      >
                        <FaUpload className="text-xs" />
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleRemove();
                          // Clear file input
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-red-600 hover:to-red-700"
                        title="Remove PDF"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {fileSelected && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold text-green-700">Selected ✓</span>
                </div>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uploading...</span>
                    <span className="text-xs font-bold text-red-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group w-full max-w-2xl ${
              dragOver 
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 ring-4 ring-blue-50' 
                : 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg'
            }`}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
              const files = Array.from(e.dataTransfer.files).slice(0, 1);
              if (files.length > 0) {
                const file = files[0];
                if (validateFile(file)) {
                  handleFileChange({ target: { files } });
                }
              }
            }}
            onDragOver={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              setDragOver(true); 
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
            }}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
                fileInputRef.current.click();
              }
            }}
          >
            <div className="relative">
              <FaUpload className={`mx-auto text-2xl mb-3 transition-all duration-300 ${
                dragOver ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-500'
              }`} />
            </div>
            <p className="text-gray-700 mb-1.5 font-bold transition-colors duration-300 group-hover:text-gray-800 text-base">
              {dragOver ? '📄 Drop file here!' : isReplacing ? 'Select replacement file' : 'Click to upload file'}
            </p>
            <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-gray-700 font-bold">
              Max: 500KB • PDF, DOC, DOCX only
            </p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {(type === 'day' || type === 'boarding') && showFeeModal && (
        <FeeBreakdownModal
          open={showFeeModal}
          onClose={() => setShowFeeModal(false)}
          onSave={handleFeeBreakdownSave}
          title={`${type === 'day' ? 'Day School' : 'Boarding School'} Fee Breakdown`}
          existingBreakdown={localFeeBreakdown}
          type={type}
        />
      )}

      {type === 'admission' && showAdmissionFeeModal && (
        <AdmissionFeeBreakdownModal
          open={showAdmissionFeeModal}
          onClose={() => setShowAdmissionFeeModal(false)}
          onSave={handleAdmissionFeeSave}
          existingBreakdown={localFeeBreakdown}
        />
      )}

      {type === 'results' && showMetadataModal && selectedFileForMetadata && (
        <DocumentMetadataModal
          open={showMetadataModal}
          onClose={() => {
            setShowMetadataModal(false);
            setSelectedFileForMetadata(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          onSave={handleMetadataSave}
          fileName={selectedFileForMetadata.name}
        />
      )}
    </div>
  );
}

// Documents Modal Component - UPDATED VERSION with proper preloading
function DocumentsModal({ onClose, onSave, documents, loading }) {
  const fileSizeManager = useFileSize();
  const [currentStep, setCurrentStep] = useState(0);
  
  // FIXED: Preload existing values for all form fields
  const [formData, setFormData] = useState({
    curriculumPDF: documents?.curriculumPDF ? { 
      name: documents.curriculumPdfName,
      filename: documents.curriculumPdfName,
      size: documents.curriculumPdfSize
    } : null,
    feesDayDistributionPdf: documents?.feesDayDistributionPdf ? {
      name: documents.feesDayPdfName,
      filename: documents.feesDayPdfName,
      size: documents.feesDayPdfSize
    } : null,
    feesBoardingDistributionPdf: documents?.feesBoardingDistributionPdf ? {
      name: documents.feesBoardingPdfName,
      filename: documents.feesBoardingPdfName,
      size: documents.feesBoardingPdfSize
    } : null,
    admissionFeePdf: documents?.admissionFeePdf ? {
      name: documents.admissionFeePdfName,
      filename: documents.admissionFeePdfName,
      size: documents.admissionFeePdfSize
    } : null,
    form1ResultsPdf: documents?.form1ResultsPdf ? {
      name: documents.form1ResultsPdfName,
      filename: documents.form1ResultsPdfName,
      size: documents.form1ResultsPdfSize
    } : null,
    form2ResultsPdf: documents?.form2ResultsPdf ? {
      name: documents.form2ResultsPdfName,
      filename: documents.form2ResultsPdfName,
      size: documents.form2ResultsPdfSize
    } : null,
    form3ResultsPdf: documents?.form3ResultsPdf ? {
      name: documents.form3ResultsPdfName,
      filename: documents.form3ResultsPdfName,
      size: documents.form3ResultsPdfSize
    } : null,
    form4ResultsPdf: documents?.form4ResultsPdf ? {
      name: documents.form4ResultsPdfName,
      filename: documents.form4ResultsPdfName,
      size: documents.form4ResultsPdfSize
    } : null,
    mockExamsResultsPdf: documents?.mockExamsResultsPdf ? {
      name: documents.mockExamsPdfName,
      filename: documents.mockExamsPdfName,
      size: documents.mockExamsPdfSize
    } : null,
    kcseResultsPdf: documents?.kcseResultsPdf ? {
      name: documents.kcsePdfName,
      filename: documents.kcsePdfName,
      size: documents.kcsePdfSize
    } : null
  });
  
  // FIXED: Preload existing fee breakdowns
  const [feeBreakdowns, setFeeBreakdowns] = useState({
    feesDay: Array.isArray(documents?.feesDayDistributionJson) ? documents.feesDayDistributionJson : [],
    feesBoarding: Array.isArray(documents?.feesBoardingDistributionJson) ? documents.feesBoardingDistributionJson : [],
    admissionFee: Array.isArray(documents?.admissionFeeDistribution) ? documents.admissionFeeDistribution : []
  });
  
  // FIXED: Preload existing exam metadata
  const [examMetadata, setExamMetadata] = useState({
    form1ResultsYear: documents?.form1ResultsYear?.toString() || '',
    form1ResultsTerm: documents?.form1ResultsTerm || '',
    form1ResultsDescription: documents?.form1ResultsDescription || '',
    
    form2ResultsYear: documents?.form2ResultsYear?.toString() || '',
    form2ResultsTerm: documents?.form2ResultsTerm || '',
    form2ResultsDescription: documents?.form2ResultsDescription || '',
    
    form3ResultsYear: documents?.form3ResultsYear?.toString() || '',
    form3ResultsTerm: documents?.form3ResultsTerm || '',
    form3ResultsDescription: documents?.form3ResultsDescription || '',
    
    form4ResultsYear: documents?.form4ResultsYear?.toString() || '',
    form4ResultsTerm: documents?.form4ResultsTerm || '',
    form4ResultsDescription: documents?.form4ResultsDescription || '',
    
    mockExamsYear: documents?.mockExamsYear?.toString() || '',
    mockExamsTerm: documents?.mockExamsTerm || '',
    mockExamsDescription: documents?.mockExamsDescription || '',
    
    kcseYear: documents?.kcseYear?.toString() || '',
    kcseTerm: documents?.kcseTerm || '',
    kcseDescription: documents?.kcseDescription || ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const steps = [
    { 
      id: 'curriculum', 
      label: 'Curriculum', 
      icon: FaBook, 
      description: 'Academic curriculum documents' 
    },
    { 
      id: 'fees', 
      label: 'Fee Structures', 
      icon: FaMoneyBillWave, 
      description: 'Day and boarding fee documents' 
    },
    { 
      id: 'admission', 
      label: 'Admission', 
      icon: FaUserCheck, 
      description: 'Admission fee documents' 
    },
    { 
      id: 'exams', 
      label: 'Exam Results', 
      icon: FaAward, 
      description: 'Academic results documents' 
    },
    { 
      id: 'review', 
      label: 'Review', 
      icon: FaClipboardList, 
      description: 'Review all documents before submission' 
    }
  ];

  useEffect(() => {
    // Reset file size manager when modal opens
    fileSizeManager.reset();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmitAfterReview();
  };

  const handleSubmitAfterReview = async () => {
    if (!confirmed) {
      toast.error('Please confirm review before submitting');
      return;
    }

    try {
      setActionLoading(true);
      
      const data = new FormData();
      
      // Add PDF files
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (typeof formData[key] === 'object' && formData[key] instanceof File) {
            data.append(key, formData[key]);
            
            const metadataMappings = {
              'curriculumPDF': { yearKey: 'curriculumYear', descKey: 'curriculumDescription', termKey: 'curriculumTerm' },
              'feesDayDistributionPdf': { yearKey: 'feesDayYear', descKey: 'feesDayDescription', termKey: 'feesDayTerm' },
              'feesBoardingDistributionPdf': { yearKey: 'feesBoardingYear', descKey: 'feesBoardingDescription', termKey: 'feesBoardingTerm' },
              'admissionFeePdf': { yearKey: 'admissionFeeYear', descKey: 'admissionFeeDescription', termKey: 'admissionFeeTerm' },
              'form1ResultsPdf': { yearKey: 'form1ResultsYear', termKey: 'form1ResultsTerm', descKey: 'form1ResultsDescription' },
              'form2ResultsPdf': { yearKey: 'form2ResultsYear', termKey: 'form2ResultsTerm', descKey: 'form2ResultsDescription' },
              'form3ResultsPdf': { yearKey: 'form3ResultsYear', termKey: 'form3ResultsTerm', descKey: 'form3ResultsDescription' },
              'form4ResultsPdf': { yearKey: 'form4ResultsYear', termKey: 'form4ResultsTerm', descKey: 'form4ResultsDescription' },
              'mockExamsResultsPdf': { yearKey: 'mockExamsYear', termKey: 'mockExamsTerm', descKey: 'mockExamsDescription' },
              'kcseResultsPdf': { yearKey: 'kcseYear', termKey: 'kcseTerm', descKey: 'kcseDescription' }
            };
            
            if (metadataMappings[key]) {
              if (formData[key].year) data.append(metadataMappings[key].yearKey, formData[key].year);
              if (formData[key].term && metadataMappings[key].termKey) data.append(metadataMappings[key].termKey, formData[key].term);
              if (formData[key].description) data.append(metadataMappings[key].descKey, formData[key].description);
            }
          }
        }
      });
      
      // Add fee breakdowns as JSON
      if (feeBreakdowns.feesDay && feeBreakdowns.feesDay.length > 0) {
        data.append('feesDayDistributionJson', JSON.stringify(feeBreakdowns.feesDay));
      }
      if (feeBreakdowns.feesBoarding && feeBreakdowns.feesBoarding.length > 0) {
        data.append('feesBoardingDistributionJson', JSON.stringify(feeBreakdowns.feesBoarding));
      }
      if (feeBreakdowns.admissionFee && feeBreakdowns.admissionFee.length > 0) {
        data.append('admissionFeeDistribution', JSON.stringify(feeBreakdowns.admissionFee));
      }
      
      // Add exam metadata (for existing documents without new uploads)
      Object.keys(examMetadata).forEach(key => {
        if (examMetadata[key] && examMetadata[key].trim() !== '') {
          data.append(key, examMetadata[key]);
        }
      });
      
      // Mark files for deletion
      const filesToDelete = [];
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].markedForDeletion) {
          filesToDelete.push(key);
          data.append(`${key}_delete`, 'true');
        }
      });

      const response = await fetch('/api/schooldocuments', {
        method: 'POST',
        body: data
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to save documents: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('Save API response:', result);
      
      if (result.success) {
        toast.success(result.message || 'Documents saved successfully!');
        if (onSave && result.document) {
          onSave(result.document);
        }
        onClose();
      } else {
        toast.error(result.error || 'Failed to save documents');
      }
      
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.message || 'Failed to save documents');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (field, file, year, description, term) => {
    if (year || description || term) {
      setFormData(prev => ({ 
        ...prev, 
        [field]: {
          ...file,
          year,
          description,
          term
        }
      }));
      
      // Update metadata state for exam results
      if (field.includes('ResultsPdf')) {
        const baseKey = field.replace('Pdf', '');
        if (year) {
          setExamMetadata(prev => ({ ...prev, [`${baseKey}Year`]: year }));
        }
        if (term) {
          setExamMetadata(prev => ({ ...prev, [`${baseKey}Term`]: term }));
        }
        if (description) {
          setExamMetadata(prev => ({ ...prev, [`${baseKey}Description`]: description }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleFileRemove = (field) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: {
        ...prev[field],
        markedForDeletion: true
      }
    }));
    toast.warning(`File marked for deletion. Save to confirm.`);
  };

  const handleCancelExisting = (field) => {
    setFormData(prev => {
      const current = prev[field];
      if (current && current.markedForDeletion) {
        // Remove deletion mark
        const { markedForDeletion, ...rest } = current;
        return { ...prev, [field]: rest };
      }
      return prev;
    });
  };

  const handleFeeBreakdownChange = (type, breakdown) => {
    setFeeBreakdowns(prev => ({ ...prev, [type]: breakdown }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getExistingPdfData = (field) => {
    if (!documents) return null;
    
    const fileData = formData[field];
    if (!fileData || fileData.markedForDeletion) return null;
    
    return fileData;
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0: // Curriculum
        return (
          <div className="space-y-6">
            <div className="w-full max-w-2xl">
              <ModernPdfUpload
                pdfFile={formData.curriculumPDF instanceof File ? formData.curriculumPDF : null}
                onPdfChange={(file) => handleFileChange('curriculumPDF', file)}
                onRemove={() => handleFileRemove('curriculumPDF')}
                onCancelExisting={() => handleCancelExisting('curriculumPDF')}
                onRemoveExisting={() => handleFileRemove('curriculumPDF')}
                label="Curriculum PDF"
                existingPdf={getExistingPdfData('curriculumPDF')}
                type="curriculum"
              />
            </div>
          </div>
        );
      
      case 1: // Fee Structures
        return (
          <div className="space-y-8">
            <div className="w-full max-w-2xl">
              <ModernPdfUpload
                pdfFile={formData.feesDayDistributionPdf instanceof File ? formData.feesDayDistributionPdf : null}
                onPdfChange={(file) => handleFileChange('feesDayDistributionPdf', file)}
                onRemove={() => handleFileRemove('feesDayDistributionPdf')}
                onCancelExisting={() => handleCancelExisting('feesDayDistributionPdf')}
                onRemoveExisting={() => handleFileRemove('feesDayDistributionPdf')}
                label="Day School Fees PDF"
                existingPdf={getExistingPdfData('feesDayDistributionPdf')}
                feeBreakdown={feeBreakdowns.feesDay}
                onFeeBreakdownChange={(breakdown) => handleFeeBreakdownChange('feesDay', breakdown)}
                type="day"
              />
            </div>
            
            <div className="w-full max-w-2xl">
              <ModernPdfUpload
                pdfFile={formData.feesBoardingDistributionPdf instanceof File ? formData.feesBoardingDistributionPdf : null}
                onPdfChange={(file) => handleFileChange('feesBoardingDistributionPdf', file)}
                onRemove={() => handleFileRemove('feesBoardingDistributionPdf')}
                onCancelExisting={() => handleCancelExisting('feesBoardingDistributionPdf')}
                onRemoveExisting={() => handleFileRemove('feesBoardingDistributionPdf')}
                label="Boarding School Fees PDF"
                existingPdf={getExistingPdfData('feesBoardingDistributionPdf')}
                feeBreakdown={feeBreakdowns.feesBoarding}
                onFeeBreakdownChange={(breakdown) => handleFeeBreakdownChange('feesBoarding', breakdown)}
                type="boarding"
              />
            </div>
          </div>
        );
      
      case 2: // Admission
        return (
          <div className="space-y-6">
            <div className="w-full max-w-2xl">
              <ModernPdfUpload
                pdfFile={formData.admissionFeePdf instanceof File ? formData.admissionFeePdf : null}
                onPdfChange={(file) => handleFileChange('admissionFeePdf', file)}
                onRemove={() => handleFileRemove('admissionFeePdf')}
                onCancelExisting={() => handleCancelExisting('admissionFeePdf')}
                onRemoveExisting={() => handleFileRemove('admissionFeePdf')}
                label="Admission Fee PDF"
                existingPdf={getExistingPdfData('admissionFeePdf')}
                feeBreakdown={feeBreakdowns.admissionFee}
                onFeeBreakdownChange={(breakdown) => handleFeeBreakdownChange('admissionFee', breakdown)}
                type="admission"
              />
            </div>
          </div>
        );
      
      case 3: // Exam Results
        return (
          <div className="space-y-8">
            {[
              { key: 'form1Results', label: 'Form 1 Results', color: 'orange' },
              { key: 'form2Results', label: 'Form 2 Results', color: 'orange' },
              { key: 'form3Results', label: 'Form 3 Results', color: 'orange' },
              { key: 'form4Results', label: 'Form 4 Results', color: 'orange' },
              { key: 'mockExams', label: 'Mock Exams Results', color: 'orange' },
              { key: 'kcse', label: 'KCSE Results', color: 'orange' }
            ].map((exam) => (
              <div key={exam.key} className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FaAward className="text-orange-600" />
                    <span className="text-base">{exam.label}</span>
                  </label>
                </div>
           
                <ModernPdfUpload
                  pdfFile={formData[`${exam.key}Pdf`] instanceof File ? formData[`${exam.key}Pdf`] : null}
                  onPdfChange={(file, year, description, term) => {
                    handleFileChange(`${exam.key}Pdf`, file, year, description, term);
                  }}
                  onRemove={() => handleFileRemove(`${exam.key}Pdf`)}
                  onCancelExisting={() => handleCancelExisting(`${exam.key}Pdf`)}
                  onRemoveExisting={() => handleFileRemove(`${exam.key}Pdf`)}
                  label={`${exam.label} PDF`}
                  existingPdf={getExistingPdfData(`${exam.key}Pdf`)}
                  type="results"
                />
              </div>
            ))}
          </div>
        );

      case 4: // Review Step
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl">
                  <FaClipboardList className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Document Review</h3>
                  <p className="text-sm text-gray-600 font-bold">
                    Review all selected documents before submission
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FaList className="text-blue-600" />
                  Document Summary
                </h4>
                
                {Object.entries(formData).map(([key, value]) => {
                  if (!value) return null;
                  
                  const isMarkedForDeletion = value.markedForDeletion;
                  const isNewFile = value instanceof File;
                  const fileName = isNewFile ? value.name : value.filename || value.name;
                  
                  if (!fileName) return null;
                  
                  return (
                    <div key={key} className={`bg-white p-4 rounded-xl border ${isMarkedForDeletion ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className={`text-sm ${isMarkedForDeletion ? 'text-red-500' : 'text-blue-500'}`} />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{fileName}</p>
                            <p className="text-xs text-gray-600">
                              {isMarkedForDeletion ? '❌ Marked for deletion' : 
                               isNewFile ? '📤 New upload' : '📄 Existing file'}
                            </p>
                          </div>
                        </div>
                        {isMarkedForDeletion && (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                            Will be deleted
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      I confirm that I have reviewed all documents and they are accurate
                    </p>
                    <p className="text-xs text-gray-600">
                      By checking this box, I confirm that all uploaded documents, metadata, and fee breakdowns are accurate and complete.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );   
      default:
        return null;
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '1000px',
        maxHeight: '95vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* HEADER WITH TOTAL SIZE PROGRESS */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaFilePdf className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Manage School Documents</h2>
                <p className="text-white/90 text-sm mt-1 font-bold">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold ${
                    index === currentStep 
                      ? 'bg-blue-500 text-white shadow-lg scale-105' 
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <step.icon className="text-xs" />
                  <span className="font-bold hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 mx-1.5 md:w-6 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-h-[calc(95vh-280px)] overflow-y-auto scrollbar-custom p-6">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {renderStepContent()}

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-bold">Step {currentStep + 1} of {steps.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition duration-200 font-bold w-full sm:w-auto"
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-200 font-bold shadow flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Continue →
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={actionLoading || !confirmed}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition duration-200 font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {actionLoading ? (
                      <>
                        <CircularProgress size={16} className="text-white" />
                        <span>Saving Documents...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="text-sm" />
                        <span>Save All Documents</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// CSS for custom scrollbar
const customScrollbarStyles = `
  .scrollbar-custom::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-custom::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

// Add custom styles to head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = customScrollbarStyles;
  document.head.appendChild(style);
}

export default function SchoolDocumentsPage() {
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schooldocuments');
      
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const result = await response.json();
      
      if (result.success && result.document) {
        setDocuments(result.document);
      } else {
        setDocuments(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setDocuments(null);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/schooldocuments', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      const result = await response.json();
      toast.success(result.message || 'Document deleted successfully');
      setDeleteDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDocuments = async (documentData) => {
    try {
      setActionLoading(true);
      toast.success('Documents saved successfully!');
      setShowModal(false);
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save documents');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <ModernLoadingSpinner message="Loading school documents..." size="medium" />;
  }

  const hasDocuments = documents && (
    documents.curriculumPDF ||
    documents.feesDayDistributionPdf ||
    documents.feesBoardingDistributionPdf ||
    documents.admissionFeePdf ||
    documents.form1ResultsPdf ||
    documents.form2ResultsPdf ||
    documents.form3ResultsPdf ||
    documents.form4ResultsPdf ||
    documents.mockExamsResultsPdf ||
    documents.kcseResultsPdf
  );

  return (
    <FileSizeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6">
        <Toaster position="top-right" richColors />
        
        {/* MODERN HEADER WITH INTEGRATED ACTIONS */}
        <div className="relative bg-gradient-to-br from-[#1e40af] via-[#7c3aed] to-[#2563eb] rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.37)] p-6 md:p-10 mb-10 border border-white/20 overflow-hidden transition-all duration-500">
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-5%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md ring-1 ring-white/40 shadow-inner group transition-all duration-500 hover:bg-white/20">
                  <FaFilePdf className="text-white text-3xl group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-emerald-400/30 backdrop-blur-md">
                      Document Management
                    </span>
                    <FaShieldAlt className="text-blue-300 text-[10px]" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter drop-shadow-sm">
                    School Documents
                  </h1>
                </div>
              </div>
              
              <p className="text-blue-50/80 text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
                Manage all school documents including curriculum, dynamic fee structures, admission forms, and exam results.
              </p>
            </div>

            {/* ACTION BUTTON GROUP */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <button 
                onClick={loadData} 
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-xl transition-all duration-200 font-bold text-sm shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <CircularProgress size={14} color="inherit" /> : <FaSync className="text-xs" />}
                <span>{loading ? 'Syncing...' : 'Refresh'}</span>
              </button>

              <button 
                onClick={() => setShowModal(true)} 
                className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-200 font-bold text-sm shadow-lg active:scale-95"
              >
                {hasDocuments ? <FaPencilAlt className="text-xs" /> : <FaUpload className="text-xs" />}
                <span>{hasDocuments ? 'Edit Documents' : 'Upload Documents'}</span>
              </button>

              {hasDocuments && (
                <button 
                  onClick={() => setDeleteDialogOpen(true)} 
                  className="group flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500 backdrop-blur-md text-red-200 hover:text-white border border-red-500/30 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm shadow-lg active:scale-95"
                >
                  <FaTrash className="text-xs group-hover:animate-bounce" />
                  <span>Delete All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {!hasDocuments ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center my-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-200">
              <FaFilePdf className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No School Documents Yet</h3>
            <p className="text-gray-600 text-base mb-6 max-w-md mx-auto font-bold">
              Start by uploading school documents to showcase your institution's curriculum, fee structures, and academic results
            </p>
            <button 
              onClick={() => setShowModal(true)} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-200 font-bold shadow-lg flex items-center gap-3 mx-auto text-base"
            >
              <FaUpload className="text-lg" /> 
              <span>Upload School Documents</span>
            </button>
          </div>
        ) : (
          <div className="my-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">School Documents</h2>
                <p className="text-gray-600 font-bold mt-1">Manage all your school documents in one place</p>
              </div>
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-200 font-bold shadow-lg flex items-center gap-2 text-sm"
              >
                <FaPlus className="text-sm" /> 
                <span>Edit Documents</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.curriculumPDF && (
                <ModernDocumentCard
                  title="Curriculum Document"
                  description="Official school curriculum and syllabus"
                  pdfUrl={documents.curriculumPDF}
                  pdfName={documents.curriculumPdfName || "curriculum.pdf"}
                  year={documents.curriculumYear}
                  type="curriculum"
                  fileSize={documents.curriculumPdfSize}
                  uploadDate={documents.curriculumPdfUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.feesDayDistributionPdf && (
                <ModernDocumentCard
                  title="Day School Fee Structure"
                  description="Day school fees breakdown and payment terms"
                  pdfUrl={documents.feesDayDistributionPdf}
                  pdfName={documents.feesDayPdfName || "day-fees.pdf"}
                  year={documents.feesDayYear}
                  term={documents.feesDayTerm}
                  feeBreakdown={documents.feesDayDistributionJson || []}
                  type="day"
                  fileSize={documents.feesDayPdfSize}
                  uploadDate={documents.feesDayPdfUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.feesBoardingDistributionPdf && (
                <ModernDocumentCard
                  title="Boarding School Fee Structure"
                  description="Boarding school fees including accommodation"
                  pdfUrl={documents.feesBoardingDistributionPdf}
                  pdfName={documents.feesBoardingPdfName || "boarding-fees.pdf"}
                  year={documents.feesBoardingYear}
                  term={documents.feesBoardingTerm}
                  feeBreakdown={documents.feesBoardingDistributionJson || []}
                  type="boarding"
                  fileSize={documents.feesBoardingPdfSize}
                  uploadDate={documents.feesBoardingPdfUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.admissionFeePdf && (
                <ModernDocumentCard
                  title="Admission Fees"
                  description="Admission and registration fees structure"
                  pdfUrl={documents.admissionFeePdf}
                  pdfName={documents.admissionFeePdfName || "admission-fees.pdf"}
                  year={documents.admissionFeeYear}
                  term={documents.admissionFeeTerm}
                  admissionBreakdown={documents.admissionFeeDistribution || []}
                  type="admission"
                  fileSize={documents.admissionFeePdfSize}
                  uploadDate={documents.admissionFeePdfUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.form1ResultsPdf && (
                <ModernDocumentCard
                  title="Form 1 Results"
                  description={documents.form1ResultsDescription || "Form 1 examination results"}
                  pdfUrl={documents.form1ResultsPdf}
                  pdfName={documents.form1ResultsPdfName || "form1-results.pdf"}
                  year={documents.form1ResultsYear}
                  term={documents.form1ResultsTerm}
                  type="results"
                  fileSize={documents.form1ResultsPdfSize}
                  uploadDate={documents.form1ResultsUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.form2ResultsPdf && (
                <ModernDocumentCard
                  title="Form 2 Results"
                  description={documents.form2ResultsDescription || "Form 2 examination results"}
                  pdfUrl={documents.form2ResultsPdf}
                  pdfName={documents.form2ResultsPdfName || "form2-results.pdf"}
                  year={documents.form2ResultsYear}
                  term={documents.form2ResultsTerm}
                  type="results"
                  fileSize={documents.form2ResultsPdfSize}
                  uploadDate={documents.form2ResultsUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.form3ResultsPdf && (
                <ModernDocumentCard
                  title="Form 3 Results"
                  description={documents.form3ResultsDescription || "Form 3 examination results"}
                  pdfUrl={documents.form3ResultsPdf}
                  pdfName={documents.form3ResultsPdfName || "form3-results.pdf"}
                  year={documents.form3ResultsYear}
                  term={documents.form3ResultsTerm}
                  type="results"
                  fileSize={documents.form3ResultsPdfSize}
                  uploadDate={documents.form3ResultsUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.form4ResultsPdf && (
                <ModernDocumentCard
                  title="Form 4 Results"
                  description={documents.form4ResultsDescription || "Form 4 examination results"}
                  pdfUrl={documents.form4ResultsPdf}
                  pdfName={documents.form4ResultsPdfName || "form4-results.pdf"}
                  year={documents.form4ResultsYear}
                  term={documents.form4ResultsTerm}
                  type="results"
                  fileSize={documents.form4ResultsPdfSize}
                  uploadDate={documents.form4ResultsUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.mockExamsResultsPdf && (
                <ModernDocumentCard
                  title="Mock Exams Results"
                  description={documents.mockExamsDescription || "Mock examination results"}
                  pdfUrl={documents.mockExamsResultsPdf}
                  pdfName={documents.mockExamsPdfName || "mock-exams-results.pdf"}
                  year={documents.mockExamsYear}
                  term={documents.mockExamsTerm}
                  type="results"
                  fileSize={documents.mockExamsPdfSize}
                  uploadDate={documents.mockExamsUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
              
              {documents.kcseResultsPdf && (
                <ModernDocumentCard
                  title="KCSE Results"
                  description={documents.kcseDescription || "KCSE examination results"}
                  pdfUrl={documents.kcseResultsPdf}
                  pdfName={documents.kcsePdfName || "kcse-results.pdf"}
                  year={documents.kcseYear}
                  term={documents.kcseTerm}
                  type="results"
                  fileSize={documents.kcsePdfSize}
                  uploadDate={documents.kcseUploadDate}
                  existing={true}
                  onReplace={() => setShowModal(true)}
                />
              )}
            </div>
          </div>
        )}

        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            className: "rounded-2xl p-0 w-[95vw] max-w-sm shadow-2xl overflow-hidden border border-gray-300 mx-auto" 
          }}
        >
          <div className="bg-gradient-to-r from-red-600 to-orange-500 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shrink-0">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Confirm Deletion</h2>
                <p className="text-red-100 text-sm font-semibold mt-0.5">
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-red-300">
                <FaTrash className="text-red-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Delete All School Documents?
              </h3>
              <p className="text-red-600 text-sm font-semibold">
                You are about to permanently delete all uploaded documents
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-800">
                  Type to confirm deletion:
                </label>
                <span className="text-red-700 font-bold text-sm select-none bg-red-100 px-2 py-0.5 rounded">
                  "DELETE"
                </span>
              </div>
              <input 
                type="text" 
                value={confirmText} 
                onChange={(e) => setConfirmText(e.target.value)} 
                placeholder='Type "DELETE" here...'
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-base font-medium placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 p-5 bg-gray-50 border-t-2 border-gray-300">
            <button 
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmText('');
              }}
              disabled={actionLoading}
              className="order-2 sm:order-1 flex-1 px-5 py-3 border-2 border-gray-400 text-gray-800 rounded-xl hover:bg-white hover:border-gray-500 transition font-bold text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (confirmText === "DELETE") {
                  handleDeleteDocument();
                } else {
                  toast.error('Please type "DELETE" exactly to confirm deletion');
                }
              }}
              disabled={actionLoading || confirmText !== "DELETE"}
              className="order-1 sm:order-2 flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="text-sm" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </Dialog>

        {showModal && (
          <DocumentsModal 
            onClose={() => setShowModal(false)} 
            onSave={handleSaveDocuments}
            documents={documents}
            loading={actionLoading}
          />
        )}
      </div>
    </FileSizeProvider>
  );
}