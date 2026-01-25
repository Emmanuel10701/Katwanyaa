'use client';
import { useState, useEffect, useRef } from 'react';
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
  FaSort, FaSortUp, FaSortDown, FaCalculator
} from 'react-icons/fa';

import { 
  CircularProgress, Modal, Box, TextField,
  IconButton, Button, Chip, Stack, FormControl,
  InputLabel, Select, MenuItem, Divider,
  Paper, Typography, Card, CardContent,
  Grid, Tooltip, Alert, Collapse
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
function DynamicFeeCategory({ category, index, onChange, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 text-white rounded-xl">
              <FaMoneyBillWave className="text-sm" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {category.name || `Fee Category ${index + 1}`}
              </h4>
              <p className="text-xs text-gray-600 font-medium">
                Amount: KES {category.amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
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
        <div className="mt-4 space-y-4 pt-4 border-t border-blue-200">
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
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold transition-all"
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
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold transition-all"
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
              className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold transition-all resize-none"
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
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={category.boardingOnly || false}
                  onChange={(e) => onChange(index, 'boardingOnly', e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                Boarding Only
              </label>
            </div>
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
  type = 'day' // 'day' or 'boarding' or 'admission'
}) {
  const [categories, setCategories] = useState(existingBreakdown || []);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Calculate total whenever categories change
    const total = categories.reduce((sum, cat) => sum + (cat.amount || 0), 0);
    setTotalAmount(total);
  }, [categories]);

  const handleAddCategory = () => {
    const newCategory = {
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      amount: 0,
      description: '',
      optional: false,
      boardingOnly: false,
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
    
    // Update order
    const orderedItems = items.map((item, index) => ({ ...item, order: index }));
    setCategories(orderedItems);
  };

  const handleSave = () => {
    // Validate categories
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

  const presetCategories = [
    { name: 'Tuition', amount: 0, description: 'Academic tuition fees' },
    { name: 'Uniform', amount: 0, description: 'School uniform costs' },
    { name: 'Books', amount: 0, description: 'Textbooks and stationery' },
    { name: 'Activity Fee', amount: 0, description: 'Extra-curricular activities' },
    { name: 'Development Levy', amount: 0, description: 'School development fund' },
    { name: 'Boarding Fee', amount: 0, description: 'Accommodation and meals', boardingOnly: true },
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
        maxWidth: '800px',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaCalculator className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-blue-100 opacity-90 text-sm mt-1">
                  {type === 'admission' ? 'Admission Fee Breakdown' : 
                   `${type.charAt(0).toUpperCase() + type.slice(1)} School Fee Structure`}
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

        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-600" />
                <h4 className="text-sm font-bold text-red-700">Validation Errors</h4>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-xs text-red-600 font-medium">• {error}</li>
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
                <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
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

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-white rounded-xl">
                  <FaCalculator className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Fee Summary</h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {categories.length} categories defined
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-700">
                  KES {totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 font-medium mt-1">
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
                <p className="text-xs text-gray-600 mt-1">
                  {categories.filter(c => !c.optional).length} categories
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Optional Fees</p>
                <p className="text-lg font-bold text-gray-900">
                  KES {categories.filter(c => c.optional).reduce((sum, cat) => sum + (cat.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
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
              <p className="text-xs mt-1">{categories.length} fee categories configured</p>
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

// Enhanced Modern PDF Upload with Fee Breakdown
function ModernPdfUploadWithBreakdown({ 
  pdfFile, 
  onPdfChange, 
  onRemove,
  feeBreakdown = null,
  onFeeBreakdownChange,
  label = "PDF File",
  required = false,
  existingPdf = null,
  existingFeeBreakdown = null,
  type = 'day', // 'day', 'boarding', 'admission'
  onCancelExisting = null,
  onRemoveExisting = null
}) {
  const [previewName, setPreviewName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [localFeeBreakdown, setLocalFeeBreakdown] = useState(feeBreakdown || existingFeeBreakdown || []);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (pdfFile && typeof pdfFile === 'object') {
      setPreviewName(pdfFile.name);
    } else if (existingPdf) {
      setPreviewName(existingPdf.name || existingPdf.filename || 'Existing PDF');
    } else {
      setPreviewName('');
    }
  }, [pdfFile, existingPdf]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 1);
    
    if (files.length === 0) return;

    const file = files[0];
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('PDF file too large. Maximum size: 20MB');
      return;
    }

    // Simulate upload progress
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
      setUploadProgress(100);
      setIsReplacing(false);
      
      setTimeout(() => setUploadProgress(0), 1000);
    }, 500);
  };

  const handleFeeBreakdownSave = (breakdown) => {
    setLocalFeeBreakdown(breakdown);
    if (onFeeBreakdownChange) {
      onFeeBreakdownChange(breakdown);
    }
    toast.success('Fee breakdown saved successfully');
  };

  const calculateTotal = (breakdown) => {
    if (!breakdown || !Array.isArray(breakdown)) return 0;
    return breakdown.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const totalAmount = calculateTotal(localFeeBreakdown);
  const hasExistingPdf = existingPdf && !pdfFile;
  const hasNewPdf = pdfFile && typeof pdfFile === 'object';
  const hasFeeBreakdown = localFeeBreakdown && localFeeBreakdown.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FaFilePdf className="text-red-500" />
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <button
          type="button"
          onClick={() => setShowFeeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition duration-200 font-bold text-sm shadow-lg"
        >
          <FaCalculator className="text-xs" />
          {hasFeeBreakdown ? 'Edit Breakdown' : 'Add Fee Breakdown'}
        </button>
      </div>
      
      {/* Fee Breakdown Preview */}
      {hasFeeBreakdown && (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-purple-600" />
              <h4 className="text-sm font-bold text-gray-900">Fee Breakdown Preview</h4>
            </div>
            <span className="text-lg font-bold text-purple-700">
              KES {totalAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            {localFeeBreakdown.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-100">
                <span className="text-sm font-bold text-gray-800">{item.name}</span>
                <span className="text-sm font-bold text-purple-700">
                  KES {item.amount?.toLocaleString()}
                  {item.optional && <span className="text-xs text-gray-500 ml-2">(Optional)</span>}
                </span>
              </div>
            ))}
            
            {localFeeBreakdown.length > 3 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(true)}
                  className="text-sm font-bold text-purple-600 hover:text-purple-700"
                >
                  + {localFeeBreakdown.length - 3} more categories
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {(hasNewPdf || hasExistingPdf) ? (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-2xl border-2 border-red-200 shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-orange-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl text-white">
                  <FaFilePdf className="text-lg" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                    {hasNewPdf ? pdfFile.name : (existingPdf.name || existingPdf.filename || 'Existing PDF')}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {hasNewPdf ? 'New PDF Document' : 'Existing PDF Document'}
                    {existingPdf?.size && ` • ${(existingPdf.size / 1024).toFixed(0)} KB`}
                    {hasFeeBreakdown && ` • ${localFeeBreakdown.length} fee categories`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasExistingPdf && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplacing(true);
                        setPreviewName('');
                        setUploadProgress(0);
                        if (onCancelExisting) onCancelExisting();
                        setTimeout(() => fileInputRef.current?.click(), 100);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-blue-600 hover:to-blue-700 flex items-center gap-1 text-sm font-bold"
                    >
                      <FaUpload className="text-xs" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onRemoveExisting) onRemoveExisting();
                        setPreviewName('');
                        setUploadProgress(0);
                        toast.success('Existing PDF marked for removal');
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-red-600 hover:to-red-700 flex items-center gap-1 text-sm font-bold"
                    >
                      <FaTrash className="text-xs" />
                      Remove
                    </button>
                  </div>
                )}
                {hasNewPdf && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemove();
                      setPreviewName('');
                      setUploadProgress(0);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-xl transition-all duration-300 shadow hover:shadow-md hover:from-red-600 hover:to-red-700"
                    title="Remove PDF"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>
            </div>
            
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
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group ${
            dragOver 
              ? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 ring-4 ring-red-50' 
              : 'border-gray-200 hover:border-red-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg'
          }`}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = Array.from(e.dataTransfer.files).slice(0, 1);
            if (files.length > 0) handleFileChange({ target: { files } });
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="relative">
            <FaUpload className={`mx-auto text-2xl mb-3 transition-all duration-300 ${
              dragOver ? 'text-red-500 scale-110' : 'text-gray-400 group-hover:text-red-500'
            }`} />
          </div>
          <p className="text-gray-700 mb-1.5 font-bold transition-colors duration-300 group-hover:text-gray-800 text-sm">
            {dragOver ? '📄 Drop PDF here!' : isReplacing ? 'Select new PDF file' : 'Click to upload PDF'}
          </p>
          <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-gray-700 font-medium">
            Max: 20MB • PDF only
          </p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
      )}

      {/* Fee Breakdown Modal */}
      {showFeeModal && (
        <FeeBreakdownModal
          open={showFeeModal}
          onClose={() => setShowFeeModal(false)}
          onSave={handleFeeBreakdownSave}
          title={`${type === 'admission' ? 'Admission Fee' : type.charAt(0).toUpperCase() + type.slice(1) + ' School Fees'} Breakdown`}
          existingBreakdown={localFeeBreakdown}
          type={type}
        />
      )}
    </div>
  );
}

// Additional Results Upload Component (with metadata)
function AdditionalResultsUpload({ 
  files = [], 
  onFilesChange, 
  label = "Additional Results Files",
  existingFiles = [],
  onCancelExisting = null,
  onRemoveExisting = null
}) {
  const [dragOver, setDragOver] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const existingFileObjects = (existingFiles || []).map((file, index) => ({
      ...file,
      id: file.filepath || file.filename || `existing_${index}`,
      isExisting: true,
      isModified: false,
      isRemoved: false,
      isReplaced: false,
      originalFilePath: file.filepath || file.filename
    }));
    
    const newFileObjects = (files || []).filter(file => {
      return !localFiles.some(lf => 
        (lf.file && file.name === lf.file.name && file.size === lf.file.size) ||
        (lf.filename === file.name)
      );
    }).map((file, index) => ({
      id: `new_${Date.now()}_${index}`,
      file: file,
      filename: file.name,
      year: file.year || '',
      description: file.description || '',
      isNew: true,
      isModified: true,
      filetype: file.type?.split('/')[1] || 'file',
      filesize: file.size || file.filesize || 0
    }));
    
    const allFiles = [...existingFileObjects, ...newFileObjects];
    const uniqueFiles = [];
    const seenIds = new Set();
    
    allFiles.forEach(file => {
      if (!seenIds.has(file.id)) {
        seenIds.add(file.id);
        uniqueFiles.push(file);
      }
    });
    
    setLocalFiles(uniqueFiles);
  }, [existingFiles, files]);

  const handleFileChange = (e) => {
    const newFileList = Array.from(e.target.files);
    if (newFileList.length > 0) {
      addNewFiles(newFileList, false);
    }
  };

  const addNewFiles = (fileList, isReplacement = false, replaceFileId = null) => {
    const newFileObjects = fileList.map((file, index) => {
      const fileId = `new_${Date.now()}_${index}`;
      return {
        id: fileId,
        file: file,
        filename: file.name,
        year: '',
        description: '',
        isNew: true,
        isModified: true,
        isReplacement: isReplacement,
        replacesFileId: replaceFileId,
        filetype: file.type.split('/')[1] || 'file',
        filesize: file.size
      };
    });
    
    if (isReplacement && replaceFileId) {
      setLocalFiles(prev => {
        const updated = prev.map(file => 
          file.id === replaceFileId ? { ...file, isReplaced: true } : file
        );
        return [...updated, ...newFileObjects];
      });
    } else {
      setLocalFiles(prev => [...prev, ...newFileObjects]);
    }
    
    const newFilesForParent = newFileObjects.map(f => f.file);
    onFilesChange([...files, ...newFilesForParent]);
    
    toast.success(`${fileList.length} file(s) ${isReplacement ? 'replaced' : 'added'}. Fill in metadata.`);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const newFiles = Array.from(e.dataTransfer.files);
    if (newFiles.length > 0) {
      addNewFiles(newFiles, false);
    }
  };

  const handleYearChange = (id, year) => {
    setLocalFiles(prev => prev.map(file => 
      file.id === id ? { 
        ...file, 
        year,
        isModified: true
      } : file
    ));
  };

  const handleDescriptionChange = (id, description) => {
    setLocalFiles(prev => prev.map(file => 
      file.id === id ? { 
        ...file, 
        description,
        isModified: true
      } : file
    ));
  };

  const handleReplaceExisting = (id) => {
    const fileToReplace = localFiles.find(f => f.id === id);
    
    if (fileToReplace && fileToReplace.isExisting) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';
      input.onchange = (e) => {
        const replacementFile = e.target.files[0];
        if (replacementFile) {
          addNewFiles([replacementFile], true, id);
          
          if (onCancelExisting) {
            onCancelExisting(fileToReplace);
          }
        }
      };
      input.click();
    }
  };

  const handleRemoveExisting = (id) => {
    const fileToRemove = localFiles.find(f => f.id === id);
    
    if (fileToRemove && fileToRemove.isExisting) {
      setLocalFiles(prev => prev.map(file => 
        file.id === id ? { ...file, isRemoved: true } : file
      ));
      
      if (onRemoveExisting) {
        onRemoveExisting(fileToRemove);
      }
      
      toast.warning('File marked for removal. Save changes to delete permanently.');
    }
  };

  const handleRemoveNewFile = (id) => {
    const fileToRemove = localFiles.find(f => f.id === id);
    
    if (fileToRemove && fileToRemove.isNew) {
      setLocalFiles(prev => prev.filter(file => file.id !== id));
      
      if (fileToRemove.file) {
        const updatedFiles = files.filter(f => 
          f !== fileToRemove.file && 
          f.name !== fileToRemove.filename
        );
        onFilesChange(updatedFiles);
      }
      
      toast.info('New file removed from list.');
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="text-gray-500" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('image')) return <FaFileAlt className="text-green-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileAlt className="text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return <FaFileAlt className="text-green-600" />;
    return <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayFiles = localFiles.filter(file => !file.isRemoved);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FaFile className="text-gray-600" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition duration-200 font-bold shadow-lg text-sm"
        >
          <FaPlus className="text-sm" /> Add File
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group ${
          dragOver 
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 ring-4 ring-blue-50' 
            : 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="relative">
          <FaUpload className={`mx-auto text-2xl mb-3 transition-all duration-300 ${
            dragOver ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-500'
          }`} />
        </div>
        <p className="text-gray-700 mb-1.5 font-bold transition-colors duration-300 group-hover:text-gray-800 text-sm">
          {dragOver ? '📁 Drop files here!' : 'Drag & drop or click to upload additional files'}
        </p>
        <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-gray-700 font-medium">
          PDF, Images, Documents • Max 50MB each
        </p>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple
          onChange={handleFileChange} 
          className="hidden" 
          id="additional-files-upload" 
        />
      </div>

      {displayFiles.length > 0 && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
          {displayFiles.map((file) => (
            <div key={file.id} className={`bg-white rounded-2xl p-4 border-2 ${file.isReplaced ? 'border-amber-200 bg-amber-50/30' : file.isNew ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                  {getFileIcon(file.filetype)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {file.filename || file.name || 'Document'}
                    {file.isReplaced && <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded font-bold uppercase">Replaced</span>}
                    {file.isNew && !file.isReplacement && <span className="ml-2 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded font-bold uppercase">New</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {formatFileSize(file.filesize || file.size)} • 
                    {file.isExisting ? ' Existing' : ' New'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {file.isExisting && !file.isReplaced ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReplaceExisting(file.id)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-xl border border-blue-200"
                        title="Replace file"
                      >
                        <FaUpload size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExisting(file.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-xl border border-red-200"
                        title="Delete file"
                      >
                        <FaTrash size={12} />
                      </button>
                    </>
                  ) : file.isNew ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(file.id)}
                      className="p-2 text-gray-500 bg-gray-100 rounded-xl border border-gray-300"
                      title="Remove file"
                    >
                      <FaTimes size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Year</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={file.year || ''}
                      onChange={(e) => handleYearChange(file.id, e.target.value)}
                      placeholder="Enter Year"
                      className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Description</label>
                    <input
                      type="text"
                      value={file.description || ''}
                      onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
                      placeholder="Brief description..."
                      className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Modern Document Card Component
function ModernDocumentCard({ 
  title, 
  description, 
  pdfUrl, 
  pdfName, 
  year = null,
  feeBreakdown = null,
  onReplace = null,
  onRemove = null,
  existing = false
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const totalAmount = feeBreakdown?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const categoriesCount = feeBreakdown?.length || 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl text-white">
            <FaFilePdf className="text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600 font-medium mt-1">{description}</p>
            {year && (
              <span className="text-xs font-bold text-blue-600 mt-2 inline-block bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Year: {year}
              </span>
            )}
            {feeBreakdown && categoriesCount > 0 && (
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="mt-2 flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                <FaCalculator className="text-xs" />
                {showBreakdown ? 'Hide' : 'Show'} Fee Breakdown ({categoriesCount} categories)
              </button>
            )}
          </div>
        </div>
        
        {existing && (onReplace || onRemove) && (
          <div className="flex gap-2">
            {onReplace && (
              <button
                onClick={onReplace}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                title="Replace PDF"
              >
                <FaUpload size={14} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                title="Remove PDF"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Fee Breakdown Details */}
      {showBreakdown && feeBreakdown && categoriesCount > 0 && (
        <div className="mb-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-bold text-gray-900">Fee Breakdown</h5>
            <span className="text-lg font-bold text-purple-700">KES {totalAmount.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            {feeBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{item.name}</span>
                    {item.optional && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                    )}
                    {item.boardingOnly && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Boarding Only</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-purple-700">
                  KES {item.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {pdfUrl && (
        <div className="flex gap-2 mt-4">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <FaEye /> Preview
          </a>
          <a
            href={pdfUrl}
            download={pdfName || `${title}.pdf`}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors shadow-lg"
          >
            <FaDownload /> Download
          </a>
        </div>
      )}
    </div>
  );
}

// Documents Modal Component (COMPLETELY MODERNIZED)
function DocumentsModal({ onClose, onSave, documents, loading }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    curriculumPDF: null,
    feesDayDistributionPdf: null,
    feesBoardingDistributionPdf: null,
    admissionFeePdf: null,
    form1ResultsPdf: null,
    form2ResultsPdf: null,
    form3ResultsPdf: null,
    form4ResultsPdf: null,
    mockExamsResultsPdf: null,
    kcseResultsPdf: null
  });
  
  const [feeBreakdowns, setFeeBreakdowns] = useState({
    feesDay: documents?.feesDayDistributionJson ? JSON.parse(documents.feesDayDistributionJson) : [],
    feesBoarding: documents?.feesBoardingDistributionJson ? JSON.parse(documents.feesBoardingDistributionJson) : [],
    admissionFee: documents?.admissionFeeDistribution ? JSON.parse(documents.admissionFeeDistribution) : []
  });
  
  const [examYears, setExamYears] = useState({
    form1ResultsYear: documents?.form1ResultsYear?.toString() || '',
    form2ResultsYear: documents?.form2ResultsYear?.toString() || '',
    form3ResultsYear: documents?.form3ResultsYear?.toString() || '',
    form4ResultsYear: documents?.form4ResultsYear?.toString() || '',
    mockExamsYear: documents?.mockExamsYear?.toString() || '',
    kcseYear: documents?.kcseYear?.toString() || ''
  });

  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

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
      id: 'additional', 
      label: 'Additional', 
      icon: FaFile, 
      description: 'Additional documents' 
    }
  ];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      
      const data = new FormData();
      data.append('schoolId', '1'); // You'll need to get the actual school ID
      
      // Add PDF files
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });
      
      // Add fee breakdowns as JSON
      data.append('feesDayDistributionJson', JSON.stringify(feeBreakdowns.feesDay));
      data.append('feesBoardingDistributionJson', JSON.stringify(feeBreakdowns.feesBoarding));
      data.append('admissionFeeDistribution', JSON.stringify(feeBreakdowns.admissionFee));
      
      // Add exam years
      Object.keys(examYears).forEach(key => {
        if (examYears[key]) {
          data.append(key, examYears[key]);
        }
      });
      
      // Add additional files
      additionalFiles.forEach((file, index) => {
        if (file.file) {
          data.append(`additionalFiles[${index}]`, file.file);
          if (file.year) {
            data.append(`additionalFilesYear[${index}]`, file.year);
          }
          if (file.description) {
            data.append(`additionalFilesDesc[${index}]`, file.description);
          }
        }
      });
      
      // Call API
      const response = await fetch('/api/schooldocuments', {
        method: 'POST',
        body: data
      });

      if (!response.ok) {
        throw new Error('Failed to save documents');
      }

      const result = await response.json();
      
      toast.success(result.message || 'Documents saved successfully!');
      onSave(result.document);
      onClose();
      
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.message || 'Failed to save documents');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleFileRemove = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  const handleFeeBreakdownChange = (type, breakdown) => {
    setFeeBreakdowns(prev => ({ ...prev, [type]: breakdown }));
  };

  const handleExamYearChange = (field, value) => {
    setExamYears(prev => ({ ...prev, [field]: value }));
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
    
    switch (field) {
      case 'curriculumPDF':
        return documents.curriculumPDF ? {
          name: documents.curriculumPdfName,
          filename: documents.curriculumPdfName,
          size: documents.curriculumPdfSize
        } : null;
      case 'feesDayDistributionPdf':
        return documents.feesDayDistributionPdf ? {
          name: documents.feesDayPdfName,
          filename: documents.feesDayPdfName,
          size: documents.feesDayPdfSize
        } : null;
      case 'feesBoardingDistributionPdf':
        return documents.feesBoardingDistributionPdf ? {
          name: documents.feesBoardingPdfName,
          filename: documents.feesBoardingPdfName,
          size: documents.feesBoardingPdfSize
        } : null;
      case 'admissionFeePdf':
        return documents.admissionFeePdf ? {
          name: documents.admissionFeePdfName,
          filename: documents.admissionFeePdfName,
          size: documents.admissionFeePdfSize
        } : null;
      default:
        return null;
    }
  };

  const getExistingFeeBreakdown = (type) => {
    if (!documents) return null;
    
    switch (type) {
      case 'feesDay':
        return documents.feesDayDistributionJson ? JSON.parse(documents.feesDayDistributionJson) : null;
      case 'feesBoarding':
        return documents.feesBoardingDistributionJson ? JSON.parse(documents.feesBoardingDistributionJson) : null;
      case 'admissionFee':
        return documents.admissionFeeDistribution ? JSON.parse(documents.admissionFeeDistribution) : null;
      default:
        return null;
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '1200px',
        maxHeight: '95vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* MODERN HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaFilePdf className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Manage School Documents</h2>
                <p className="text-blue-100 opacity-90 text-sm mt-1">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* MODERN STEP INDICATOR */}
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

        <div className="max-h-[calc(95vh-180px)] overflow-y-auto scrollbar-custom p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                  <ModernPdfUploadWithBreakdown 
                    pdfFile={formData.curriculumPDF}
                    onPdfChange={(file) => handleFileChange('curriculumPDF', file)}
                    onRemove={() => handleFileRemove('curriculumPDF')}
                    label="Curriculum PDF"
                    existingPdf={getExistingPdfData('curriculumPDF')}
                    type="curriculum"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <ModernPdfUploadWithBreakdown 
                    pdfFile={formData.feesDayDistributionPdf}
                    onPdfChange={(file) => handleFileChange('feesDayDistributionPdf', file)}
                    onRemove={() => handleFileRemove('feesDayDistributionPdf')}
                    label="Day School Fees PDF"
                    existingPdf={getExistingPdfData('feesDayDistributionPdf')}
                    feeBreakdown={feeBreakdowns.feesDay}
                    onFeeBreakdownChange={(breakdown) => handleFeeBreakdownChange('feesDay', breakdown)}
                    type="day"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <ModernPdfUploadWithBreakdown 
                    pdfFile={formData.feesBoardingDistributionPdf}
                    onPdfChange={(file) => handleFileChange('feesBoardingDistributionPdf', file)}
                    onRemove={() => handleFileRemove('feesBoardingDistributionPdf')}
                    label="Boarding School Fees PDF"
                    existingPdf={getExistingPdfData('feesBoardingDistributionPdf')}
                    feeBreakdown={feeBreakdowns.feesBoarding}
                    onFeeBreakdownChange={(breakdown) => handleFeeBreakdownChange('feesBoarding', breakdown)}
                    type="boarding"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <ModernPdfUploadWithBreakdown 
                    pdfFile={formData.admissionFeePdf}
                    onPdfChange={(file) => handleFileChange('admissionFeePdf', file)}
                    onRemove={() => handleFileRemove('admissionFeePdf')}
                    label="Admission Fee PDF"
                    existingPdf={getExistingPdfData('admissionFeePdf')}
                    feeBreakdown={feeBreakdowns.admissionFee}
                    onFeeBreakdownChange={(breakdown) => handleFeeBreakdownChange('admissionFee', breakdown)}
                    type="admission"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                {[
                  { key: 'form1ResultsPdf', label: 'Form 1 Results', yearKey: 'form1ResultsYear', existing: documents?.form1ResultsPdf, color: 'blue' },
                  { key: 'form2ResultsPdf', label: 'Form 2 Results', yearKey: 'form2ResultsYear', existing: documents?.form2ResultsPdf, color: 'green' },
                  { key: 'form3ResultsPdf', label: 'Form 3 Results', yearKey: 'form3ResultsYear', existing: documents?.form3ResultsPdf, color: 'purple' },
                  { key: 'form4ResultsPdf', label: 'Form 4 Results', yearKey: 'form4ResultsYear', existing: documents?.form4ResultsPdf, color: 'orange' },
                  { key: 'mockExamsResultsPdf', label: 'Mock Exams', yearKey: 'mockExamsYear', existing: documents?.mockExamsResultsPdf, color: 'red' },
                  { key: 'kcseResultsPdf', label: 'KCSE Results', yearKey: 'kcseYear', existing: documents?.kcseResultsPdf, color: 'indigo' }
                ].map((exam) => (
                  <div key={exam.key} className={`bg-gradient-to-br from-${exam.color}-50 to-${exam.color}-100 rounded-2xl p-6 border border-${exam.color}-200`}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <FaAward className={`text-${exam.color}-600`} />
                        {exam.label}
                      </label>
                      <div className="w-32">
                        <input
                          type="number"
                          min="2000"
                          max="2100"
                          value={examYears[exam.yearKey]}
                          onChange={(e) => handleExamYearChange(exam.yearKey, e.target.value)}
                          placeholder="Enter Year"
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold"
                        />
                      </div>
                    </div>
                    <ModernPdfUploadWithBreakdown 
                      pdfFile={formData[exam.key]}
                      onPdfChange={(file) => handleFileChange(exam.key, file)}
                      onRemove={() => handleFileRemove(exam.key)}
                      label={`${exam.label} PDF`}
                      type="results"
                    />
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <AdditionalResultsUpload 
                    files={additionalFiles.filter(f => f.isNew && f.file).map(f => f.file)}
                    onFilesChange={(newFiles) => {
                      const newFileObjects = newFiles.filter(newFile => 
                        !additionalFiles.some(f => f.file === newFile)
                      ).map(file => ({
                        file,
                        filename: file.name,
                        year: '',
                        description: '',
                        isNew: true,
                        isModified: true
                      }));
                      
                      setAdditionalFiles(prev => [...prev, ...newFileObjects]);
                    }}
                    label="Additional Results Files"
                    existingFiles={documents?.additionalResultsFiles || []}
                  />
                </div>
              </div>
            )}

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
                    disabled={actionLoading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition duration-200 font-bold shadow disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
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

// API Service for Documents
const documentsApiService = {
  async getSchoolDocuments(schoolId) {
    try {
      const response = await fetch(`/api/schooldocuments?schoolId=${schoolId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch school documents');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async deleteSchoolDocument(documentId) {
    try {
      const response = await fetch(`/api/schooldocuments?documentId=${documentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default function SchoolDocumentsPage() {
  const [documents, setDocuments] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // First get school info to get school ID
      const schoolResponse = await fetch('/api/schooldocuments');
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchoolInfo(schoolData.school || schoolData);
        
        // Then get documents for this school
        if (schoolData.school?.id || schoolData.id) {
          const schoolId = schoolData.school?.id || schoolData.id;
          const docsResponse = await documentsApiService.getSchoolDocuments(schoolId);
          setDocuments(docsResponse.document || docsResponse);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocuments = async (documentData) => {
    try {
      setActionLoading(true);
      // Logic to save documents
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />

      {/* MODERN HEADER */}
      <div className="relative bg-gradient-to-br from-[#1e40af] via-[#7c3aed] to-[#2563eb] rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.37)] p-6 md:p-10 mb-10 border border-white/20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-5%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md ring-1 ring-white/40 shadow-inner group transition-all duration-500 hover:bg-white/20">
                <FaFilePdf className="text-white text-3xl group-hover:scale-100 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-emerald-400/30 backdrop-blur-md">
                    Document Management
                  </span>
                  <FaShieldAlt className="text-blue-300 text-[10px]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                  {schoolInfo?.name || 'School'} Documents
                </h1>
              </div>
            </div>
            
            <p className="text-blue-50/80 text-sm md:text-lg font-bold max-w-2xl leading-relaxed">
              Manage all school documents including curriculum, dynamic fee structures, admission forms, and exam results.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto bg-white/10 backdrop-blur-lg sm:bg-transparent p-4 sm:p-0 rounded-[2rem] sm:rounded-none shadow-lg sm:shadow-none border border-white/20 sm:border-none">
            
            <button 
              onClick={loadData} 
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 sm:py-2.5 rounded-xl hover:bg-white/90 transition-all duration-200 font-bold text-sm shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" thickness={6} />
              ) : (
                <FaSync className="text-sm" /> 
              )}
              <span className="whitespace-nowrap font-bold">
                {loading ? 'Syncing...' : 'Refresh'}
              </span>
            </button>
            
            <button 
              onClick={() => setShowModal(true)} 
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-white/90 transition-all duration-200 font-bold text-sm shadow-lg active:scale-[0.98]"
            >
              <FaUpload className="text-sm" />
              <span className="whitespace-nowrap font-bold">Manage Documents</span>
            </button>
          </div>
        </div>
      </div>

      {documents || schoolInfo ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Curriculum Document */}
              {documents?.curriculumPDF && (
                <ModernDocumentCard
                  title="Curriculum"
                  description="Academic curriculum document"
                  pdfUrl={documents.curriculumPDF}
                  pdfName={documents.curriculumPdfName}
                  existing={true}
                />
              )}

              {/* Day School Fees */}
              {documents?.feesDayDistributionPdf && (
                <ModernDocumentCard
                  title="Day School Fees"
                  description="Day school fee structure"
                  pdfUrl={documents.feesDayDistributionPdf}
                  pdfName={documents.feesDayPdfName}
                  feeBreakdown={documents.feesDayDistributionJson ? JSON.parse(documents.feesDayDistributionJson) : null}
                  existing={true}
                />
              )}

              {/* Boarding School Fees */}
              {documents?.feesBoardingDistributionPdf && (
                <ModernDocumentCard
                  title="Boarding School Fees"
                  description="Boarding school fee structure"
                  pdfUrl={documents.feesBoardingDistributionPdf}
                  pdfName={documents.feesBoardingPdfName}
                  feeBreakdown={documents.feesBoardingDistributionJson ? JSON.parse(documents.feesBoardingDistributionJson) : null}
                  existing={true}
                />
              )}

              {/* Admission Fee */}
              {documents?.admissionFeePdf && (
                <ModernDocumentCard
                  title="Admission Fee"
                  description="Admission fee structure"
                  pdfUrl={documents.admissionFeePdf}
                  pdfName={documents.admissionFeePdfName}
                  feeBreakdown={documents.admissionFeeDistribution ? JSON.parse(documents.admissionFeeDistribution) : null}
                  existing={true}
                />
              )}

              {/* Exam Results */}
              {documents?.form1ResultsPdf && (
                <ModernDocumentCard
                  title="Form 1 Results"
                  description={`Form 1 examination results ${documents.form1ResultsYear ? `(${documents.form1ResultsYear})` : ''}`}
                  pdfUrl={documents.form1ResultsPdf}
                  pdfName={documents.form1ResultsPdfName}
                  year={documents.form1ResultsYear}
                  existing={true}
                />
              )}

              {documents?.form2ResultsPdf && (
                <ModernDocumentCard
                  title="Form 2 Results"
                  description={`Form 2 examination results ${documents.form2ResultsYear ? `(${documents.form2ResultsYear})` : ''}`}
                  pdfUrl={documents.form2ResultsPdf}
                  pdfName={documents.form2ResultsPdfName}
                  year={documents.form2ResultsYear}
                  existing={true}
                />
              )}

              {documents?.form3ResultsPdf && (
                <ModernDocumentCard
                  title="Form 3 Results"
                  description={`Form 3 examination results ${documents.form3ResultsYear ? `(${documents.form3ResultsYear})` : ''}`}
                  pdfUrl={documents.form3ResultsPdf}
                  pdfName={documents.form3ResultsPdfName}
                  year={documents.form3ResultsYear}
                  existing={true}
                />
              )}

              {documents?.form4ResultsPdf && (
                <ModernDocumentCard
                  title="Form 4 Results"
                  description={`Form 4 examination results ${documents.form4ResultsYear ? `(${documents.form4ResultsYear})` : ''}`}
                  pdfUrl={documents.form4ResultsPdf}
                  pdfName={documents.form4ResultsPdfName}
                  year={documents.form4ResultsYear}
                  existing={true}
                />
              )}

              {documents?.mockExamsResultsPdf && (
                <ModernDocumentCard
                  title="Mock Exams"
                  description={`Mock examination results ${documents.mockExamsYear ? `(${documents.mockExamsYear})` : ''}`}
                  pdfUrl={documents.mockExamsResultsPdf}
                  pdfName={documents.mockExamsPdfName}
                  year={documents.mockExamsYear}
                  existing={true}
                />
              )}

              {documents?.kcseResultsPdf && (
                <ModernDocumentCard
                  title="KCSE Results"
                  description={`KCSE examination results ${documents.kcseYear ? `(${documents.kcseYear})` : ''}`}
                  pdfUrl={documents.kcseResultsPdf}
                  pdfName={documents.kcsePdfName}
                  year={documents.kcseYear}
                  existing={true}
                />
              )}
            </div>

            {/* Additional Files Section */}
            {documents?.additionalResultsFiles && documents.additionalResultsFiles.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.additionalResultsFiles.map((file, index) => (
                    <div key={index} className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <FaFileAlt className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {file.filename || file.name}
                          </p>
                          <div className="text-xs text-gray-600 space-y-1 mt-1">
                            {file.year && <div className="font-medium">Year: {file.year}</div>}
                            {file.description && <div className="font-medium">{file.description}</div>}
                          </div>
                        </div>
                      </div>
                      {file.filepath && (
                        <div className="flex gap-2 mt-3">
                          <a
                            href={file.filepath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-2 text-xs font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            View
                          </a>
                          <a
                            href={file.filepath}
                            download
                            className="flex-1 text-center py-2 text-xs font-bold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!documents || Object.keys(documents).length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <FaFilePdf className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Documents Found</h3>
                <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto font-bold">
                  Upload school documents including curriculum, fee structures, and exam results.
                </p>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition duration-200 font-bold shadow-lg flex items-center gap-2 mx-auto text-sm"
                >
                  <FaUpload /> Upload Documents
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FaFilePdf className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No School Information Found</h3>
          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto font-bold">
            Please set up school information first before managing documents.
          </p>
        </div>
      )}

      {showModal && (
        <DocumentsModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveDocuments}
          documents={documents}
          loading={actionLoading}
        />
      )}
    </div>
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