'use client';

import FileManager from '../front/page';
import BulkUploader from '../bulk/page';
import { useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('manager');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Supabase Cloud File Management
          </h1>
          <p className="text-gray-600">
            Directly manage all school files stored in Supabase Storage
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'manager'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            File Manager
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Upload
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Storage Stats
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'manager' && <FileManager />}
          
          {activeTab === 'bulk' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BulkUploader folder="documents" />
              <BulkUploader folder="videos" />
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Storage Statistics
              </h3>
              {/* Add storage statistics component here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}