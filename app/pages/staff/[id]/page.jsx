'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  FiMail, FiAward, FiUsers, 
  FiArrowLeft, FiStar, FiClock, FiTarget, 
  FiBook, FiUser, FiGlobe,
  FiShare2, FiChevronRight
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';

const ModernLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-800">Loading Profile</h3>
      <p className="text-gray-500 mt-1 text-sm">Getting staff information...</p>
    </div>
  </div>
);

const generateStaffStructuredData = (staffMember) => {
  if (!staffMember) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': staffMember.name,
    'jobTitle': staffMember.position,
    'worksFor': {
      '@type': 'EducationalOrganization',
      'name': 'Katwanyaa High School',
      'url': process.env.NEXT_PUBLIC_SITE_URL
    },
    'department': staffMember.department,
    'description': staffMember.bio,
    'email': staffMember.email,
    'url': `${process.env.NEXT_PUBLIC_SITE_URL}/staff/${generateSlug(staffMember.name, staffMember.id)}`,
    'image': getImageSrc(staffMember),
    'knowsAbout': staffMember.expertise || [],
    'hasCredential': staffMember.achievements?.map(achievement => ({
      '@type': 'EducationalOccupationalCredential',
      'name': achievement
    })),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/staff/${generateSlug(staffMember.name, staffMember.id)}`
    }
  };
};

const generateSlug = (name, id) => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + `-${id}`;
};

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
    'Administration': 'from-blue-500 to-blue-600',
    'Sciences': 'from-green-500 to-green-600',
    'Mathematics': 'from-orange-500 to-orange-600',
    'Languages': 'from-purple-500 to-purple-600',
    'Humanities': 'from-amber-500 to-amber-600',
    'Guidance': 'from-pink-500 to-pink-600',
    'Sports': 'from-teal-500 to-teal-600',
  };
  return colors[department] || 'from-gray-500 to-gray-600';
};

const getExperienceYears = (bio) => {
  if (!bio) return null;
  const match = bio.match(/\d+(?=\s*years?)/i);
  return match ? parseInt(match[0]) : null;
};

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [staffMember, setStaffMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const extractIdFromSlug = (slug) => {
    if (!slug) return null;
    
    const matches = slug.match(/-(\d+)$/);
    if (matches && matches[1]) {
      return parseInt(matches[1]);
    }
    
    const numberMatch = slug.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }
    
    return null;
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        
        const staffId = extractIdFromSlug(params.id);
        
        if (!staffId) {
          setError('Invalid staff URL');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/staff');
        if (!response.ok) throw new Error('Failed to fetch staff data');
        
        const data = await response.json();
        if (data.success && data.staff) {
          const foundStaff = data.staff.find(member => member.id === staffId);
          
          if (foundStaff) {
            setStaffMember(foundStaff);
          } else {
            setError('Staff member not found');
          }
        } else {
          throw new Error('Invalid data format from API');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching staff details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStaffData();
    }
  }, [params.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const staffStats = useMemo(() => [
    { label: 'Experience', value: getExperienceYears(staffMember?.bio) || '5+', icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expertise Areas', value: staffMember?.expertise?.length || 0, icon: FiStar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Responsibilities', value: staffMember?.responsibilities?.length || 0, icon: FiTarget, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Achievements', value: staffMember?.achievements?.length || 0, icon: FiAward, color: 'text-purple-600', bg: 'bg-purple-50' }
  ], [staffMember]);

  if (loading) return <ModernLoader />;

  if (error || !staffMember) {
    return (
      <>
        <Head>
          <title>Staff Not Found | Katwanyaa High School</title>
          <meta name="description" content="The requested staff member profile was not found at Katwanyaa High School." />
          <meta name="robots" content="noindex, follow" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiUsers className="text-3xl text-gray-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-3">Staff Member Not Found</h1>
            <p className="text-gray-600 mb-6 text-base">{error || 'The staff member you are looking for does not exist.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => router.back()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-sm"
              >
                Go Back
              </button>
              <Link 
                href="/staff" 
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-center text-sm"
              >
                View All Staff
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const experienceYears = getExperienceYears(staffMember.bio);
  const structuredData = generateStaffStructuredData(staffMember);
  const pageTitle = `${staffMember.name} - ${staffMember.position} at Katwanyaa High School`;
  const pageDescription = `${staffMember.name} is a ${staffMember.position} in the ${staffMember.department} department at Katwanyaa High School. ${staffMember.bio?.substring(0, 155)}...`;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/staff/${generateSlug(staffMember.name, staffMember.id)}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={getImageSrc(staffMember)} />
        <meta property="og:site_name" content="Katwanyaa High School" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={getImageSrc(staffMember)} />
        <meta name="author" content={staffMember.name} />
        <meta name="keywords" content={`${staffMember.name}, ${staffMember.position}, ${staffMember.department}, Katwanyaa High School, teacher, educator, ${staffMember.expertise?.join(', ')}`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link 
                href="/pages/staff" 
                className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2 transition-all text-sm group"
              >
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <FiArrowLeft className="text-base" />
                </div>
                Back to Directory
              </Link>
              <button 
                onClick={copyToClipboard}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                <FiShare2 className="text-base" />
                {copied ? 'Copied!' : 'Share Profile'}
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="text-gray-400 mx-2" />
              <Link href="/pages/staff" className="hover:text-blue-600 transition-colors">Staff Directory</Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="text-gray-400 mx-2" />
              <span className="text-gray-900 font-medium">{staffMember.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 mx-auto lg:mx-0">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                      <Image
                        src={getImageSrc(staffMember)}
                        alt={`${staffMember.name}, ${staffMember.position}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 192px, 192px"
                      />
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${getDepartmentColor(staffMember.department)} text-white shadow-sm`}>
                        {staffMember.department}
                      </span>
                      {experienceYears && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                          <FiClock className="text-xs" />
                          {experienceYears}+ years experience
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                      {staffMember.name}
                    </h1>
                    
                    <p className="text-lg text-blue-600 mb-3 font-medium">
                      {staffMember.position}
                    </p>
                    
                    <p className="text-gray-600 mb-6 max-w-3xl leading-relaxed text-base">
                      {staffMember.role} at Katwanyaa High School - Dedicated educator committed to student success and academic excellence.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      {staffStats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                          <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center border border-gray-200/50 shadow-sm`}>
                            <div className="text-lg font-semibold text-gray-900 mb-1">{stat.value}</div>
                            <div className="text-gray-600 text-xs flex items-center justify-center gap-1.5">
                              <IconComponent className={stat.color} />
                              {stat.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Button - Only Email */}
                    <div className="flex flex-wrap gap-3">
                      {staffMember.email && (
                        <a 
                          href={`mailto:${staffMember.email}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl text-sm"
                          aria-label={`Send email to ${staffMember.name}`}
                        >
                          <FiMail className="text-base" />
                          Send Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Professional Profile */}
                <section className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="text-blue-600 text-lg" />
                    Professional Profile
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    {staffMember.bio}
                  </p>

                  {/* Key Responsibilities */}
                  {staffMember.responsibilities && staffMember.responsibilities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiTarget className="text-green-600 text-base" />
                        Key Responsibilities
                      </h3>
                      <div className="grid md:grid-cols-1 gap-3">
                        {staffMember.responsibilities.map((resp, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas of Expertise */}
                  {staffMember.expertise && staffMember.expertise.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiStar className="text-amber-600 text-base" />
                        Areas of Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {staffMember.expertise.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Journey */}
                  {staffMember.achievements && staffMember.achievements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiAward className="text-purple-600 text-base" />
                        Achievements
                      </h3>
                      <div className="space-y-3">
                        {staffMember.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200/50">
                            <FiAward className="text-purple-600 text-base mt-0.5 flex-shrink-0" />
                            <p className="text-purple-800 text-sm">{achievement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Information */}
                <section className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiGlobe className="text-gray-600 text-base" />
                    Quick Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                      <span className="text-gray-600 text-sm">Department</span>
                      <span className="text-gray-900 text-sm font-medium">{staffMember.department}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                      <span className="text-gray-600 text-sm">Position</span>
                      <span className="text-gray-900 text-sm font-medium">{staffMember.position}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                      <span className="text-gray-600 text-sm">Role</span>
                      <span className="text-gray-900 text-sm font-medium">{staffMember.role}</span>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMail className="text-gray-600 text-base" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {staffMember.email && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200/50">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <FiMail className="text-white text-base" />
                        </div>
                        <div className="flex-1">
                          <a 
                            href={`mailto:${staffMember.email}`}
                            className="text-green-800 hover:text-green-600 block text-sm font-medium"
                          >
                            {staffMember.email}
                          </a>
                          <span className="text-green-600 text-xs">Email Address</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Explore More */}
                <section className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiBook className="text-gray-600 text-base" />
                    Explore More
                  </h3>
                  <div className="space-y-2">
                    <Link 
                      href="/pages/staff" 
                      className="block p-3 bg-gray-50 rounded-lg border border-gray-200/50 hover:bg-gray-100 transition-all text-sm text-gray-700"
                    >
                      View All Staff Members
                    </Link>
                    <Link 
                      href="/pages/academics" 
                      className="block p-3 bg-gray-50 rounded-lg border border-gray-200/50 hover:bg-gray-100 transition-all text-sm text-gray-700"
                    >
                      Academic Programs
                    </Link>
                    <Link 
                      href="/pages/admissions" 
                      className="block p-3 bg-gray-50 rounded-lg border border-gray-200/50 hover:bg-gray-100 transition-all text-sm text-gray-700"
                    >
                      Admissions Information
                    </Link>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}