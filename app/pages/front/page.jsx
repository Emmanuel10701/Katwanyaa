'use client';

import { useState, useEffect } from 'react';
import { 
  FaFilePdf, FaFileVideo, FaFileImage, FaFileAlt, 
  FaDownload, FaEye, FaTrash, FaFolder, FaUpload,
  FaSpinner, FaExternalLinkAlt, FaSearch, FaFilter
} from 'react-icons/fa';
import { toast } from 'sonner';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const folders = [
    { id: 'documents', name: 'Documents', icon: FaFileAlt },
    { id: 'videos', name: 'Videos', icon: FaFileVideo },
    { id: 'thumbnails', name: 'Thumbnails', icon: FaFileImage },
    { id: 'exam-results', name: 'Exam Results', icon: FaFilePdf },
    { id: 'additional-documents', name: 'Additional Files', icon: FaFolder }
  ];

  const fetchFiles = async (folder = selectedFolder) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files?folder=${folder}`);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
      } else {
        toast.error('Failed to fetch files');
      }
    } catch (error) {
      toast.error('Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

  const handleDeleteFile = async (filePath) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('File deleted successfully');
        fetchFiles(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file');
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // Use your existing fileManager
      const result = await window.fileManager.uploadFile(file, selectedFolder);
      
      if (result.success) {
        toast.success(`${file.name} uploaded successfully`);
        fetchFiles(); // Refresh the list
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      toast.error(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Supabase File Manager</h2>
        <p className="text-gray-600">
          Manage all school files stored in Supabase Cloud Storage
        </p>
      </div>

      {/* Folder Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {folders.map((folder) => {
          const Icon = folder.icon;
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedFolder === folder.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon />
              <span>{folder.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Upload Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            onChange={handleUploadFile}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Upload to {selectedFolder}</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">
            No files found
          </h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Upload some files to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id || file.name}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getFileIcon(file.name)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 truncate max-w-[200px]">
                      {file.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.metadata?.size || 0)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteFile(file.fullPath)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete file"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <p>Uploaded: {formatDate(file.created_at)}</p>
                <p>Folder: <span className="font-medium">{file.folder}</span></p>
              </div>

              <div className="flex gap-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium"
                >
                  <FaEye /> Preview
                </a>
                <a
                  href={file.url}
                  download={file.name}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded text-sm font-medium"
                >
                  <FaDownload /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-gray-700">Storage Summary</h4>
            <p className="text-sm text-gray-500">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} in "{selectedFolder}" folder
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total size: {formatFileSize(
              files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}