'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiInfo, 
  FiBook, 
  FiUserPlus,
  FiCalendar,
  FiImage,
  FiMail,
  FiLogIn,
  FiUsers,
  FiFileText,
  FiChevronDown,
  FiExternalLink
} from 'react-icons/fi';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logo from '../../../images/logo.png';

export default function ModernNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAcademicDropdownOpen, setIsAcademicDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAcademicDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if we need to show dropdown (at 80% zoom or below)
  const shouldShowDropdown = windowWidth > 0 && windowWidth < 1600;

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: FiHome,
      exact: true
    },
    { 
      name: 'About', 
      href: '/pages/AboutUs',
      icon: FiInfo
    },
    { 
      name: 'Academics', 
      href: '/pages/academics',
      icon: FiBook,
      hasDropdown: shouldShowDropdown
    },
    { 
      name: 'Admissions', 
      href: '/pages/admissions',
      icon: FiUserPlus
    },
    ...(shouldShowDropdown ? [] : [
      { 
        name: 'Assignments', 
        href: '/pages/assignments',
        icon: FiFileText 
      }
    ]),
    { 
      name: 'Staff', 
      href: '/pages/staff',
      icon: FiUsers 
    },
    { 
      name: 'Gallery', 
      href: '/pages/gallery', 
      icon: FiImage 
    },
    ...(shouldShowDropdown ? [] : [
      { 
        name: 'Events', 
        href: '/pages/eventsandnews', 
        icon: FiCalendar 
      }
    ]),
    { 
      name: 'Contact', 
      href: '/pages/contact', 
      icon: FiMail 
    }
  ];

  // Function to check if a link is active
  const isActiveLink = (href, exact = false) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (exact) {
      return pathname === href;
    }
    return pathname && pathname.startsWith(href);
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-gradient-to-r from-blue-600/95 via-indigo-600/95 to-purple-700/95 backdrop-blur-xl shadow-2xl border-b border-white/20' 
            : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 backdrop-blur-lg shadow-lg'
        }`}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-transparent to-pink-400/30 animate-gradient-shift"></div>
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 w-full relative">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
              onClick={() => window.location.href = '/'}
            >
              <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30 group-hover:from-white/30 group-hover:to-white/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <Image
                  src={logo}
                  alt="Nyaribu Secondary School Logo"
                  width={36}
                  height={36}
                  className="relative z-10 filter drop-shadow-lg"
                  priority
                />
              </div>
              <div className="opacity-100">
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent whitespace-nowrap drop-shadow-lg"
                >
                  Nyaribu Secondary
                </motion.h1>
                <p className="text-sm text-white/80 hidden lg:block whitespace-nowrap font-medium tracking-wide">
                  Soaring for Excellence
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center mx-8">
              {navigation.map((item, index) => {
                const isActive = isActiveLink(item.href, item.exact);
                
                if (item.hasDropdown) {
                  return (
                    <div 
                      key={item.name} 
                      className="relative" 
                      ref={dropdownRef}
                      onMouseEnter={() => setIsAcademicDropdownOpen(true)}
                      onMouseLeave={() => setIsAcademicDropdownOpen(false)}
                    >
                      <motion.button
                        variants={navItemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 font-semibold transition-all text-[15px] whitespace-nowrap px-5 py-3 rounded-xl backdrop-blur-sm border border-transparent ${
                          isActive || isAcademicDropdownOpen
                            ? 'text-white bg-white/25 shadow-lg shadow-white/10 border-white/20' 
                            : 'text-white/90 hover:text-white hover:bg-white/15 hover:border-white/10'
                        }`}
                      >
                        <item.icon className="text-[16px] flex-shrink-0" />
                        <span>{item.name}</span>
                        <FiChevronDown className={`text-[14px] transition-transform duration-200 ${
                          isAcademicDropdownOpen ? 'rotate-180' : ''
                        }`} />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isAcademicDropdownOpen && (
                          <motion.div
                            variants={dropdownVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-gradient-to-b from-white/98 to-gray-50/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 py-2 z-50 overflow-hidden"
                          >
                            {/* Dropdown header */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Academics</h3>
                            </div>
                            
                            <a
                              href={item.href}
                              className={`flex items-center justify-between gap-2 px-4 py-3 text-[14px] font-medium transition-all group ${
                                isActiveLink(item.href)
                                  ? 'text-blue-600 bg-blue-50/90'
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                              }`}
                              onClick={() => setIsAcademicDropdownOpen(false)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <FiBook className="text-[12px] text-blue-600" />
                                </div>
                                <span>Academics Overview</span>
                              </div>
                            </a>
                            <a
                              href="/pages/assignments"
                              className={`flex items-center justify-between gap-2 px-4 py-3 text-[14px] font-medium transition-all group ${
                                isActiveLink('/pages/assignments')
                                  ? 'text-blue-600 bg-blue-50/90'
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                              }`}
                              onClick={() => setIsAcademicDropdownOpen(false)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <FiFileText className="text-[12px] text-blue-600" />
                                </div>
                                <span>Assignments</span>
                              </div>
                              {isActiveLink('/pages/assignments') && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </a>
                            <a
                              href="/pages/eventsandnews"
                              className={`flex items-center justify-between gap-2 px-4 py-3 text-[14px] font-medium transition-all group ${
                                isActiveLink('/pages/eventsandnews')
                                  ? 'text-blue-600 bg-blue-50/90'
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                              }`}
                              onClick={() => setIsAcademicDropdownOpen(false)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <FiCalendar className="text-[12px] text-blue-600" />
                                </div>
                                <span>Events & News</span>
                              </div>
                              <FiExternalLink className="text-gray-400 group-hover:text-blue-500 text-xs" />
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <motion.a
                    key={item.name}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    href={item.href}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 font-semibold transition-all text-[15px] whitespace-nowrap px-5 py-3 rounded-xl backdrop-blur-sm border border-transparent ${
                      isActive 
                        ? 'text-white bg-white/25 shadow-lg shadow-white/10 border-white/20' 
                        : 'text-white/90 hover:text-white hover:bg-white/15 hover:border-white/10'
                    }`}
                  >
                    <item.icon className="text-[16px] flex-shrink-0" />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full"></div>
                    )}
                  </motion.a>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <motion.a
                href="/pages/adminLogin"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-[15px] backdrop-blur-sm border ${
                  isActiveLink('/pages/adminLogin')
                    ? 'text-blue-600 bg-white shadow-lg shadow-white/20 border-white'
                    : 'text-white bg-gradient-to-r from-white/20 to-white/10 hover:from-white hover:to-white hover:text-blue-600 border-white/30 hover:border-white'
                }`}
              >
                <FiLogIn className="text-[16px] flex-shrink-0" />
                <span>Admin Login</span>
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 rounded-xl text-white bg-white/20 backdrop-blur-sm transition-all border border-white/30 hover:bg-white/30"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? "close" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden bg-gradient-to-b from-blue-600/98 to-purple-700/98 backdrop-blur-xl border-t border-white/20 overflow-hidden"
            >
              {/* Mobile pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '30px 30px'
                }}></div>
              </div>
              
              <div className="container mx-auto px-6 py-8 relative">
                {/* Mobile Navigation - Always show all items */}
                <div className="space-y-3">
                  {[
                    { name: 'Home', href: '/', icon: FiHome },
                    { name: 'About', href: '/pages/AboutUs', icon: FiInfo },
                    { name: 'Academics', href: '/pages/academics', icon: FiBook },
                    { name: 'Assignments', href: '/pages/assignments', icon: FiFileText },
                    { name: 'Admissions', href: '/pages/admissions', icon: FiUserPlus },
                    { name: 'Staff', href: '/pages/staff', icon: FiUsers },
                    { name: 'Gallery', href: '/pages/gallery', icon: FiImage },
                    { name: 'Events', href: '/pages/eventsandnews', icon: FiCalendar },
                    { name: 'Contact', href: '/pages/contact', icon: FiMail }
                  ].map((item, index) => {
                    const isActive = isActiveLink(item.href);
                    return (
                      <motion.a
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        href={item.href}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-semibold text-base whitespace-nowrap backdrop-blur-sm border ${
                          isActive
                            ? 'bg-white/25 text-white shadow-inner border-white/30'
                            : 'text-white/90 hover:text-white hover:bg-white/15 border-transparent'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/30' : 'bg-white/20'
                        }`}>
                          <item.icon className="text-lg flex-shrink-0" />
                        </div>
                        <span>{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </motion.a>
                    );
                  })}
                </div>

                {/* Mobile Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 pt-8 border-t border-white/30"
                >
                  <a
                    href="/pages/adminLogin"
                    className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-semibold text-base backdrop-blur-sm border ${
                      isActiveLink('/pages/adminLogin')
                        ? 'bg-white text-blue-600 border-white shadow-lg'
                        : 'bg-gradient-to-r from-white/25 to-white/15 hover:bg-white hover:text-blue-600 text-white border-white/30'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center">
                      <FiLogIn className="text-lg" />
                    </div>
                    <span>Admin Login</span>
                    <FiExternalLink className="ml-auto text-sm" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-20"></div>

      {/* Add CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { transform: translateX(0%) translateY(0%); }
          50% { transform: translateX(50%) translateY(25%); }
        }
        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}