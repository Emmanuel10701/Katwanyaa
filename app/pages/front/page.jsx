// components/modern/DownloadStatsButton.jsx
'use client';

import { useState } from 'react';
import { 
  FaDownload, FaFilePdf, FaFileVideo, FaFileImage, 
  FaChartBar, FaSpinner, FaFolderOpen 
} from 'react-icons/fa';

const DownloadStatsButton = ({ schoolData }) => {
  const [downloading, setDownloading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const getFileStats = () => {
    if (!schoolData) return null;
    
    const stats = {
      total: 0,
      pdfs: 0,
      videos: 0,
      images: 0,
      others: 0,
      totalSize: 0
    };

    // Count curriculum PDF
    if (schoolData.curriculumPDF) {
      stats.total++;
      stats.pdfs++;
    }

    // Count fee PDFs
    if (schoolData.feesDayDistributionPdf) {
      stats.total++;
      stats.pdfs++;
    }
    if (schoolData.feesBoardingDistributionPdf) {
      stats.total++;
      stats.pdfs++;
    }
    if (schoolData.admissionFeePdf) {
      stats.total++;
      stats.pdfs++;
    }

    // Count video
    if (schoolData.videoTour) {
      stats.total++;
      stats.videos++;
    }

    // Count exam results
    if (schoolData.examResults) {
      Object.values(schoolData.examResults).forEach(result => {
        if (result.pdf) {
          stats.total++;
          stats.pdfs++;
        }
      });
    }

    // Count additional files
    if (schoolData.additionalResultsFiles) {
      schoolData.additionalResultsFiles.forEach(file => {
        stats.total++;
        if (file.filetype?.includes('pdf')) stats.pdfs++;
        else if (file.filetype?.includes('image')) stats.images++;
        else if (file.filetype?.includes('video')) stats.videos++;
        else stats.others++;
        
        if (file.filesize) stats.totalSize += file.filesize;
      });
    }

    return stats;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadAll = async () => {
    if (!schoolData) return;
    
    try {
      setDownloading(true);
      
      // This would be your actual download logic
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('All files downloaded successfully!');
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = getFileStats();

  if (!stats || stats.total === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleDownloadAll}
        onMouseEnter={() => setShowStats(true)}
        onMouseLeave={() => setShowStats(false)}
        disabled={downloading}
        className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 flex items-center gap-3"
      >
        <div className="relative">
          {downloading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaDownload className="group-hover:animate-bounce" />
          )}
        </div>
        <span>
          {downloading ? 'Downloading...' : 'Download All Files'}
        </span>
        <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">
          {stats.total}
        </span>
      </button>

      {/* Stats Tooltip */}
      {showStats && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <FaChartBar className="text-blue-500" />
            <h4 className="font-bold text-gray-900">Download Summary</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Files</span>
              <span className="font-bold">{stats.total}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                <span className="text-gray-600 flex-1">PDF Documents</span>
                <span className="font-bold">{stats.pdfs}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FaFileVideo className="text-blue-500" />
                <span className="text-gray-600 flex-1">Videos</span>
                <span className="font-bold">{stats.videos}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FaFileImage className="text-green-500" />
                <span className="text-gray-600 flex-1">Images</span>
                <span className="font-bold">{stats.images}</span>
              </div>
            </div>
            
            {stats.totalSize > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Size</span>
                  <span className="font-bold">{formatBytes(stats.totalSize)}</span>
                </div>
              </div>
            )}
            
            <button className="w-full mt-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
              Download All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadStatsButton;