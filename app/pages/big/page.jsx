// components/modern/ModernFileGallery.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FaFilePdf, FaFileVideo, FaFileImage, FaFileAlt, FaFileWord, 
  FaFileExcel, FaFile, FaDownload, FaExternalLinkAlt, FaEye,
  FaPlay, FaTimes, FaFolder, FaFilter, FaSearch, FaSort,
  FaCalendarAlt, FaUserGraduate, FaMoneyBillWave, FaBook,
  FaUniversity, FaAward, FaVideo, FaYoutube, FaImage,
  FaSpinner, FaCloudDownload
} from 'react-icons/fa';

// 1. File Card Component
const ModernFileCard = ({ file, onPreview, onDownload }) => {
  const [imageError, setImageError] = useState(false);
  const [hover, setHover] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="text-gray-400" />;
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('video') || type.includes('mp4') || type.includes('mov')) return <FaFileVideo className="text-blue-500" />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <FaFileImage className="text-green-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="text-blue-600" />;
    if (type.includes('excel') || type.includes('xls')) return <FaFileExcel className="text-green-600" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'curriculum': return <FaBook className="text-purple-500" />;
      case 'fees': return <FaMoneyBillWave className="text-green-500" />;
      case 'admission': return <FaUserGraduate className="text-blue-500" />;
      case 'exam': return <FaAward className="text-orange-500" />;
      case 'video': return <FaVideo className="text-red-500" />;
      case 'additional': return <FaFolder className="text-gray-500" />;
      default: return <FaFile className="text-gray-400" />;
    }
  };

  const getThumbnail = () => {
    if (file.category === 'video' && file.videoThumbnail && !imageError) {
      return file.videoThumbnail;
    }
    if (file.thumbnail && !imageError) {
      return file.thumbnail;
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    await onDownload(file);
    setIsDownloading(false);
  };

  const thumbnail = getThumbnail();

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Card Header with Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {thumbnail ? (
          <div className="relative h-full">
            <img 
              src={thumbnail} 
              alt={file.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${hover ? 'scale-105' : ''}`}
              onError={() => setImageError(true)}
            />
            {hover && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                {file.category === 'video' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <FaPlay className="text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className={`text-4xl mb-3 transition-transform ${hover ? 'scale-110' : ''}`}>
              {getFileIcon(file.type)}
            </div>
            {file.category === 'video' && (
              <div className="mt-2">
                <FaVideo className="text-gray-400 text-lg" />
              </div>
            )}
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
          {getCategoryIcon(file.category)}
          <span className="text-xs font-bold text-gray-700 uppercase tracking-tighter">
            {file.category}
          </span>
        </div>
        
        {/* Year Badge */}
        {file.year && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
            {file.year}
          </div>
        )}
      </div>
      
      {/* Card Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
              {file.name}
            </h4>
            {file.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {file.description}
              </p>
            )}
          </div>
        </div>
        
        {/* File Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">
              {formatFileSize(file.size)}
            </span>
            {file.type && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase">
                {file.type}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-400">
              {getFileIcon(file.type)}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 transition-all duration-300 ${hover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          {onPreview && (
            <button
              onClick={() => onPreview(file)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaEye className="text-sm" />
              Preview
            </button>
          )}
          
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-70"
          >
            {isDownloading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaDownload className="text-sm" />
            )}
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. File Preview Modal
const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);

  if (!isOpen || !file) return null;

  const isVideo = file.category === 'video';
  const isImage = file.type?.includes('image');
  const isPdf = file.type?.includes('pdf');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {isVideo ? <FaVideo className="text-blue-600" /> : 
               isPdf ? <FaFilePdf className="text-red-500" /> : 
               <FaFileAlt className="text-gray-600" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {file.category} • {file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {isVideo ? (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                controls
                autoPlay
                className="w-full max-h-[70vh]"
                onLoadedData={() => setLoading(false)}
                onError={() => setLoading(false)}
              >
                <source src={file.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isImage ? (
            <div className="flex justify-center">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] rounded-lg"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </div>
          ) : isPdf ? (
            <div className="h-[70vh]">
              <iframe
                src={file.url}
                title={file.name}
                className="w-full h-full rounded-lg border"
                onLoad={() => setLoading(false)}
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 text-gray-300">
                <FaFile />
              </div>
              <p className="text-gray-500">Preview not available for this file type</p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open File
              </a>
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <a
            href={file.url}
            download={file.name}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-center"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

// 3. Main File Gallery Component - UPDATED with actual Supabase fetching
const ModernFileGallery = ({ schoolData }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Fetch files from Supabase and organize them
  useEffect(() => {
    const fetchAndOrganizeFiles = async () => {
      if (!schoolData) return;

      setLoading(true);
      const organizedFiles = [];

      try {
        // 1. Curriculum File
        if (schoolData.curriculumPDF) {
          organizedFiles.push({
            id: 'curriculum',
            name: schoolData.curriculumPdfName || 'Curriculum.pdf',
            url: fixSupabaseUrl(schoolData.curriculumPDF),
            category: 'curriculum',
            type: 'pdf',
            icon: <FaBook />,
            color: 'purple'
          });
        }

        // 2. Fee Structure Files
        if (schoolData.feesDayDistributionPdf) {
          organizedFiles.push({
            id: 'fees-day',
            name: schoolData.feesDayPdfName || 'Day School Fees.pdf',
            url: fixSupabaseUrl(schoolData.feesDayDistributionPdf),
            category: 'fees',
            type: 'pdf',
            icon: <FaMoneyBillWave />,
            color: 'green'
          });
        }

        if (schoolData.feesBoardingDistributionPdf) {
          organizedFiles.push({
            id: 'fees-boarding',
            name: schoolData.feesBoardingPdfName || 'Boarding Fees.pdf',
            url: fixSupabaseUrl(schoolData.feesBoardingDistributionPdf),
            category: 'fees',
            type: 'pdf',
            icon: <FaUniversity />,
            color: 'green'
          });
        }

        if (schoolData.admissionFeePdf) {
          organizedFiles.push({
            id: 'admission-fees',
            name: schoolData.admissionFeePdfName || 'Admission Fees.pdf',
            url: fixSupabaseUrl(schoolData.admissionFeePdf),
            category: 'admission',
            type: 'pdf',
            icon: <FaUserGraduate />,
            color: 'blue'
          });
        }

        // 3. Video Tour
        if (schoolData.videoTour) {
          if (schoolData.videoType === 'file') {
            organizedFiles.push({
              id: 'video-tour',
              name: 'School Video Tour',
              url: fixSupabaseUrl(schoolData.videoTour),
              category: 'video',
              type: 'video/mp4',
              videoThumbnail: schoolData.videoThumbnail,
              icon: <FaVideo />,
              color: 'red'
            });
          } else if (schoolData.videoType === 'youtube') {
            organizedFiles.push({
              id: 'youtube-video',
              name: 'YouTube Tour',
              url: schoolData.videoTour,
              category: 'video',
              type: 'youtube',
              icon: <FaYoutube />,
              color: 'red'
            });
          }
        }

        // 4. Exam Results
        if (schoolData.examResults) {
          await Promise.all(
            Object.entries(schoolData.examResults).map(async ([key, result]) => {
              if (result.pdf) {
                const fileUrl = fixSupabaseUrl(result.pdf);
                const fileInfo = await getFileInfoFromSupabase(fileUrl);
                
                organizedFiles.push({
                  id: `exam-${key}`,
                  name: result.name || `${key.replace(/([A-Z])/g, ' $1').trim()} Results.pdf`,
                  url: fileUrl,
                  category: 'exam',
                  type: 'pdf',
                  year: result.year,
                  size: fileInfo?.size,
                  icon: <FaAward />,
                  color: 'orange'
                });
              }
            })
          );
        }

        // 5. Additional Files
        if (schoolData.additionalResultsFiles && schoolData.additionalResultsFiles.length > 0) {
          await Promise.all(
            schoolData.additionalResultsFiles.map(async (file, index) => {
              if (file.filepath || file.url) {
                const fileUrl = fixSupabaseUrl(file.filepath || file.url);
                const fileInfo = await getFileInfoFromSupabase(fileUrl);
                
                organizedFiles.push({
                  id: `additional-${index}`,
                  name: file.filename || file.name || `Additional File ${index + 1}`,
                  url: fileUrl,
                  category: 'additional',
                  type: file.filetype || 'file',
                  year: file.year,
                  description: file.description,
                  size: fileInfo?.size || file.filesize,
                  icon: <FaFolder />,
                  color: 'gray'
                });
              }
            })
          );
        }

        setFiles(organizedFiles);
        setFilteredFiles(organizedFiles);
      } catch (error) {
        console.error('Error organizing files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndOrganizeFiles();
  }, [schoolData]);

  // Helper function to fix Supabase URLs
  const fixSupabaseUrl = (url) => {
    if (!url) return url;
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) return url;
    
    // If it's a path, construct the full URL with proper encoding
    const bucketName = 'Katwanyaa%20High';
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkzsthlhoqwelzbxjyum.supabase.co';
    return `${baseUrl}/storage/v1/object/public/${bucketName}/${encodeURIComponent(url)}`;
  };

  // Helper function to get file info from Supabase
  const getFileInfoFromSupabase = async (fileUrl) => {
    try {
      // Make a HEAD request to get file info without downloading
      const response = await fetch(fileUrl, { method: 'HEAD' });
      
      if (response.ok) {
        return {
          size: parseInt(response.headers.get('content-length') || '0'),
          type: response.headers.get('content-type') || 'application/octet-stream',
          lastModified: response.headers.get('last-modified')
        };
      }
    } catch (error) {
      console.error('Error getting file info:', error);
    }
    return null;
  };

  // Filter and sort files
  useEffect(() => {
    let result = [...files];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(file => file.category === selectedCategory);
    }

    // Sort files
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredFiles(result);
  }, [files, searchTerm, selectedCategory, sortBy]);

  const categories = [
    { id: 'all', name: 'All Files', count: files.length },
    { id: 'curriculum', name: 'Curriculum', count: files.filter(f => f.category === 'curriculum').length },
    { id: 'fees', name: 'Fee Structure', count: files.filter(f => f.category === 'fees').length },
    { id: 'admission', name: 'Admission', count: files.filter(f => f.category === 'admission').length },
    { id: 'exam', name: 'Exam Results', count: files.filter(f => f.category === 'exam').length },
    { id: 'video', name: 'Videos', count: files.filter(f => f.category === 'video').length },
    { id: 'additional', name: 'Additional', count: files.filter(f => f.category === 'additional').length },
  ];

  const handleDownload = async (file) => {
    try {
      // For YouTube videos, just open in new tab
      if (file.type === 'youtube') {
        window.open(file.url, '_blank');
        return;
      }

      // Fix URL encoding if needed
      let downloadUrl = file.url;
      if (downloadUrl && downloadUrl.includes('Katwanyaa High') && !downloadUrl.includes('Katwanyaa%20High')) {
        downloadUrl = downloadUrl.replace('Katwanyaa High', 'Katwanyaa%20High');
      }

      // Fetch the file
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      toast.success(`Downloaded ${file.name}`);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${file.name}`);
    }
  };

  const handlePreview = (file) => {
    if (file.type === 'youtube') {
      window.open(file.url, '_blank');
      return;
    }
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    
    try {
      setDownloadingAll(true);
      
      // Download files one by one with delays
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await handleDownload(file);
        
        // Add delay between downloads to avoid overwhelming
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast.success(`Downloaded all ${files.length} files!`);
      
    } catch (error) {
      console.error('Batch download error:', error);
      toast.error('Some files failed to download');
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleDownloadCategory = async (categoryId) => {
    const categoryFiles = files.filter(f => f.category === categoryId);
    if (categoryFiles.length === 0) return;
    
    try {
      for (const file of categoryFiles) {
        await handleDownload(file);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast.success(`Downloaded ${categoryFiles.length} files from ${categoryId}`);
    } catch (error) {
      console.error('Category download error:', error);
      toast.error('Failed to download category files');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading files from Supabase...</p>
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl text-gray-300 mb-3">
          <FaFolder />
        </div>
        <p className="text-gray-500">No school data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">School Media Gallery</h2>
            <p className="text-blue-100 opacity-90">
              Browse and download all school documents, videos, and resources from Supabase
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll || files.length === 0}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {downloadingAll ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCloudDownload />
              )}
              {downloadingAll ? 'Downloading...' : `Download All (${files.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Category Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <FaFolder className="text-blue-500" />
          Quick Category Downloads
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.filter(cat => cat.id !== 'all' && cat.count > 0).map(cat => (
            <button
              key={cat.id}
              onClick={() => handleDownloadCategory(cat.id)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <FaDownload className="text-xs" />
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort By */}
          <div className="relative">
            <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="name">Sort by Name</option>
              <option value="year">Sort by Year</option>
              <option value="size">Sort by Size</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === cat.id ? 
              'bg-blue-600 text-white shadow-md' : 
              'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name} 
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${selectedCategory === cat.id ? 
              'bg-white/30' : 'bg-gray-300'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-5xl text-gray-300 mb-4">
            <FaFolder />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No files found</h3>
          <p className="text-gray-500">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map(file => (
            <ModernFileCard
              key={file.id}
              file={file}
              onPreview={handlePreview}
              onDownload={() => handleDownload(file)}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{files.length}</div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {files.filter(f => f.type?.includes('pdf')).length}
            </div>
            <div className="text-sm text-gray-600">PDF Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {files.filter(f => f.category === 'video').length}
            </div>
            <div className="text-sm text-gray-600">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {files.filter(f => f.category === 'additional').length}
            </div>
            <div className="text-sm text-gray-600">Additional Files</div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        file={selectedFile}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
    </div>
  );
};

export default ModernFileGallery;