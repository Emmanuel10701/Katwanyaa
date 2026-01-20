// app/sitemap.js - Updated for AIC Katwanyaa High School
export default function sitemap() {
  // Update this to your actual domain when ready
  const baseUrl = 'https://katwanyaa.vercel.app';
  const currentDate = new Date();
  
  // Using the Katwanyaa logo image
  const schoolLogo = `${baseUrl}/katz.png`;

  // Define categories for better organization
  const pages = [
    // Primary Pages (High Priority)
    {
      path: '',
      priority: 1.0,
      changeFrequency: 'yearly',
      title: 'Home - AIC Katwanyaa High School',
      description: 'A leading secondary school committed to academic excellence and spiritual growth.',
      image: schoolLogo
    },
    {
      path: 'pages/AboutUs',
      priority: 0.9,
      changeFrequency: 'monthly',
      title: 'About Us - AIC Katwanyaa High School',
      description: 'Learn about our history, mission, vision, and core values of Education is Light.',
      image: schoolLogo
    },
    {
      path: 'pages/admissions',
      priority: 0.9,
      changeFrequency: 'weekly',
      title: 'Admissions - AIC Katwanyaa High School',
      description: 'Admissions process, requirements, and important dates for joining our community.',
      image: schoolLogo
    },
    {
      path: 'pages/apply-for-admissions',
      priority: 0.9,
      changeFrequency: 'weekly',
      title: 'Apply for Admissions - AIC Katwanyaa High School',
      description: 'Online application form for new students at AIC Katwanyaa High.',
      image: schoolLogo
    },
    
    // Academic Pages (Medium-High Priority)
    {
      path: 'pages/academics',
      priority: 0.8,
      changeFrequency: 'monthly',
      title: 'Academics - AIC Katwanyaa High School',
      description: 'Academic programs, curriculum, and learning resources.',
      image: schoolLogo
    },
    {
      path: 'pages/Guidance-and-Coucelling',
      priority: 0.7,
      changeFrequency: 'monthly',
      title: 'Guidance and Counselling - AIC Katwanyaa High School',
      description: 'Student support services and career guidance.',
      image: schoolLogo
    },
    {
      path: 'pages/carreer',
      priority: 0.6,
      changeFrequency: 'monthly',
      title: 'Career Opportunities - AIC Katwanyaa High School',
      description: 'Job vacancies and career information at our institution.',
      image: schoolLogo
    },
    
    // Community Pages (Medium Priority)
    {
      path: 'pages/eventsandnews',
      priority: 0.7,
      changeFrequency: 'daily',
      title: 'Events & News - AIC Katwanyaa High School',
      description: 'Latest school events, news, and announcements from AIC Katwanyaa.',
      image: schoolLogo
    },
    {
      path: 'pages/staff',
      priority: 0.7,
      changeFrequency: 'monthly',
      title: 'Staff & Faculty - AIC Katwanyaa High School',
      description: 'Meet our dedicated teaching and administrative staff.',
      image: schoolLogo
    },
    {
      path: 'pages/gallery',
      priority: 0.6,
      changeFrequency: 'weekly',
      title: 'Photo Gallery - AIC Katwanyaa High School',
      description: 'Photos of school activities, events, and facilities.',
      image: schoolLogo
    },
    
    // Support Pages (Medium-Low Priority)
    {
      path: 'pages/contact',
      priority: 0.5,
      changeFrequency: 'yearly',
      title: 'Contact Us - AIC Katwanyaa High School',
      description: 'Contact information and school location details.',
      image: schoolLogo
    },
    {
      path: 'pages/TermsandPrivacy',
      priority: 0.3,
      changeFrequency: 'yearly',
      title: 'Terms & Privacy - AIC Katwanyaa High School',
      description: 'Terms of use and privacy policy for our portal.',
      image: schoolLogo
    },
    
    // Portal Pages (Low Priority - Authentication Required)
    {
      path: 'pages/StudentPortal',
      priority: 0.4,
      changeFrequency: 'monthly',
      title: 'Student Portal - AIC Katwanyaa High School',
      description: 'Student login and resources portal for AIC Katwanyaa students.',
      image: schoolLogo
    },
    {
      path: 'pages/adminLogin',
      priority: 0.3,
      changeFrequency: 'monthly',
      title: 'Admin Login - AIC Katwanyaa High School',
      description: 'Administrator login portal.',
      image: schoolLogo
    },
    {
      path: 'MainDashboard',
      priority: 0.3,
      changeFrequency: 'monthly',
      title: 'Dashboard - AIC Katwanyaa High School',
      description: 'Main dashboard for authenticated users.',
      image: schoolLogo
    },
  ];

  // Generate sitemap entries with image
  return pages.map(page => ({
    url: `${baseUrl}/${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    images: [page.image]
  }));
}