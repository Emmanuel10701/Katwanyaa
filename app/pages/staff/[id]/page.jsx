'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  FiMail, FiPhone, FiShare2, FiX, FiAward, FiUsers, 
  FiArrowLeft, FiLink, FiStar, FiClock, FiTarget, FiMapPin,
  FiBook, FiUser, FiBriefcase, FiHeart
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const ModernLoader = () => (
  <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="text-xl font-semibold text-gray-800">Loading Profile</h3>
    </div>
  </div>
);

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [staffMember, setStaffMember] = useState(null);
  const [relatedStaff, setRelatedStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/staff');
        if (!response.ok) throw new Error('Failed to fetch staff data');
        
        const data = await response.json();
        if (data.success && data.staff) {
          const foundStaff = data.staff.find(member => 
            member.id.toString() === params.id || 
            generateSlug(member.name) === params.id
          );
          
          if (foundStaff) {
            setStaffMember(foundStaff);
            const related = data.staff
              .filter(member => member.department === foundStaff.department && member.id !== foundStaff.id)
              .slice(0, 3);
            setRelatedStaff(related);
          } else {
            setError('Staff member not found');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [params.id]);

  // Generate URL slug from name
  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: '🔵', color: 'hover:bg-blue-50 border-blue-200' },
    { name: 'Twitter', icon: '🐦', color: 'hover:bg-sky-50 border-sky-200' },
    { name: 'LinkedIn', icon: '💼', color: 'hover:bg-blue-50 border-blue-200' },
    { name: 'WhatsApp', icon: '💚', color: 'hover:bg-green-50 border-green-200' },
    { name: 'Email', icon: '📧', color: 'hover:bg-red-50 border-red-200' }
  ];

  const getImageSrc = (staff) => {
    if (staff?.image) {
      if (staff.image.startsWith('/')) {
        return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${staff.image}`;
      }
      if (staff.image.startsWith('http')) return staff.image;
    }
    return '/images/default-staff.jpg';
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Administration': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sciences': 'bg-green-100 text-green-800 border-green-200',
      'Mathematics': 'bg-orange-100 text-orange-800 border-orange-200',
      'Languages': 'bg-purple-100 text-purple-800 border-purple-200',
      'Humanities': 'bg-amber-100 text-amber-800 border-amber-200',
      'Guidance': 'bg-pink-100 text-pink-800 border-pink-200',
      'Sports': 'bg-teal-100 text-teal-800 border-teal-200',
    };
    return colors[department] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getExperienceYears = (bio) => {
    if (!bio) return null;
    const match = bio.match(/\d+(?=\s*years?)/i);
    return match ? parseInt(match[0]) : null;
  };

  const handleShare = (platform) => {
    const shareUrl = platform.name === 'Email' 
      ? `mailto:?subject=Meet ${staffMember.name}&body=Check out ${staffMember.name} at Katwanyaa High School: ${window.location.href}`
      : `https://${platform.name.toLowerCase()}.com/share?url=${encodeURIComponent(window.location.href)}`;
    
    platform.name === 'Email' ? window.location.href = shareUrl : window.open(shareUrl, '_blank');
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const staffStats = useMemo(() => [
    { label: 'Experience', value: getExperienceYears(staffMember?.bio) || '5+', icon: FiClock, color: 'text-blue-600' },
    { label: 'Expertise Areas', value: staffMember?.expertise?.length || 0, icon: FiStar, color: 'text-amber-600' },
    { label: 'Responsibilities', value: staffMember?.responsibilities?.length || 0, icon: FiTarget, color: 'text-green-600' },
    { label: 'Achievements', value: staffMember?.achievements?.length || 0, icon: FiAward, color: 'text-purple-600' }
  ], [staffMember]);

  const sections = [
    { id: 'about', label: 'About', icon: FiUser },
    { id: 'expertise', label: 'Expertise', icon: FiStar },
    { id: 'experience', label: 'Experience', icon: FiBriefcase },
    { id: 'contact', label: 'Contact', icon: FiMail }
  ];

  if (loading) return <ModernLoader />;

  if (error || !staffMember) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="text-3xl text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Staff Member Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The staff member you are looking for does not exist.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => router.back()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
            <Link 
              href="/staff" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              View All Staff
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const experienceYears = getExperienceYears(staffMember.bio);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/staff" 
              className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2 transition-colors text-sm"
            >
              <FiArrowLeft className="text-base" />
              Back to Staff
            </Link>
            <button 
              onClick={() => setShowShareModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
            >
              <FiShare2 className="text-base" />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start gap-8 max-w-6xl mx-auto">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={getImageSrc(staffMember)}
                  alt={staffMember.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDepartmentColor(staffMember.department)}`}>
                  {staffMember.department}
                </span>
                {experienceYears && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200 flex items-center gap-1">
                    <FiClock className="text-xs" />
                    {experienceYears}+ years
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {staffMember.name}
              </h1>
              
              <p className="text-xl text-gray-600 mb-3 font-medium">
                {staffMember.position}
              </p>
              
              <p className="text-gray-500 mb-6 max-w-2xl leading-relaxed">
                {staffMember.role} at Katwanyaa High School
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {staffStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-gray-500 text-sm flex items-center justify-center gap-1">
                        <IconComponent className={stat.color} />
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {staffMember.email && (
                  <a 
                    href={`mailto:${staffMember.email}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    <FiMail className="text-base" />
                    Send Email
                  </a>
                )}
                {staffMember.phone && (
                  <a 
                    href={`tel:${staffMember.phone}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    <FiPhone className="text-base" />
                    Call Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-4">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 min-w-max border ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <IconComponent className={`text-base ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {activeSection === 'about' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Profile</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {staffMember.bio}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTarget className="text-blue-600" />
                    Key Responsibilities
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {staffMember.responsibilities.map((resp, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expertise Section */}
            {activeSection === 'expertise' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Areas of Expertise</h2>
                  <div className="flex flex-wrap gap-3">
                    {staffMember.expertise.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Focus</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Specializing in {staffMember.expertise.slice(0, 3).join(', ')} with a focus on 
                    delivering exceptional educational outcomes and student development.
                  </p>
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Journey</h2>
                  <div className="space-y-4">
                    {staffMember.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <FiAward className="text-amber-600 text-xl mt-1 flex-shrink-0" />
                        <p className="text-amber-800">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
                  <div className="space-y-4">
                    {staffMember.email && (
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiMail className="text-green-600 text-xl" />
                        </div>
                        <div className="flex-1">
                          <a 
                            href={`mailto:${staffMember.email}`}
                            className="text-green-800 hover:text-green-600 font-semibold block text-lg"
                          >
                            {staffMember.email}
                          </a>
                          <span className="text-green-600 text-sm">Email Address</span>
                        </div>
                      </div>
                    )}
                    {staffMember.phone && (
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiPhone className="text-blue-600 text-xl" />
                        </div>
                        <div className="flex-1">
                          <a 
                            href={`tel:${staffMember.phone}`}
                            className="text-blue-800 hover:text-blue-600 font-semibold block text-lg"
                          >
                            {staffMember.phone}
                          </a>
                          <span className="text-blue-600 text-sm">Phone Number</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Department</span>
                  <span className="text-gray-900 font-semibold">{staffMember.department}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Position</span>
                  <span className="text-gray-900 font-semibold">{staffMember.position}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Role</span>
                  <span className="text-gray-900 font-semibold">{staffMember.role}</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {relatedStaff.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUsers className="text-gray-600" />
                  Team Members
                </h3>
                <div className="space-y-3">
                  {relatedStaff.map((related) => (
                    <Link 
                      key={related.id} 
                      href={`/staff/${generateSlug(related.name)}-${related.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                          src={getImageSrc(related)} 
                          alt={related.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {related.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{related.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Share Profile</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {socialPlatforms.map((platform, index) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform)}
                    className={`p-4 rounded-lg bg-white border ${platform.color} transition-all flex flex-col items-center justify-center gap-2 hover:scale-105`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-xs font-semibold text-gray-800">{platform.name}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={copyToClipboard}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 border border-gray-300"
              >
                <FiLink />
                Copy Profile Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}