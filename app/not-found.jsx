'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiArrowLeft, 
  FiBook,
  FiMail,
  FiUsers,
  FiCalendar,
  FiAward
} from 'react-icons/fi';
import { 
  IoSchoolOutline,
  IoLibraryOutline,
  IoPeopleOutline
} from 'react-icons/io5';
import Link from 'next/link';

const modern404 = () => {
  const [randomShape, setRandomShape] = useState(0);

  // Quick links to help users navigate
  const quickLinks = [
    { name: 'Home', href: '/', icon: FiHome, description: 'Return to homepage' },
    { name: 'Academics', href: '/pages/academics', icon: FiBook, description: 'Explore academic programs' },
    { name: 'Gallery', href: '/pages/gallery', icon: IoLibraryOutline, description: 'View school gallery' },
    { name: 'Admissions', href: '/pages/admissions', icon: IoPeopleOutline, description: 'Admission process' },
    { name: 'Events', href: '/pages/eventsandnews', icon: FiCalendar, description: 'Upcoming events' },
    { name: 'Contact', href: '/pages/contact', icon: FiMail, description: 'Get in touch' },
  ];

  // Fun school-related error messages
  const errorMessages = [
    "Looks like this page skipped class!",
    "This page is on a field trip!",
    "Assignment not found!",
    "This lesson hasn't been scheduled yet!",
    "Page is in detention!",
    "This classroom is empty!",
    "Lesson plan missing!",
    "This page graduated early!"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Random shape and message on load
    setRandomShape(Math.floor(Math.random() * 4));
    setCurrentMessage(Math.floor(Math.random() * errorMessages.length));

    // Change message every 5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % errorMessages.length);
    }, 5000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Background Elements - Same as login */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - 404 Display */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* 404 Number */}
              <div className="relative mb-8">
                <motion.div
                  className="text-9xl lg:text-10xl font-bold text-white mb-4 relative"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    4
                  </span>
                  <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    0
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400">
                    4
                  </span>
                </motion.div>
              </div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6"
              >
                <motion.h2
                  key={currentMessage}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl lg:text-4xl font-bold text-white mb-4"
                >
                  {errorMessages[currentMessage]}
                </motion.h2>
                <p className="text-xl text-white/70 leading-relaxed">
                  Don't worry, even the best students get lost sometimes. 
                  Let's get you back on track to amazing educational content.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link href="/">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' 
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 text-lg"
                  >
                    <FiHome className="text-xl" />
                    Back to Homepage
                  </motion.button>
                </Link>

                <button
                  onClick={() => window.history.back()}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold border border-white/20 flex items-center justify-center gap-3 text-lg transition-colors"
                >
                  <FiArrowLeft className="text-xl" />
                  Go Back
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Navigation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Quick Navigation
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {quickLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.name} href={link.href}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                          className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                              <Icon className="text-white text-xl" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                                {link.name}
                              </h4>
                              <p className="text-white/60 text-sm">
                                {link.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              {/* Fun Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl border border-white/20 p-6"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <IoSchoolOutline className="text-yellow-400" />
                  While You're Here...
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">2,000+</div>
                    <div className="text-white/60 text-xs">Students</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">150+</div>
                    <div className="text-white/60 text-xs">Teachers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-white/60 text-xs">Success Rate</div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Help Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6"
              >
                <h3 className="text-white font-semibold mb-3">
                  Need Help?
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  Our support team is here to help you find what you're looking for.
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl font-semibold transition-colors text-sm">
                    Contact Support
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-2 rounded-xl font-semibold transition-colors text-sm">
                    Live Chat
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Decorative Element */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-center mt-12"
          >
            <div className="text-white/40 text-sm">
              © {new Date().getFullYear()} Katwanyaa High School. All rights reserved.
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Help Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl z-20"
      >
        <FiAward className="text-xl" />
      </motion.button>
    </div>
  );
};

export default modern404;