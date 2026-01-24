'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaFilePdf, FaFileVideo, FaFileImage, FaFileAlt
} from 'react-icons/fa';
import { toast } from 'sonner';

export default function BulkUploader({ folder = 'documents' }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true
  });

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const results = [];
    
    for (const fileObj of files.filter(f => f.status === 'pending')) {
      try {
        // Update status
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading', progress: 10 } : f
        ));
        
        // Upload file
        const result = await window.fileManager.uploadFile(fileObj.file, folder);
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'success', 
            progress: 100,
            url: result.url,
            path: result.path
          } : f
        ));
        
        results.push({ success: true, file: fileObj.file.name });
        
        // Simulate progress updates
        for (let i = 20; i <= 90; i += 10) {
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id ? { ...f, progress: i } : f
            ));
          }, (i - 10) * 50);
        }
        
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'error', 
            error: error.message 
          } : f
        ));
        results.push({ success: false, file: fileObj.file.name, error: error.message });
      }
    }
    
    setUploading(false);
    
    // Show summary
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) failed to upload`);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FaFileImage className="text-green-500" />;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return <FaFileVideo className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Bulk Upload to Supabase</h3>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-700 mb-2">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-500">
          or click to select files (PDF, Images, Videos)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-700">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-xl">
                    {getFileIcon(fileObj.file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {fileObj.status === 'pending' && (
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimesCircle />
                    </button>
                  )}
                  
                  {fileObj.status === 'uploading' && (
                    <>
                      <span className="text-sm text-blue-600">{fileObj.progress}%</span>
                      <FaSpinner className="animate-spin text-blue-500" />
                    </>
                  )}
                  
                  {fileObj.status === 'success' && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                  
                  {fileObj.status === 'error' && (
                    <div className="text-red-500" title={fileObj.error}>
                      <FaTimesCircle />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          {uploading && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ 
                    width: `${Math.round(
                      files.reduce((sum, f) => sum + f.progress, 0) / files.length
                    )}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className={`mt-6 w-full py-3 rounded-lg font-semibold transition-colors ${
              uploading || files.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin inline mr-2" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} file(s) to Supabase`
            )}
          </button>
        </div>
      )}
    </div>
  );
}