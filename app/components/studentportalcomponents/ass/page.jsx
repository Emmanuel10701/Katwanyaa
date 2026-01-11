'use client';

import { 
  useState, useMemo, useEffect, useCallback 
} from 'react';
import {
  FiGrid, FiList, FiSearch, FiFilter, FiDownload,
  FiEye, FiFileText, FiVideo, FiImage, FiMic,
  FiCalendar, FiUser, FiClock, FiCheckCircle,
  FiAward, FiArrowRight, FiX, FiBook, FiFile,
  FiRefreshCw, FiAlertTriangle, FiExternalLink,
  FiChevronDown, FiChevronUp, FiCheck, FiStar,
  FiBarChart2, FiTrendingUp, FiTrendingDown, FiInfo,
  FiPrinter, FiShare2, FiBell, FiBookOpen
} from 'react-icons/fi';
import {
  IoDocumentsOutline, IoFolderOpen, IoStatsChart,
  IoAnalytics, IoSparkles, IoClose, IoFilter,
  IoSchool, IoDocumentAttach
} from 'react-icons/io5';
import {
  CircularProgress,
  Tooltip,
  Badge,
  Chip
} from '@mui/material';

// ==================== HELPER FUNCTIONS ====================

const extractFileInfoFromUrl = (url) => {
  if (!url) return null;
  
  const fileName = url.split('/').pop() || url;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const getFileType = (ext) => {
    const typeMap = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'txt': 'Text File',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'mp4': 'Video',
      'mov': 'Video',
      'avi': 'Video',
      'mp3': 'Audio',
      'wav': 'Audio',
      'm4a': 'Audio',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ppt': 'Presentation',
      'pptx': 'Presentation',
      'zip': 'Archive',
      'rar': 'Archive'
    };
    return typeMap[ext] || 'File';
  };

  return {
    url,
    fileName,
    extension,
    fileType: getFileType(extension)
  };
};

const getFileIcon = (fileType, extension) => {
  const type = fileType?.toLowerCase() || extension?.toLowerCase() || '';
  
  if (type.includes('pdf')) return <FiFileText className="text-red-500" />;
  if (type.includes('word') || ['doc', 'docx'].includes(type)) return <FiFileText className="text-blue-500" />;
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) return <FiImage className="text-pink-500" />;
  if (type.includes('video') || ['mp4', 'mov', 'avi'].includes(type)) return <FiVideo className="text-purple-500" />;
  if (type.includes('audio') || ['mp3', 'wav', 'm4a'].includes(type)) return <FiMic className="text-indigo-500" />;
  if (type.includes('excel') || ['xls', 'xlsx'].includes(type)) return <FiFileText className="text-emerald-500" />;
  if (type.includes('powerpoint') || ['ppt', 'pptx'].includes(type)) return <FiFileText className="text-orange-500" />;
  if (type.includes('zip') || type.includes('rar')) return <IoDocumentAttach className="text-amber-500" />;
  return <FiFile className="text-gray-600" />;
};

// ==================== NEW DOWNLOAD ALL FUNCTIONALITY ====================

const downloadAllFiles = async (items, activeTab) => {
  try {
    // Show loading indicator
    const loadingAlert = document.createElement('div');
    loadingAlert.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-[10000]';
    loadingAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Preparing download...</span>
      </div>
    `;
    document.body.appendChild(loadingAlert);

    const filesToDownload = [];
    
    if (activeTab === 'resources') {
      // Process resources
      items.forEach(resource => {
        if (resource.mainAttachment?.url) {
          filesToDownload.push({
            url: resource.mainAttachment.url,
            fileName: resource.mainAttachment.fileName || `resource_${resource.id || Date.now()}`,
            folder: `Resources/${resource.className || 'Other'}/${resource.subject || 'General'}`
          });
        }
      });
    } else {
      // Process assignments
      items.forEach(assignment => {
        // Add assignment files
        (assignment.assignmentFileAttachments || []).forEach((file, index) => {
          filesToDownload.push({
            url: file.url,
            fileName: file.fileName || `assignment_${assignment.id || Date.now()}_${index}`,
            folder: `Assignments/${assignment.className || 'Other'}/${assignment.subject || 'General'}`
          });
        });
        
        // Add additional attachments
        (assignment.attachmentAttachments || []).forEach((file, index) => {
          filesToDownload.push({
            url: file.url,
            fileName: file.fileName || `attachment_${assignment.id || Date.now()}_${index}`,
            folder: `Assignments/${assignment.className || 'Other'}/${assignment.subject || 'General'}`
          });
        });
      });
    }

    if (filesToDownload.length === 0) {
      document.body.removeChild(loadingAlert);
      alert('No files available for download');
      return;
    }

    // Update loading message
    loadingAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Downloading ${filesToDownload.length} files...</span>
      </div>
    `;

    // Download each file
    for (let i = 0; i < filesToDownload.length; i++) {
      const file = filesToDownload[i];
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = file.fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to download ${file.fileName}:`, error);
      }
    }

    // Show completion message
    loadingAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-green-300">✓</div>
        <span>Downloaded ${filesToDownload.length} files!</span>
      </div>
    `;
    
    setTimeout(() => {
      document.body.removeChild(loadingAlert);
    }, 3000);

  } catch (error) {
    console.error('Error downloading files:', error);
    const loadingAlert = document.querySelector('.fixed.top-4.right-4');
    if (loadingAlert) {
      loadingAlert.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="text-red-300">✗</div>
          <span>Download failed!</span>
        </div>
      `;
      setTimeout(() => {
        document.body.removeChild(loadingAlert);
      }, 3000);
    }
  }
};

// ==================== RESPONSIVE UTILITIES ====================

const scrollbarHideStyles = `
  @media (max-width: 767px) {
    .scrollbar-hide-sm::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-hide-sm {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    .scrollbar-hide-sm {
      overflow: auto;
    }
  }
`;

// ==================== COMPONENTS ====================

function ResourcesLoadingSpinner({ message = "Loading resources...", size = "medium" }) {
  const sizes = {
    small: { outer: 48, inner: 24 },
    medium: { outer: 64, inner: 32 },
    large: { outer: 80, inner: 40 }
  };

  const { outer, inner } = sizes[size];

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="relative">
              <CircularProgress 
                size={outer} 
                thickness={5}
                className="text-blue-600"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: inner, height: inner }}></div>
              </div>
            </div>
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-xl opacity-30"></div>
          </div>
          
          <div className="mt-8 space-y-3">
            <span className="block text-lg font-semibold text-gray-800">
              {message}
            </span>
            <div className="flex justify-center space-x-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const ResourceTypeIcon = ({ type, size = 20 }) => {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return <FiFileText className="text-red-500" size={size} />;
    case 'video':
      return <FiVideo className="text-purple-500" size={size} />;
    case 'image':
      return <FiImage className="text-pink-500" size={size} />;
    case 'audio':
      return <FiMic className="text-indigo-500" size={size} />;
    case 'document':
    case 'word':
      return <FiFileText className="text-blue-500" size={size} />;
    case 'presentation':
    case 'ppt':
      return <FiFileText className="text-orange-500" size={size} />;
    case 'worksheet':
    case 'excel':
      return <FiFileText className="text-emerald-500" size={size} />;
    default:
      return <FiFile className="text-gray-600" size={size} />;
  }
};

function StatusBadge({ status, size = "sm" }) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'reviewed':
        return {
          bg: 'from-emerald-500 to-emerald-700',
          text: 'text-emerald-700',
          label: 'Reviewed',
          icon: <FiCheckCircle className="text-emerald-500" />
        };
      case 'assigned':
        return {
          bg: 'from-blue-500 to-blue-700',
          text: 'text-blue-700',
          label: 'Assigned',
          icon: <FiClock className="text-blue-500" />
        };
      case 'completed':
        return {
          bg: 'from-purple-500 to-purple-700',
          text: 'text-purple-700',
          label: 'Completed',
          icon: <FiAward className="text-purple-500" />
        };
      case 'extended':
        return {
          bg: 'from-amber-500 to-amber-700',
          text: 'text-amber-700',
          label: 'Extended',
          icon: <FiCalendar className="text-amber-500" />
        };
      case 'pending':
        return {
          bg: 'from-gray-500 to-gray-700',
          text: 'text-gray-700',
          label: 'Pending',
          icon: <FiClock className="text-gray-500" />
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          text: 'text-gray-600',
          label: status || 'Unknown',
          icon: <FiInfo className="text-gray-500" />
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} bg-gradient-to-r ${config.bg} text-white rounded-full font-semibold`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

function AttachmentsSection({ 
  title, 
  attachments, 
  emptyMessage = "No attachments available",
  downloadAllLabel = "Download All",
  showDownloadAllButton = true,
  sectionType = "default" // "assignment-files", "additional", or "resources"
}) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Function to download all attachments in this section
  const handleDownloadAll = async () => {
    if (attachments.length === 0) {
      alert('No files available for download');
      return;
    }

    const loadingAlert = document.createElement('div');
    loadingAlert.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-[10000]';
    loadingAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Preparing download of ${attachments.length} files...</span>
      </div>
    `;
    document.body.appendChild(loadingAlert);

    try {
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];
        try {
          const response = await fetch(file.url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = file.fileName || `${sectionType}_${i + 1}`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to download ${file.fileName}:`, error);
        }
      }

      loadingAlert.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="text-green-300">✓</div>
          <span>Downloaded ${attachments.length} files!</span>
        </div>
      `;
      
      setTimeout(() => {
        document.body.removeChild(loadingAlert);
      }, 3000);
    } catch (error) {
      console.error('Error downloading files:', error);
      loadingAlert.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="text-red-300">✗</div>
          <span>Download failed!</span>
        </div>
      `;
      setTimeout(() => {
        document.body.removeChild(loadingAlert);
      }, 3000);
    }
  };

  // Get section colors based on type
  const getSectionColors = () => {
    switch (sectionType) {
      case 'assignment-files':
        return {
          bg: 'from-blue-50 to-blue-100',
          border: 'border-blue-300',
          icon: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-800',
          downloadBtn: 'from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
        };
      case 'additional':
        return {
          bg: 'from-emerald-50 to-emerald-100',
          border: 'border-emerald-300',
          icon: 'text-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800',
          downloadBtn: 'from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900'
        };
      case 'resources':
        return {
          bg: 'from-purple-50 to-purple-100',
          border: 'border-purple-300',
          icon: 'text-purple-500',
          badge: 'bg-purple-100 text-purple-800',
          downloadBtn: 'from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'
        };
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-300',
          icon: 'text-blue-500',
          badge: 'bg-gray-200 text-gray-800',
          downloadBtn: 'from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900'
        };
    }
  };

  const colors = getSectionColors();

  return (
    <div className={`bg-gradient-to-r ${colors.bg} rounded-xl p-3 sm:p-4 md:p-6 border-2 ${colors.border}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <IoDocumentAttach className={`${colors.icon} flex-shrink-0`} />
          <span className="truncate">{title} ({attachments.length})</span>
        </h3>
        
        {showDownloadAllButton && attachments.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r ${colors.downloadBtn} text-white rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg transition-all flex items-center gap-1.5`}
          >
            <FiDownload className="text-sm" />
            <span>{downloadAllLabel} ({attachments.length})</span>
          </button>
        )}
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {attachments.map((attachment, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border ${colors.border} hover:border-blue-400 transition-colors group`}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg flex-shrink-0">
                {getFileIcon(attachment.fileType, attachment.extension)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                  {attachment.fileName}
                </div>
                <div className="text-xs text-gray-600 flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className={`${colors.badge} px-1.5 py-0.5 rounded text-xs`}>
                    {attachment.fileType || attachment.extension?.toUpperCase() || 'File'}
                  </span>
                  {attachment.fileSize && (
                    <span className="text-xs">{attachment.fileSize}</span>
                  )}
                  <span className="text-xs text-gray-500">File {index + 1}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-3 shrink-0">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Preview"
              >
                <FiEye size={14} className="sm:size-4" />
              </a>
              <a
                href={attachment.url}
                download={attachment.fileName}
                className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <FiDownload size={14} className="sm:size-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Download All Button for single files too */}
      {showDownloadAllButton && attachments.length === 1 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300">
          <button
            onClick={handleDownloadAll}
            className={`w-full px-3 py-2 bg-gradient-to-r ${colors.downloadBtn} text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2`}
          >
            <FiDownload className="text-base" />
            <span>Download This File</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ResourceStatsCard({ title, value, icon: Icon, color, trend = 0, prefix = '', suffix = '', description }) {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return prefix + val.toLocaleString() + suffix;
    }
    return prefix + val + suffix;
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <div className={`p-1.5 sm:p-2 md:p-3 rounded-xl bg-gradient-to-r ${color} flex-shrink-0`}>
          <Icon className="text-white text-lg sm:text-xl md:text-2xl" />
        </div>
        <div className={`text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg font-bold ${
          trend > 0 
            ? 'bg-green-100 text-green-800' 
            : trend < 0 
            ? 'bg-red-100 text-red-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : '0%'}
        </div>
      </div>
      <h4 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{formatValue(value)}</h4>
      <p className="text-gray-900 text-xs sm:text-sm font-semibold truncate">{title}</p>
      {description && (
        <p className="text-gray-600 text-xs mt-0.5 truncate">{description}</p>
      )}
    </div>
  );
}

function ResourceAssignmentCard({ item, type = 'resource', isStudentClass = false, onView, onDownload }) {
  const isResource = type === 'resource';
  const isOverdue = !isResource && new Date(item.dueDate) < new Date() && item.status !== 'completed';
  
  const totalAttachments = isResource 
    ? (item.mainAttachment ? 1 : 0)
    : ((item.assignmentFileAttachments?.length || 0) + (item.attachmentAttachments?.length || 0));

  return (
    <div 
      className={`bg-white rounded-2xl border-2 ${
        isStudentClass 
          ? 'border-blue-500 border-l-4 shadow-lg' 
          : 'border-gray-200'
      } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}
    >
      {isStudentClass && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-bl-lg font-bold shadow-lg">
            Your Class
          </div>
        </div>
      )}

      {isOverdue && (
        <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs px-2 py-0.5 text-center font-bold">
          ⚠️ Overdue
        </div>
      )}

      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={`p-1.5 sm:p-2 md:p-3 rounded-xl flex-shrink-0 ${
              isResource 
                ? 'bg-blue-50' 
                : item.status === 'completed' 
                  ? 'bg-emerald-50' 
                  : 'bg-amber-50'
            }`}>
              {isResource ? (
                <ResourceTypeIcon type={item.type} size={16} className="sm:size-5" />
              ) : (
                <FiBook className={`${item.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'} size-4 sm:size-5`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {isResource ? item.subject : `${item.subject} • ${item.teacher}`}
              </p>
            </div>
          </div>
          {!isResource && (
            <div className="ml-2 flex-shrink-0">
              <StatusBadge status={item.status} size="sm" />
            </div>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4">
          {!isResource && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FiCalendar size={12} className="sm:size-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs truncate">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <IoSchool size={12} className="sm:size-4 text-purple-500 flex-shrink-0" />
            <span className="text-xs truncate">{item.className}</span>
          </div>
          
          {totalAttachments > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoDocumentAttach size={12} className="sm:size-4 text-green-500 flex-shrink-0" />
              <span className="text-xs">
                {totalAttachments} {totalAttachments === 1 ? 'attachment' : 'attachments'}
              </span>
            </div>
          )}
          
          {isResource && item.fileSize && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FiFile size={12} className="sm:size-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs truncate">{item.fileSize}</span>
            </div>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-gray-700 mb-2 sm:mb-3 md:mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-col xs:flex-row gap-2">
          <button
            onClick={() => onView?.(item)}
            className="w-full xs:flex-1 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-xl text-xs sm:text-sm font-semibold hover:from-blue-100 hover:to-blue-200 transition-all flex items-center justify-center gap-1.5"
          >
            <FiEye size={12} className="sm:size-4" />
            {isResource ? 'Preview' : 'View Details'}
          </button>
          <button
            onClick={() => onDownload?.(item)}
            className="w-full xs:w-auto px-3 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:from-gray-100 hover:to-gray-200 transition-all flex items-center justify-center gap-1.5"
          >
            <FiDownload size={12} className="sm:size-4" />
            {totalAttachments > 0 && (
              <span className="ml-0.5">({totalAttachments})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourceDetailsModal({ item, type = 'resource', onClose, onDownload }) {
  if (!item) return null;

  const isResource = type === 'resource';
  const isOverdue = !isResource && new Date(item.dueDate) < new Date() && item.status !== 'completed';

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-gray-300 shadow-2xl">
          <div className={`p-3 sm:p-4 md:p-6 text-white ${
            isResource 
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800' 
              : 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 rounded-2xl flex-shrink-0">
                  {isResource ? (
                    <ResourceTypeIcon type={item.type} size={20} className="sm:size-6" />
                  ) : (
                    <FiBook className="text-white size-5 sm:size-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg md:text-2xl font-bold truncate">{item.title}</h2>
                  <p className="opacity-90 text-xs sm:text-sm mt-0.5 truncate">
                    {isResource ? `${item.type} • ${item.subject}` : `${item.subject} • ${item.teacher}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-2 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors flex-shrink-0 ml-2"
              >
                <IoClose className="text-lg sm:text-xl" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(90vh-72px)] sm:max-h-[calc(90vh-80px)] overflow-y-auto scrollbar-hide-sm p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {!isResource && <StatusBadge status={item.status} size="sm" className="sm:size-md" />}
              <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs sm:text-sm font-semibold">
                {item.className}
              </span>
              {isResource && (
                <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs sm:text-sm font-semibold">
                  {item.type}
                </span>
              )}
              {isOverdue && (
                <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 rounded-full text-xs sm:text-sm font-semibold">
                  ⚠️ Overdue
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {!isResource && (
                <>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-xs sm:text-sm font-semibold text-gray-700">Due Date</div>
                    <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mt-0.5 sm:mt-1">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-xs sm:text-sm font-semibold text-gray-700">Teacher</div>
                    <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">{item.teacher}</div>
                  </div>
                </>
              )}
              <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-xs sm:text-sm font-semibold text-gray-700">Subject</div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">{item.subject}</div>
              </div>
              {isResource && item.fileSize && (
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700">File Size</div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mt-0.5 sm:mt-1">{item.fileSize}</div>
                </div>
              )}
            </div>

            {item.description && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 md:p-6 border-2 border-gray-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Description</h3>
                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {!isResource && item.instructions && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5">
                  <FiInfo className="text-blue-500 flex-shrink-0" />
                  <span>Assignment Instructions</span>
                </h3>
                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{item.instructions}</p>
              </div>
            )}

            {isResource && item.mainAttachment && (
              <AttachmentsSection
                title="File Attachment"
                attachments={[item.mainAttachment]}
              />
            )}

            {!isResource && (
              <>
                {(item.assignmentFileAttachments?.length || 0) > 0 && (
                  <AttachmentsSection
                    title="Assignment Files"
                    attachments={item.assignmentFileAttachments || []}
                  />
                )}
                
                {(item.attachmentAttachments?.length || 0) > 0 && (
                  <AttachmentsSection
                    title="Additional Attachments"
                    attachments={item.attachmentAttachments || []}
                  />
                )}
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <button
                onClick={onClose}
                className="
                  w-full sm:w-auto
                  px-3 sm:px-4 py-2 sm:py-3
                  bg-gradient-to-r from-gray-100 to-gray-200
                  text-gray-700
                  rounded-xl
                  font-bold text-xs sm:text-sm
                  hover:from-gray-200 hover:to-gray-300
                  transition-all
                  flex items-center justify-center gap-1.5 sm:gap-2
                "
              >
                <FiArrowRight className="rotate-180 text-sm sm:text-base" />
                <span>Close</span>
              </button>

              <button
                onClick={() => onDownload?.(item)}
                className="
                  w-full sm:w-auto
                  px-3 sm:px-4 py-2 sm:py-3
                  bg-gradient-to-r from-blue-600 to-blue-800
                  text-white
                  rounded-xl
                  font-bold text-xs sm:text-sm
                  shadow-lg hover:shadow-xl
                  transition-all
                  flex items-center justify-center gap-1.5 sm:gap-2
                "
              >
                <FiDownload className="text-sm sm:text-base" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ModernResourcesAssignmentsView({
  student,
  onDownload,
  onViewDetails
}) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingAssignments: 0,
    totalResources: 0,
    pdfResources: 0,
    completedAssignments: 0,
    averageCompletion: 0
  });

  // Get student's class format
  const getStudentClass = useCallback(() => {
    if (!student || !student.form) return '';
    return `Form ${student.form} ${student.stream || ''}`.trim();
  }, [student]);

  // Fetch assignments from API
  const fetchAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    try {
      const response = await fetch('/api/assignment');
      const data = await response.json();
      if (data.success) {
        const processedAssignments = (data.assignments || []).map((assignment) => ({
          ...assignment,
          assignmentFileAttachments: (assignment.assignmentFiles || []).map((url) => ({
            ...extractFileInfoFromUrl(url),
            url
          })),
          attachmentAttachments: (assignment.attachments || []).map((url) => ({
            ...extractFileInfoFromUrl(url),
            url
          }))
        }));
        setAssignments(processedAssignments);
      } else {
        console.error('Failed to fetch assignments:', data);
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, []);

  // Fetch resources from API
  const fetchResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      if (data.success) {
        const processedResources = (data.resources || []).map((resource) => ({
          ...resource,
          mainAttachment: {
            url: resource.fileUrl,
            fileName: resource.fileName,
            fileSize: resource.fileSize,
            extension: resource.extension,
            fileType: resource.type
          }
        }));
        setResources(processedResources);
      } else {
        console.error('Failed to fetch resources:', data);
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    } else {
      fetchResources();
    }
  }, [activeTab, fetchAssignments, fetchResources]);

  useEffect(() => {
    fetchAssignments();
    fetchResources();
  }, [fetchAssignments, fetchResources]);

  // Calculate statistics
  useEffect(() => {
    const totalAssignments = assignments.length;
    const pendingAssignments = assignments.filter(a => 
      a.status === 'assigned' || a.status === 'in-progress' || a.status === 'pending'
    ).length;
    const totalResources = resources.length;
    const pdfResources = resources.filter(r => 
      r.type === 'pdf' || r.extension === 'pdf' || r.mainAttachment?.extension === 'pdf'
    ).length;
    const completedAssignments = assignments.filter(a => 
      a.status === 'completed' || a.status === 'reviewed'
    ).length;
    const averageCompletion = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100) 
      : 0;

    setStats({
      totalAssignments,
      pendingAssignments,
      totalResources,
      pdfResources,
      completedAssignments,
      averageCompletion
    });
  }, [assignments, resources]);

  // Extract unique filter values with student's class first
  const classes = useMemo(() => {
    const items = activeTab === 'assignments' ? assignments : resources;
    const studentClass = getStudentClass();
    
    // Get all unique classes
    const allClasses = [...new Set(items.map(item => item.className).filter(Boolean))];
    
    // Remove student's class from the list if it exists
    const otherClasses = allClasses.filter(cls => cls !== studentClass);
    
    // Return with student's class first if it exists in the data
    const finalClasses = ['all'];
    if (studentClass && allClasses.includes(studentClass)) {
      finalClasses.push(studentClass);
    }
    
    // Add remaining classes
    finalClasses.push(...otherClasses);
    
    return finalClasses;
  }, [assignments, resources, activeTab, getStudentClass]);

  const subjects = useMemo(() => {
    const items = activeTab === 'assignments' ? assignments : resources;
    return ['all', ...new Set(items.map(item => item.subject).filter(Boolean))];
  }, [assignments, resources, activeTab]);

  const statuses = useMemo(() => {
    return [
      { id: 'all', label: 'All Status', color: 'from-gray-500 to-gray-700' },
      { id: 'assigned', label: 'Assigned', color: 'from-blue-500 to-blue-700' },
      { id: 'in-progress', label: 'In Progress', color: 'from-amber-500 to-amber-700' },
      { id: 'reviewed', label: 'Reviewed', color: 'from-emerald-500 to-emerald-700' },
      { id: 'completed', label: 'Completed', color: 'from-purple-500 to-purple-700' },
      { id: 'pending', label: 'Pending', color: 'from-gray-500 to-gray-700' }
    ];
  }, []);

  const resourceTypes = useMemo(() => {
    const uniqueTypes = ['all', ...new Set(resources.map(r => r.type).filter(Boolean))];
    
    const typeConfigs = {
      'pdf': { label: 'PDF Documents', color: 'from-red-500 to-red-700' },
      'document': { label: 'Documents', color: 'from-blue-500 to-blue-700' },
      'video': { label: 'Videos', color: 'from-purple-500 to-purple-700' },
      'audio': { label: 'Audio Files', color: 'from-indigo-500 to-indigo-700' },
      'image': { label: 'Images', color: 'from-pink-500 to-pink-700' },
      'worksheet': { label: 'Worksheets', color: 'from-emerald-500 to-emerald-700' },
      'presentation': { label: 'Presentations', color: 'from-orange-500 to-orange-700' }
    };

    return uniqueTypes.map(type => ({
      id: type,
      label: type === 'all' ? 'All Types' : (typeConfigs[type]?.label || type.charAt(0).toUpperCase() + type.slice(1)),
      color: type === 'all' ? 'from-gray-500 to-gray-700' : (typeConfigs[type]?.color || 'from-gray-500 to-gray-700')
    }));
  }, [resources]);

  // Filter and sort assignments with student's class first
  const filteredAssignments = useMemo(() => {
    const studentClass = getStudentClass();
    
    return assignments.filter(assignment => {
      const matchesClass = selectedClass === 'all' || assignment.className === selectedClass;
      const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
      const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        assignment.title?.toLowerCase().includes(searchLower) ||
        assignment.description?.toLowerCase().includes(searchLower) ||
        assignment.subject?.toLowerCase().includes(searchLower) ||
        assignment.teacher?.toLowerCase().includes(searchLower);
      
      return matchesClass && matchesSubject && matchesStatus && matchesSearch;
    }).map(assignment => ({
      ...assignment,
      priority: assignment.className === studentClass ? 1 : 0
    })).sort((a, b) => {
      // First sort by student's class (priority)
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Then by due date
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [assignments, selectedClass, selectedSubject, selectedStatus, searchTerm, getStudentClass]);

  // Filter and sort resources with student's class first
  const filteredResources = useMemo(() => {
    const studentClass = getStudentClass();
    
    return resources.filter(resource => {
      const matchesType = selectedResourceType === 'all' || resource.type === selectedResourceType;
      const matchesClass = selectedClass === 'all' || resource.className === selectedClass;
      const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower) ||
        resource.subject?.toLowerCase().includes(searchLower);
      
      return matchesType && matchesClass && matchesSubject && matchesSearch;
    }).map(resource => ({
      ...resource,
      priority: resource.className === studentClass ? 1 : 0
    })).sort((a, b) => {
      // First sort by student's class (priority)
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Then by date added (if available) or title
      return (a.dateAdded || '').localeCompare(b.dateAdded || '') || 
             (a.title || '').localeCompare(b.title || '');
    });
  }, [resources, selectedResourceType, selectedClass, selectedSubject, searchTerm, getStudentClass]);

  const clearFilters = () => {
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedStatus('all');
    setSelectedResourceType('all');
    setSearchTerm('');
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    onViewDetails?.(item);
  };

  const handleDownload = (item) => {
    if (activeTab === 'resources') {
      if (item.mainAttachment?.url) {
        const link = document.createElement('a');
        link.href = item.mainAttachment.url;
        link.download = item.mainAttachment.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      if (item.assignmentFileAttachments?.[0]?.url) {
        const attachment = item.assignmentFileAttachments[0];
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (item.attachmentAttachments?.[0]?.url) {
        const attachment = item.attachmentAttachments[0];
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('No files available for download');
      }
    }
    
    onDownload?.(item);
  };

  // Download all functionality
  const handleDownloadAll = () => {
    const items = activeTab === 'assignments' ? filteredAssignments : filteredResources;
    downloadAllFiles(items, activeTab);
  };

  const currentItems = activeTab === 'assignments' ? filteredAssignments : filteredResources;
  const totalItems = activeTab === 'assignments' ? assignments.length : resources.length;
  const filteredCount = currentItems.length;
  const studentClass = getStudentClass();

  const isLoading = assignmentsLoading || resourcesLoading;

  if (isLoading && assignments.length === 0 && resources.length === 0) {
    return <ResourcesLoadingSpinner />;
  }

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-3 sm:p-4 md:p-6 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-2xl flex-shrink-0">
                  <IoDocumentsOutline className="text-lg sm:text-xl md:text-2xl text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-3xl font-bold truncate">Learning Resources & Assignments</h1>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-lg mt-0.5 truncate">
                    Access study materials and track your academic work
                    {student && (
                      <span className="ml-1 sm:ml-2 text-yellow-300 font-semibold">
                        ({studentClass})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {/* Download All Button */}
                {filteredCount > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 flex items-center gap-1.5"
                    title={`Download all ${filteredCount} ${activeTab}`}
                  >
                    <FiDownload className="text-sm sm:text-base" />
                    <span className="hidden sm:inline">Download All</span>
                    <span className="inline sm:hidden">All</span>
                    <span className="bg-white/30 px-1.5 py-0.5 rounded-md text-xs">
                      {filteredCount}
                    </span>
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-white/20 text-white rounded-xl font-bold text-xs sm:text-sm md:text-base hover:bg-white/30 disabled:opacity-50 flex items-center gap-1.5 justify-center"
                >
                  <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''} text-sm sm:text-base`} />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <ResourceStatsCard
            title="Total Assignments"
            value={stats.totalAssignments}
            icon={FiBook}
            color="from-purple-500 to-purple-700"
            trend={stats.totalAssignments > 0 ? Math.round((stats.pendingAssignments / stats.totalAssignments) * 100) : 0}
            description={`${stats.pendingAssignments} pending`}
          />
          <ResourceStatsCard
            title="Learning Resources"
            value={stats.totalResources}
            icon={IoDocumentsOutline}
            color="from-blue-500 to-blue-700"
            trend={stats.pdfResources}
            suffix=" PDFs"
            description="Study materials available"
          />
          <ResourceStatsCard
            title="Completion Rate"
            value={stats.averageCompletion}
            icon={FiCheckCircle}
            color="from-emerald-500 to-emerald-700"
            trend={stats.averageCompletion}
            suffix="%"
            description="Assignments completed"
          />
        </div>

        {/* Tabs & Filters */}
        <div className="bg-white rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 border-2 border-gray-200">
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`flex-1 py-1.5 sm:py-2 md:py-3 text-center font-bold text-xs sm:text-sm md:text-base border-b-2 ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <FiBook className="text-sm sm:text-base" />
                  <span className="truncate">Assignments ({assignments.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-1.5 sm:py-2 md:py-3 text-center font-bold text-xs sm:text-sm md:text-base border-b-2 ${
                  activeTab === 'resources'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <IoDocumentsOutline className="text-sm sm:text-base" />
                  <span className="truncate">Resources ({resources.length})</span>
                </div>
              </button>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-lg" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${activeTab === 'assignments' ? 'assignments' : 'resources'}...`}
                    className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-1.5 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="text-sm sm:text-base" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-bold flex items-center gap-0.5 sm:gap-1 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiGrid size={10} className="sm:size-3" />
                    <span className="hidden xs:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-bold flex items-center gap-0.5 sm:gap-1 ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiList size={10} className="sm:size-3" />
                    <span className="hidden xs:inline">List</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="p-1.5 sm:p-2 border-2 border-gray-300 rounded-xl text-gray-600 hover:text-gray-900"
                >
                  <FiFilter className="text-sm sm:text-base" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="pt-2 sm:pt-3 border-t border-gray-200">
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-0.5 sm:mb-1">Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {classes.map(cls => (
                        <option key={cls} value={cls}>
                          {cls === 'all' ? 'All Classes' : cls}
                          {cls === studentClass && ' (Your Class)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-0.5 sm:mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject === 'all' ? 'All Subjects' : subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeTab === 'assignments' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-0.5 sm:mb-1">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {statuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-0.5 sm:mb-1">Resource Type</label>
                      <select
                        value={selectedResourceType}
                        onChange={(e) => setSelectedResourceType(e.target.value)}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {resourceTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-end">
                    {(selectedClass !== 'all' || selectedSubject !== 'all' || 
                      selectedStatus !== 'all' || selectedResourceType !== 'all' || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg text-xs sm:text-sm font-bold hover:from-red-100 hover:to-red-200 transition-all flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <FiX className="text-sm" />
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div>
          {/* Results Summary */}
          <div className="mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">
              {studentClass} {activeTab === 'assignments' ? 'Assignments' : 'Learning Resources'}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm truncate">
              {filteredCount} of {totalItems} items • {studentClass} items shown first
              {searchTerm && ` • Search: "${searchTerm}"`}
              {isLoading && <span className="ml-1 sm:ml-2 text-blue-600">Loading...</span>}
            </p>
          </div>

          {/* Empty State */}
          {filteredCount === 0 && !isLoading ? (
            <div className="bg-white rounded-xl md:rounded-2xl border-2 border-gray-300 p-4 sm:p-6 md:p-8 text-center">
              <IoDocumentsOutline className="text-gray-300 text-xl sm:text-2xl md:text-4xl mx-auto mb-2 sm:mb-4" />
              <h3 className="text-sm sm:text-base md:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                No {activeTab === 'assignments' ? 'assignments' : 'resources'} found
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                {searchTerm ? 'Try a different search term' : 
                 selectedClass !== 'all' || selectedSubject !== 'all' || 
                 selectedStatus !== 'all' || selectedResourceType !== 'all' 
                 ? 'Try adjusting your filters' 
                 : `No ${activeTab === 'assignments' ? 'assignments' : 'resources'} available yet`}
              </p>
              {(searchTerm || selectedClass !== 'all' || selectedSubject !== 'all' || 
                selectedStatus !== 'all' || selectedResourceType !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View with student's class items first
            <div className="space-y-4 sm:space-y-6">
              {/* Student's Class Section */}
              {currentItems.some(item => item.priority === 1) && (
                <div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
                    <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                      Your Class ({studentClass})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {currentItems
                      .filter(item => item.priority === 1)
                      .map((item, index) => (
                        <ResourceAssignmentCard
                          key={index}
                          item={item}
                          type={activeTab}
                          isStudentClass={true}
                          onView={handleViewDetails}
                          onDownload={handleDownload}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Other Classes Section */}
              {currentItems.some(item => item.priority === 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 mt-4 sm:mt-6">
                    <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full"></div>
                    <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                      Other Classes
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {currentItems
                      .filter(item => item.priority === 0)
                      .map((item, index) => (
                        <ResourceAssignmentCard
                          key={index}
                          item={item}
                          type={activeTab}
                          isStudentClass={false}
                          onView={handleViewDetails}
                          onDownload={handleDownload}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl md:rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide-sm">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Class</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Title</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Subject</th>
                      {activeTab === 'assignments' ? (
                        <>
                          <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Due Date</th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                        </>
                      ) : (
                        <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                      )}
                      <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Attachments</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((item, index) => {
                      const totalAttachments = activeTab === 'assignments' 
                        ? ((item.assignmentFileAttachments?.length || 0) + 
                          (item.attachmentAttachments?.length || 0))
                        : item.mainAttachment ? 1 : 0;
                      
                      return (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors ${
                          item.priority === 1 ? 'bg-gradient-to-r from-blue-50/50 to-blue-50/30' : ''
                        }`}>
                          <td className="px-2 sm:px-3 md:px-4 py-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                {item.className}
                              </span>
                              {item.priority === 1 && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Your Class</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className={`p-1 sm:p-1.5 rounded-lg flex-shrink-0 ${
                                activeTab === 'assignments'
                                  ? 'bg-amber-50'
                                  : 'bg-blue-50'
                              }`}>
                                {activeTab === 'assignments' ? (
                                  <FiBook className="text-amber-500 size-3 sm:size-4" />
                                ) : (
                                  <ResourceTypeIcon type={item.type} size={12} className="sm:size-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.title}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 line-clamp-1 hidden sm:block">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm text-gray-900 truncate">{item.subject}</td>
                          {activeTab === 'assignments' ? (
                            <>
                              <td className="px-2 sm:px-3 md:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                {new Date(item.dueDate).toLocaleDateString()}
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 py-2 whitespace-nowrap">
                                <StatusBadge status={item.status} size="sm" />
                              </td>
                            </>
                          ) : (
                            <td className="px-2 sm:px-3 md:px-4 py-2">
                              <span className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 text-gray-700 rounded-md">
                                {item.type}
                              </span>
                            </td>
                          )}
                          <td className="px-2 sm:px-3 md:px-4 py-2">
                            {totalAttachments > 0 ? (
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <IoDocumentAttach className="text-green-500 text-xs sm:text-sm" />
                                <span className="text-xs text-gray-700">{totalAttachments}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => handleViewDetails(item)}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg text-xs font-bold hover:from-blue-100 hover:to-blue-200 transition-all flex items-center gap-0.5 sm:gap-1"
                              >
                                <FiEye size={10} className="sm:size-3" />
                                <span className="hidden xs:inline">View</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item)}
                                className="p-1 sm:p-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all"
                              >
                                <FiDownload size={10} className="sm:size-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selectedItem && (
          <ResourceDetailsModal
            item={selectedItem}
            type={activeTab}
            onClose={() => setSelectedItem(null)}
            onDownload={() => handleDownload(selectedItem)}
          />
        )}
      </div>
    </>
  );
}