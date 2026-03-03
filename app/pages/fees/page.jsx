'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  FiDownload,
  FiFileText,
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowRight,
  FiShare2,
  FiSearch,
  FiX,
  FiFilter,
  FiRotateCw,
  FiBookmark,
  FiChevronRight,
  FiChevronLeft,
  FiGrid,
  FiList,
  FiExternalLink,
  FiInfo,
  FiDollarSign,
  FiCreditCard,
  FiHome,
  FiBookOpen,
  FiTruck,
  FiHeart,
  FiCheckmarkCircleOutline,
  FiShield,
  FiWifi,
  FiCoffee,
  FiAward
} from 'react-icons/fi';
import { 
  IoNewspaperOutline,
  IoCalendarClearOutline,
  IoSparkles,
  IoRibbonOutline,
  IoPeopleCircle,
  IoStatsChart,
  IoShareSocialOutline,
  IoClose,
  IoLocationOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoShareOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoPrintOutline,
  IoCopyOutline,
  IoCheckmarkCircleOutline,
  IoWalletOutline,
  IoCardOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoPricetagOutline,
  IoSchoolOutline,
  IoBusinessOutline,
  IoRestaurantOutline,
  IoBedOutline,
  IoMedkitOutline,
  IoLibraryOutline
} from 'react-icons/io5';
import { MdOutlineSchool, MdOutlineBoardingSchool, MdOutlineAdUnits } from 'react-icons/md';
import { FaWhatsapp, FaTelegram, FaEnvelope, FaRegCopy } from 'react-icons/fa';
import { CircularProgress, Stack } from '@mui/material';

// Modern Modal Component
const ModernModal = ({ children, open, onClose, maxWidth = '800px' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div 
        className="relative bg-white/95 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/40"
        style={{ 
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh'
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white cursor-pointer border border-gray-200 shadow-sm"
          >
            <FiX className="text-gray-600 w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Fee Breakdown Card Component
const FeeBreakdownCard = ({ item, onInfo }) => {
  const getCategoryIcon = (name) => {
    const icons = {
      'Tuition': <FiBookOpen className="text-blue-600" />,
      'Boarding': <IoBedOutline className="text-purple-600" />,
      'Uniform': <FiTruck className="text-emerald-600" />,
      'Books': <FiFileText className="text-amber-600" />,
      'Medical': <IoMedkitOutline className="text-rose-600" />,
      'Activity': <FiHeart className="text-pink-600" />,
      'Application': <FiCreditCard className="text-indigo-600" />,
      'Registration': <FiUser className="text-cyan-600" />,
      'Acceptance': <FiCheckmarkCircleOutline className="text-green-600" />,
      'Development': <FiHome className="text-orange-600" />,
      'Deposit': <FiDollarSign className="text-teal-600" />
    };
    return icons[name] || <FiDollarSign className="text-slate-600" />;
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            {getCategoryIcon(item.name)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{item.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{item.description || 'Standard fee'}</p>
          </div>
        </div>
        <button
          onClick={() => onInfo(item)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
        >
          <FiInfo size={14} />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
          <span className="text-xl font-black text-slate-900">
            KSh {item.amount?.toLocaleString()}
          </span>
        </div>
        {item.optional && (
          <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-200">
            Optional
          </span>
        )}
      </div>
    </div>
  );
};

// PDF Card Component
const PDFCard = ({ title, pdfUrl, fileName, fileSize, uploadDate, description, onDownload, onView }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <IoDocumentTextOutline className="text-blue-600 text-2xl" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{title}</h4>
          {description && (
            <p className="text-sm text-slate-500 mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <FiFileText className="text-blue-400" size={12} />
              {fileName || 'Document'}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="text-emerald-400" size={12} />
              {formatFileSize(fileSize)}
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar className="text-purple-400" size={12} />
              {formatDate(uploadDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(pdfUrl)}
              className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <IoEyeOutline size={14} />
              View PDF
            </button>
            <button
              onClick={() => onDownload(pdfUrl, fileName)}
              className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
            >
              <FiDownload size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fee Summary Card
const FeeSummaryCard = ({ title, total, items, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${classes.bg} ${classes.text} border ${classes.border}`}>
          <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 mb-4">
        KSh {total?.toLocaleString()}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Items</span>
          <span className="font-bold text-slate-900">{items || 0}</span>
        </div>
      </div>
      
      <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all">
        View Breakdown
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

// Main Component
export default function ModernFeesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [selectedFeeItem, setSelectedFeeItem] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('day');
  const [searchTerm, setSearchTerm] = useState('');

  // Tabs configuration
  const tabs = [
    { id: 'day', name: 'Day Fees', icon: IoBusinessOutline, color: 'blue' },
    { id: 'boarding', name: 'Boarding Fees', icon: IoBedOutline, color: 'purple' },
    { id: 'admission', name: 'Admission Fees', icon: MdOutlineAdUnits, color: 'amber' }
  ];

  // Fetch document data
  const fetchDocuments = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const response = await fetch('/api/schooldocuments');
      const data = await response.json();
      
      if (data.success) {
        setDocumentData(data.document);
        if (showRefresh) toast.success('Fees data refreshed!');
      } else {
        throw new Error(data.error || 'Failed to load fees data');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load fees information');
    } finally {
      if (showRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Get current fee items based on active tab
  const getCurrentFeeItems = () => {
    if (!documentData) return [];
    
    switch(activeTab) {
      case 'day':
        return documentData.feesDayDistributionJson || [];
      case 'boarding':
        return documentData.feesBoardingDistributionJson || [];
      case 'admission':
        return documentData.admissionFeeDistribution || [];
      default:
        return [];
    }
  };

  // Get total amount for current tab
  const getCurrentTotal = () => {
    const items = getCurrentFeeItems();
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  // Get PDF info for current tab
  const getCurrentPDFInfo = () => {
    if (!documentData) return null;
    
    switch(activeTab) {
      case 'day':
        return {
          url: documentData.feesDayDistributionPdf,
          name: documentData.feesDayPdfName,
          size: documentData.feesDayPdfSize,
          date: documentData.feesDayPdfUploadDate,
          description: documentData.feesDayDescription
        };
      case 'boarding':
        return {
          url: documentData.feesBoardingDistributionPdf,
          name: documentData.feesBoardingPdfName,
          size: documentData.feesBoardingPdfSize,
          date: documentData.feesBoardingPdfUploadDate,
          description: documentData.feesBoardingDescription
        };
      case 'admission':
        return {
          url: documentData.admissionFeePdf,
          name: documentData.admissionFeePdfName,
          size: documentData.admissionFeePdfSize,
          date: documentData.admissionFeePdfUploadDate,
          description: documentData.admissionFeeDescription
        };
      default:
        return null;
    }
  };

  // Filter fee items based on search
  const filteredItems = getCurrentFeeItems().filter(item => {
    return searchTerm === '' || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle PDF download
  const handleDownloadPDF = (url, fileName) => {
    if (!url) {
      toast.error('PDF not available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'fee-structure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  // Handle PDF view
  const handleViewPDF = (url) => {
    if (!url) {
      toast.error('PDF not available');
      return;
    }
    window.open(url, '_blank');
  };

  // Handle refresh
  const refreshData = () => {
    fetchDocuments(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="min-h-[70vh] flex items-center justify-center">
            <Stack spacing={2} alignItems="center">
              <div className="relative flex items-center justify-center scale-90 sm:scale-110">
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={48}
                  thickness={4.5}
                  sx={{ color: '#f1f5f9' }}
                />
                <CircularProgress
                  variant="indeterminate"
                  disableShrink
                  size={48}
                  thickness={4.5}
                  sx={{
                    color: '#0f172a',
                    animationDuration: '1000ms',
                    position: 'absolute',
                  }}
                />
                <div className="absolute">
                  <IoSparkles className="text-blue-600 text-sm animate-pulse" />
                </div>
              </div>
              <div className="text-center px-4">
                <p className="text-slate-900 font-medium text-sm sm:text-base tracking-tight">
                  Loading fee structure...
                </p>
                <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest mt-1 font-bold">
                  Katwanyaa High School
                </p>
              </div>
            </Stack>
          </div>
        </div>
      </div>
    );
  }

  const pdfInfo = getCurrentPDFInfo();
  const currentItems = getCurrentFeeItems();
  const totalAmount = getCurrentTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Toaster position="top-right" richColors />

      {/* Hero Section */}
      <div className="relative bg-slate-950 p-6 sm:p-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
              <IoWalletOutline className="text-blue-400 text-[10px] sm:text-sm animate-pulse" />
              <span className="text-blue-100 font-black text-[8px] sm:text-xs uppercase tracking-[0.2em]">
                Fee Structure
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1]">
                  School <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400">Fees</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-lg mt-2 font-medium max-w-2xl">
                  Transparent fee structure for all programs at Katwanyaa High School.
                </p>
              </div>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-blue-50 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {refreshing ? (
                  <div className="w-3 h-3 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <FiRotateCw className="text-sm" />
                )}
                <span>{refreshing ? "Updating..." : "REFRESH"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <IoBusinessOutline size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">Day</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Day Scholars</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">
              KSh {documentData?.feesDayDistributionJson?.reduce((sum, item) => sum + item.amount, 0)?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-slate-500">{documentData?.feesDayDistributionJson?.length || 0} fee items</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <IoBedOutline size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">Boarding</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Boarders</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">
              KSh {documentData?.feesBoardingDistributionJson?.reduce((sum, item) => sum + item.amount, 0)?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-slate-500">{documentData?.feesBoardingDistributionJson?.length || 0} fee items</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <MdOutlineAdUnits size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">Admission</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">New Students</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">
              KSh {documentData?.admissionFeeDistribution?.reduce((sum, item) => sum + item.amount, 0)?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-slate-500">{documentData?.admissionFeeDistribution?.length || 0} fee items</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  isActive
                    ? `bg-${tab.color}-600 border-${tab.color}-600 text-white shadow-md`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className={isActive ? 'text-white' : `text-${tab.color}-500`} size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-2 sm:p-3 rounded-2xl sm:rounded-[28px] shadow-lg">
          <div className="relative flex items-center">
            <div className="pl-3 sm:pl-4 pr-2">
              <FiSearch className="text-slate-400" size={18} />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab} fee items...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 bg-transparent text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mr-2 p-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Breakdown - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {tabs.find(t => t.id === activeTab)?.name} Breakdown
              </h2>
              <p className="text-sm text-slate-500">
                {filteredItems.length} items
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 py-12 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <FiDollarSign className="text-slate-300 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No fee items found</h3>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <FeeBreakdownCard
                    key={item.id || index}
                    item={item}
                    onInfo={(item) => {
                      setSelectedFeeItem(item);
                      setShowInfoModal(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Total Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                  <IoWalletOutline size={24} className="text-white" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-sm text-slate-300 mb-1">Total {tabs.find(t => t.id === activeTab)?.name}</p>
              <p className="text-4xl font-black mb-4">KSh {totalAmount.toLocaleString()}</p>
              <p className="text-xs text-slate-400">* Inclusive of all applicable fees</p>
            </div>
          </div>

          {/* PDF Documents - Right Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Documents</h2>
            
            {pdfInfo?.url ? (
              <PDFCard
                title={`${tabs.find(t => t.id === activeTab)?.name} Structure`}
                pdfUrl={pdfInfo.url}
                fileName={pdfInfo.name}
                fileSize={pdfInfo.size}
                uploadDate={pdfInfo.date}
                description={pdfInfo.description}
                onDownload={handleDownloadPDF}
                onView={handleViewPDF}
              />
            ) : (
              <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoDocumentTextOutline className="text-slate-300 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No PDF Available</h3>
                <p className="text-slate-500 text-sm mt-1">Check back later for updates.</p>
              </div>
            )}

            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <IoCardOutline className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-400">Bank Transfer</p>
                    <p className="text-sm font-bold text-slate-900">Account: 1234567890</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <IoCashOutline className="text-emerald-600" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-400">MPesa Paybill</p>
                    <p className="text-sm font-bold text-slate-900">Business No: 522522</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <IoReceiptOutline className="text-purple-600" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-400">Account Name</p>
                    <p className="text-sm font-bold text-slate-900">Katwanyaa High School</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl mt-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full -ml-24 -mb-24" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <IoReceiptOutline className="text-slate-900 text-2xl" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                Need Payment Assistance?
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Contact our finance office for payment plans and financial aid information.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95">
              Contact Finance
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <ModernModal open={showInfoModal} onClose={() => setShowInfoModal(false)} maxWidth="400px">
        {selectedFeeItem && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FiInfo className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selectedFeeItem.name}</h3>
              <p className="text-sm text-slate-500 mt-1">Fee Item Details</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 mb-1">Description</p>
                <p className="text-slate-900">{selectedFeeItem.description || 'No description available'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 mb-1">Amount</p>
                  <p className="text-xl font-black text-slate-900">KSh {selectedFeeItem.amount?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedFeeItem.optional ? 'Optional' : 'Mandatory'}
                  </p>
                </div>
              </div>

              {selectedFeeItem.admissionOnly && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-800">One-time admission fee</p>
                </div>
              )}

              {selectedFeeItem.boardingOnly && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-xs font-bold text-purple-800">Boarding students only</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </ModernModal>
    </div>
  );
}