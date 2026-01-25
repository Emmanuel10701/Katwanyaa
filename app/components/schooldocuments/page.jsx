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
  FaUsersCog, FaRocket, FaEye
} from 'react-icons/fa';

import { CircularProgress } from '@mui/material';

// Modern Loading Spinner Component
function ModernLoadingSpinner({ message = "Loading school documents...", size = "medium" }) {
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
            Please wait while we fetch school documents
          </p>
        </div>
      </div>
    </div>
  )
}

// Modern PDF Upload Component
function ModernPdfUpload({ 
  pdfFile, 
  onPdfChange, 
  onRemove, 
  label = "PDF File", 
  required = false,
  existingPdf = null,
  onCancelExisting = null,
  onRemoveExisting = null
}) {
  const [previewName, setPreviewName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isReplacing, setIsReplacing] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (pdfFile && typeof pdfFile === 'object') {
      setPreviewName(pdfFile.name)
    } else if (existingPdf) {
      setPreviewName(existingPdf.name || existingPdf.filename || 'Existing PDF')
    } else {
      setPreviewName('')
    }
  }, [pdfFile, existingPdf])

  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 20
      })
    }, 100)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 1)
    
    if (files.length === 0) return

    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 20
      })
    }, 100)

    if (files.length > 0) {
      const file = files[0]
      
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed')
        setUploadProgress(0)
        return
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error('PDF file too large. Maximum size: 20MB')
        setUploadProgress(0)
        return
      }

      simulateUpload()
      onPdfChange(file)
      setPreviewName(file.name)
      setUploadProgress(100)
      setIsReplacing(false)
      
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).slice(0, 1)
    if (files.length > 0) handleFileChange({ target: { files } })
  }

  const handleRemove = () => {
    setPreviewName('')
    setUploadProgress(0)
    if (onRemove) {
      onRemove()
    }
  }

  const handleReplaceExisting = () => {
    setIsReplacing(true)
    
    if (pdfFile && typeof pdfFile === 'object' && onRemove) {
      onRemove()
    }
    
    if (existingPdf && onCancelExisting) {
      onCancelExisting()
    }
    
    setPreviewName('')
    setUploadProgress(0)
    
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }, 100)
  }

  const handleRemoveExisting = () => {
    if (existingPdf && onRemoveExisting) {
      onRemoveExisting()
    }
    
    setPreviewName('')
    setUploadProgress(0)
    
    toast.success('Existing PDF marked for removal. Save changes to confirm.')
  }

  const hasExistingPdf = existingPdf && !pdfFile
  const hasNewPdf = pdfFile && typeof pdfFile === 'object'

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
        <FaFilePdf className="text-red-500" />
        <span>{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {(hasNewPdf || hasExistingPdf) ? (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 shadow-sm transition-all duration-300 bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaFilePdf className="text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                    {hasNewPdf ? pdfFile.name : (existingPdf.name || existingPdf.filename || 'Existing PDF')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {hasNewPdf ? 'New PDF Document' : 'Existing PDF Document'}
                    {existingPdf?.size && ` • ${(existingPdf.size / 1024).toFixed(0)} KB`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasExistingPdf && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReplaceExisting}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-all duration-300 shadow hover:shadow-md cursor-pointer hover:bg-blue-600 flex items-center gap-1 text-sm"
                    >
                      <FaUpload className="text-xs" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveExisting}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-lg transition-all duration-300 shadow hover:shadow-md cursor-pointer hover:bg-red-600 flex items-center gap-1 text-sm"
                    >
                      <FaTrash className="text-xs" />
                      Remove
                    </button>
                  </div>
                )}
                {hasNewPdf && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="bg-red-500 text-white p-1.5 rounded-lg transition-all duration-300 shadow hover:shadow-md cursor-pointer hover:bg-red-600"
                    title="Remove PDF"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-600 h-1 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            {hasExistingPdf && (
              <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                <FaInfoCircle className="inline mr-1" />
                Click "Replace" to upload a new PDF or "Remove" to delete this file
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer group ${
            dragOver 
              ? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100' 
              : 'border-gray-300 hover:border-red-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-sm'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="relative">
            <FaUpload className={`mx-auto text-2xl mb-2 transition-all duration-300 ${
              dragOver ? 'text-red-500 scale-110' : 'text-gray-400 group-hover:text-red-500'
            }`} />
          </div>
          <p className="text-gray-700 mb-1 font-medium transition-colors duration-300 group-hover:text-gray-800 text-sm">
            {dragOver ? '📄 Drop PDF here!' : isReplacing ? 'Select new PDF file' : 'Click to upload PDF'}
          </p>
          <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
            Max: 20MB • PDF only
          </p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="hidden" 
            id={`pdf-upload-${label.replace(/\s+/g, '-').toLowerCase()}`} 
          />
        </div>
      )}
    </div>
  )
}

// Additional Results Upload Component
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
    
    toast.success(`${fileList.length} file(s) ${isReplacement ? 'replaced' : 'added'}. Fill in year and description.`);
    
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FaFile className="text-gray-500" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-200 font-bold shadow cursor-pointer text-xs"
        >
          <FaPlus className="text-xs" /> Add File
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer group ${
          dragOver 
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100' 
            : 'border-gray-300 hover:border-blue-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-sm'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="relative">
          <FaUpload className={`mx-auto text-2xl mb-2 transition-all duration-300 ${
            dragOver ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-500'
          }`} />
        </div>
        <p className="text-gray-700 mb-1 font-medium transition-colors duration-300 group-hover:text-gray-800 text-sm">
          {dragOver ? '📁 Drop files here!' : 'Drag & drop or click to upload additional files'}
        </p>
        <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
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
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {displayFiles.map((file) => (
            <div key={file.id} className={`bg-white rounded-lg p-3 border ${file.isReplaced ? 'border-amber-100 bg-amber-50/30' : file.isNew ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                  {getFileIcon(file.filetype)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {file.filename || file.name || 'Document'}
                    {file.isReplaced && <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-bold uppercase">Replaced</span>}
                    {file.isNew && !file.isReplacement && <span className="ml-2 text-xs text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded font-bold uppercase">New</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatFileSize(file.filesize || file.size)} • 
                    {file.isExisting ? ' Existing' : ' New'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {file.isExisting && !file.isReplaced ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReplaceExisting(file.id)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                        title="Replace file"
                      >
                        <FaUpload size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExisting(file.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg"
                        title="Delete file"
                      >
                        <FaTrash size={12} />
                      </button>
                    </>
                  ) : file.isNew ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(file.id)}
                      className="p-2 text-gray-400 bg-gray-100 rounded-lg"
                      title="Remove file"
                    >
                      <FaTimes size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Year</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={file.year || ''}
                      onChange={(e) => handleYearChange(file.id, e.target.value)}
                      placeholder="Enter Year"
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={file.description || ''}
                      onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
                      placeholder="Brief description..."
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
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
  onReplace = null,
  onRemove = null,
  existing = false
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <FaFilePdf className="text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600">{description}</p>
            {year && (
              <span className="text-xs font-medium text-blue-600 mt-1 inline-block">
                Year: {year}
              </span>
            )}
          </div>
        </div>
        
        {existing && (onReplace || onRemove) && (
          <div className="flex gap-1">
            {onReplace && (
              <button
                onClick={onReplace}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Replace PDF"
              >
                <FaUpload size={14} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove PDF"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {pdfUrl && (
        <div className="flex gap-2 mt-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaEye /> Preview
          </a>
          <a
            href={pdfUrl}
            download={pdfName || `${title}.pdf`}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload /> Download
          </a>
        </div>
      )}
    </div>
  );
}

// Documents Modal Component
function DocumentsModal({ onClose, onSave, documents, loading }) {
  const [currentStep, setCurrentStep] = useState(0)
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
  })
  
  const [examYears, setExamYears] = useState({
    form1ResultsYear: documents?.examResults?.form1?.year?.toString() || '',
    form2ResultsYear: documents?.examResults?.form2?.year?.toString() || '',
    form3ResultsYear: documents?.examResults?.form3?.year?.toString() || '',
    form4ResultsYear: documents?.examResults?.form4?.year?.toString() || '',
    mockExamsYear: documents?.examResults?.mockExams?.year?.toString() || '',
    kcseYear: documents?.examResults?.kcse?.year?.toString() || ''
  })

  const [additionalFiles, setAdditionalFiles] = useState([])
  const [actionLoading, setActionLoading] = useState(false)

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
  ]

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

  const handleExamYearChange = (field, value) => {
    setExamYears(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                <FaFilePdf className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Manage School Documents</h2>
                <p className="text-blue-100 text-sm">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="p-3 border-b">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <step.icon className="text-xs" />
                {step.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleFormSubmit}>
            {currentStep === 0 && (
              <div className="space-y-4">
                <ModernPdfUpload 
                  pdfFile={formData.curriculumPDF}
                  onPdfChange={(file) => handleFileChange('curriculumPDF', file)}
                  onRemove={() => handleFileRemove('curriculumPDF')}
                  label="Curriculum PDF"
                  existingPdf={getExistingPdfData('curriculumPDF')}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <ModernPdfUpload 
                  pdfFile={formData.feesDayDistributionPdf}
                  onPdfChange={(file) => handleFileChange('feesDayDistributionPdf', file)}
                  onRemove={() => handleFileRemove('feesDayDistributionPdf')}
                  label="Day School Fees PDF"
                  existingPdf={getExistingPdfData('feesDayDistributionPdf')}
                />
                
                <ModernPdfUpload 
                  pdfFile={formData.feesBoardingDistributionPdf}
                  onPdfChange={(file) => handleFileChange('feesBoardingDistributionPdf', file)}
                  onRemove={() => handleFileRemove('feesBoardingDistributionPdf')}
                  label="Boarding School Fees PDF"
                  existingPdf={getExistingPdfData('feesBoardingDistributionPdf')}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <ModernPdfUpload 
                  pdfFile={formData.admissionFeePdf}
                  onPdfChange={(file) => handleFileChange('admissionFeePdf', file)}
                  onRemove={() => handleFileRemove('admissionFeePdf')}
                  label="Admission Fee PDF"
                  existingPdf={getExistingPdfData('admissionFeePdf')}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                {[
                  { key: 'form1ResultsPdf', label: 'Form 1 Results', yearKey: 'form1ResultsYear', existing: documents?.form1ResultsPdf },
                  { key: 'form2ResultsPdf', label: 'Form 2 Results', yearKey: 'form2ResultsYear', existing: documents?.form2ResultsPdf },
                  { key: 'form3ResultsPdf', label: 'Form 3 Results', yearKey: 'form3ResultsYear', existing: documents?.form3ResultsPdf },
                  { key: 'form4ResultsPdf', label: 'Form 4 Results', yearKey: 'form4ResultsYear', existing: documents?.form4ResultsPdf },
                  { key: 'mockExamsResultsPdf', label: 'Mock Exams', yearKey: 'mockExamsYear', existing: documents?.mockExamsResultsPdf },
                  { key: 'kcseResultsPdf', label: 'KCSE Results', yearKey: 'kcseYear', existing: documents?.kcseResultsPdf }
                ].map((exam) => (
                  <div key={exam.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">{exam.label}</label>
                      <div className="w-24">
                        <input
                          type="number"
                          min="2000"
                          max="2100"
                          value={examYears[exam.yearKey]}
                          onChange={(e) => handleExamYearChange(exam.yearKey, e.target.value)}
                          placeholder="Year"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <ModernPdfUpload 
                      pdfFile={formData[exam.key]}
                      onPdfChange={(file) => handleFileChange(exam.key, file)}
                      onRemove={() => handleFileRemove(exam.key)}
                      label={`${exam.label} PDF`}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
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
            )}

            <div className="flex justify-between pt-6 border-t mt-6">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save All Documents'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// API Service for Documents
const documentsApiService = {
  async getSchoolDocuments(schoolId) {
    try {
      const response = await fetch(`/api/schooldocuments?${schoolId}`);
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
}

export default function SchoolDocumentsPage() {
  const [documents, setDocuments] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // First get school info to get school ID
      const schoolResponse = await fetch('/api/schooldocuments')
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json()
        setSchoolInfo(schoolData.school || schoolData)
        
        // Then get documents for this school
        if (schoolData.school?.id || schoolData.id) {
          const schoolId = schoolData.school?.id || schoolData.id
          const docsResponse = await documentsApiService.getSchoolDocuments(schoolId)
          setDocuments(docsResponse.document || docsResponse)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

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
    return <ModernLoadingSpinner message="Loading school documents..." size="medium" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />

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
            
            <p className="text-blue-50/80 text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
              Manage all school documents including curriculum, fee structures, admission forms, and exam results.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto bg-white/10 backdrop-blur-lg sm:bg-transparent p-4 sm:p-0 rounded-[2rem] sm:rounded-none shadow-lg sm:shadow-none border border-white/20 sm:border-none">
            
            <button 
              onClick={loadData} 
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-5 py-3 sm:py-2.5 rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-sm shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" thickness={6} />
              ) : (
                <FaSync className="text-sm" /> 
              )}
              <span className="whitespace-nowrap">
                {loading ? 'Syncing...' : 'Refresh'}
              </span>
            </button>
            
            <button 
              onClick={() => setShowModal(true)} 
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-sm shadow-lg active:scale-[0.98]"
            >
              <FaUpload className="text-sm" />
              <span className="whitespace-nowrap">Manage Documents</span>
            </button>
          </div>
        </div>
      </div>

      {documents || schoolInfo ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
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

              {/* Additional Files */}
              {documents?.additionalResultsFiles && documents.additionalResultsFiles.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.additionalResultsFiles.map((file, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FaFileAlt className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {file.filename || file.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {file.year && <div>Year: {file.year}</div>}
                          {file.description && <div>{file.description}</div>}
                        </div>
                        {file.filepath && (
                          <div className="flex gap-2 mt-3">
                            <a
                              href={file.filepath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View
                            </a>
                            <a
                              href={file.filepath}
                              download
                              className="text-xs text-green-600 hover:text-green-800"
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
            </div>

            {(!documents || Object.keys(documents).length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <FaFilePdf className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Documents Found</h3>
                <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                  Upload school documents including curriculum, fee structures, and exam results.
                </p>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-200 font-bold shadow flex items-center gap-1 mx-auto text-sm cursor-pointer"
                >
                  <FaUpload /> Upload Documents
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FaFilePdf className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No School Information Found</h3>
          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
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
  )
}