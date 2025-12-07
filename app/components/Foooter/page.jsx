'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiHeart,
  FiCheckCircle
} from 'react-icons/fi';
import {
  IoLogoWhatsapp,
  IoLogoInstagram,
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoYoutube,
  IoLogoLinkedin
} from 'react-icons/io5';

export default function ModernFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/pages/AboutUs' },
    { name: 'Academics', href: '/pages/academics' },
    { name: 'Admissions', href: '/pages/admissions' },
    { name: 'Assignments', href: '/pages/assignments' },
    { name: 'Staff', href: '/pages/staff' },
    { name: 'Contact', href: '/pages/contact' },
    { name: 'Gallery', href: '/pages/gallery' },
    { name: 'News & Events', href: '/pages/eventsandnews' },
  ];

  const resources = [
    { name: 'Student Portal', href: '/portal' },
    { name: 'Career Counseling', href: '/counseling' },
    { name: 'School Policies', href: '/policies' },
    { name: 'Guidance & Counseling', href: '/guidance' },
    { name: 'Sports Facilities', href: '/sports' },
    { name: 'Library Resources', href: '/library' },
    { name: 'Clubs & Societies', href: '/clubs' },
    { name: 'Alumni Network', href: '/alumni' },
  ];

  const socialLinks = [
    {
      icon: IoLogoFacebook,
      href: 'https://facebook.com/nyaribuhighschool',
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'bg-blue-500/20 hover:bg-blue-500/30',
      label: 'Facebook'
    },
    {
      icon: IoLogoTwitter,
      href: 'https://twitter.com/nyaribuhigh',
      color: 'text-sky-500 hover:text-sky-600',
      bgColor: 'bg-sky-500/20 hover:bg-sky-500/30',
      label: 'Twitter'
    },
    {
      icon: IoLogoInstagram,
      href: 'https://instagram.com/nyaribuhighschool',
      color: 'text-pink-600 hover:text-pink-700',
      bgColor: 'bg-pink-500/20 hover:bg-pink-500/30',
      label: 'Instagram'
    },
    {
      icon: IoLogoYoutube,
      href: 'https://youtube.com/nyaribuhighschool',
      color: 'text-red-600 hover:text-red-700',
      bgColor: 'bg-red-500/20 hover:bg-red-500/30',
      label: 'YouTube'
    },
    {
      icon: IoLogoLinkedin,
      href: 'https://linkedin.com/school/nyaribuhighschool',
      color: 'text-blue-700 hover:text-blue-800',
      bgColor: 'bg-blue-600/20 hover:bg-blue-600/30',
      label: 'LinkedIn'
    },
    {
      icon: IoLogoWhatsapp,
      href: 'https://wa.me/254720123456',
      color: 'text-green-600 hover:text-green-700',
      bgColor: 'bg-green-500/20 hover:bg-green-500/30',
      label: 'WhatsApp'
    },
  ];

  const contactInfo = [
    {
      icon: FiMapPin,
      text: 'Kiganjo, Nyeri County, Kenya',
      href: 'https://maps.google.com/?q=-0.416667,36.950000',
      detail: 'Along Nyeri-Nairobi Highway'
    },
    {
      icon: FiPhone,
      text: '+254 720 123 456',
      href: 'tel:+254720123456',
      detail: 'Office Line'
    },
    {
      icon: FiPhone,
      text: '+254 734 567 890',
      href: 'tel:+254734567890',
      detail: 'Admissions Office'
    },
    {
      icon: FiMail,
      text: 'info@nyaribuhigh.sc.ke',
      href: 'mailto:info@nyaribuhigh.sc.ke',
      detail: 'General Inquiries'
    },
    {
      icon: FiMail,
      text: 'admissions@nyaribuhigh.sc.ke',
      href: 'mailto:admissions@nyaribuhigh.sc.ke',
      detail: 'Admissions'
    },
    {
      icon: FiClock,
      text: 'Mon - Fri: 7:30 AM - 5:00 PM',
      href: '#',
      detail: 'Sat: 8:00 AM - 1:00 PM'
    }
  ];

  const achievements = [
    '🏆 Top Performing School in Nyeri County',
    '⭐ Excellence in Science & Mathematics',
    '🎓 95% University Placement Rate',
    '🏅 Sports Excellence Award 2023',
    '🎨 Creative Arts & Music Champions',
    '🌳 Environmental Conservation Award',
    '🤝 Community Service Recognition',
    '💻 ICT Integration Excellence'
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      // simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowSuccess(true);
      setEmail('');
      setTimeout(() => setShowSuccess(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* School Information Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            className="lg:col-span-1"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">NH</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Nyaribu High School</h3>
                <p className="text-blue-300 text-sm">Soaring for Excellence</p>
              </div>
            </motion.div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              A premier learning institution in Nyeri County, dedicated to academic excellence, 
              holistic development, and nurturing future leaders through quality education 
              and Christian values since 1975.
            </p>

            <div className="space-y-3 mb-6">
              {contactInfo.slice(0, 4).map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <motion.a
                    key={index}
                    href={item.href}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group p-2 rounded-lg hover:bg-white/5"
                  >
                    <ItemIcon className="text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <span className="text-sm">{item.text}</span>
                      {item.detail && (
                        <p className="text-xs text-gray-400 mt-1">{item.detail}</p>
                      )}
                    </div>
                  </motion.a>
                );
              })}
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <h4 className="font-semibold mb-3 text-blue-300 flex items-center gap-2">
                <FiCheckCircle className="text-green-400" />
                Recent Achievements
              </h4>
              <div className="space-y-2">
                {achievements.slice(0, 4).map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    {achievement}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links & Social Media Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="lg:col-span-2"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-6 text-blue-300 border-l-4 border-blue-500 pl-3">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <motion.li 
                      key={index} 
                      whileHover={{ x: 5 }}
                      className="group"
                    >
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 p-2 rounded-lg hover:bg-white/5"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:scale-125 transition-transform flex-shrink-0"></div>
                        {link.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-6 text-blue-300 border-l-4 border-purple-500 pl-3">
                  Resources
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {resources.map((resource, index) => (
                    <motion.a
                      key={index}
                      href={resource.href}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      className="text-gray-300 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 group py-3 px-4 rounded-xl hover:bg-white/10 border border-white/5"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full group-hover:scale-125 transition-transform flex-shrink-0"></div>
                      {resource.name}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <h5 className="font-semibold mb-4 text-blue-300 text-center text-lg">
                Connect With Us
              </h5>
              <div className="flex flex-wrap gap-3 justify-center">
                {socialLinks.map((social, index) => {
                  const SocialIcon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-300 ${social.bgColor} ${social.color} group`}
                      aria-label={social.label}
                    >
                      <SocialIcon className="text-2xl" />
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        {social.label}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Newsletter & Contact Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="lg:col-span-1"
          >
            <h4 className="text-lg font-semibold mb-6 text-blue-300 border-l-4 border-green-500 pl-3">
              Stay Updated
            </h4>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl p-6 backdrop-blur-sm border border-white/20 mb-6">
              <h5 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <FiSend className="text-blue-400" />
                School Newsletter
              </h5>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Subscribe to receive updates on academic events, achievements, 
                important announcements, and school news directly in your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !email}
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="text-lg" />
                        <span>Subscribe Now</span>
                      </>
                    )}
                  </motion.button>

                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/30 rounded-xl p-3"
                    >
                      <div className="text-green-300 text-sm flex items-center gap-2">
                        <FiCheckCircle className="text-green-400" />
                        Successfully subscribed to our newsletter!
                      </div>
                    </motion.div>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl p-6 border border-blue-400/30">
              <h5 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <FiPhone className="text-blue-400" />
                Need Immediate Assistance?
              </h5>
              <p className="text-gray-300 text-xs mb-4">
                Contact our support team during office hours for quick assistance.
              </p>
              <motion.a
                href="tel:+254720123456"
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-blue-50 w-full justify-center shadow-lg"
              >
                <FiPhone className="text-blue-600" />
                <div className="text-center">
                  <div className="font-bold">+254 720 123 456</div>
                  <div className="text-xs text-blue-500">Emergency Contact</div>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />
        )}

        {showSitemap && (
          <motion.div 
            key="sitemap" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowSitemap(false)} 
              aria-hidden="true" 
            />
            <motion.div 
              initial={{ y: 20, scale: 0.98 }} 
              animate={{ y: 0, scale: 1 }} 
              exit={{ y: 20, scale: 0.98 }} 
              className="relative bg-white text-gray-900 rounded-2xl max-w-3xl w-full p-6 mx-4 shadow-xl"
            >
              <h3 className="text-xl font-bold mb-6 text-blue-600">Site Navigation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl text-sm text-gray-700 hover:text-blue-600 transition-all border border-gray-200"
                    onClick={() => setShowSitemap(false)}
                  >
                    {link.name}
                  </motion.a>
                ))}
                {resources.slice(0, 6).map((resource, index) => (
                  <motion.a
                    key={index}
                    href={resource.href}
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-gray-50 hover:bg-purple-50 rounded-xl text-sm text-gray-700 hover:text-purple-600 transition-all border border-gray-200"
                    onClick={() => setShowSitemap(false)}
                  >
                    {resource.name}
                  </motion.a>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setShowSitemap(false)} 
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Bottom */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-300 text-sm text-center sm:text-left">
              <span>© {currentYear} Nyaribu High School, Kiganjo, Nyeri. All rights reserved.</span>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSitemap(true)} 
                  className="hover:text-white transition-colors text-sm hover:underline"
                >
                  Sitemap
                </button>
                <button 
                  onClick={() => setShowPrivacy(true)} 
                  className="hover:text-white transition-colors text-sm hover:underline"
                >
                  Terms & Privacy
                </button>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }} 
              className="flex items-center gap-2 text-gray-300 text-sm"
            >
              <span>Educating with passion and</span>
              <FiHeart className="text-red-400 animate-pulse" />
              <span>since 1975</span>
            </motion.div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            <p>Accredited by the Ministry of Education • KNEC Centre Code: 12345678</p>
            <p className="mt-1">Designed and developed by the ICT Department — For support: support@nyaribuhigh.sc.ke</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Privacy Policy Modal Component
function PrivacyPolicyModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-lg" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ y: 20, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white text-gray-900 rounded-3xl max-w-6xl w-full max-h-[90vh] shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nyaribu High School Privacy Policy & Terms</h1>
                <p className="text-blue-100 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              aria-label="Close privacy policy"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Navigation Sidebar */}
          <div className="lg:w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => document.getElementById('privacy-policy')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left p-3 rounded-xl hover:bg-white transition-colors text-sm font-medium text-gray-700"
              >
                📄 Privacy Policy
              </button>
              <button
                onClick={() => document.getElementById('terms-of-service')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left p-3 rounded-xl hover:bg-white transition-colors text-sm font-medium text-gray-700"
              >
                📝 Terms of Service
              </button>
              <button
                onClick={() => document.getElementById('data-collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left p-3 rounded-xl hover:bg-white transition-colors text-sm font-medium text-gray-700"
              >
                🔍 Data Collection
              </button>
              <button
                onClick={() => document.getElementById('user-rights')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left p-3 rounded-xl hover:bg-white transition-colors text-sm font-medium text-gray-700"
              >
                ⚖️ User Rights
              </button>
              <button
                onClick={() => document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left p-3 rounded-xl hover:bg-white transition-colors text-sm font-medium text-gray-700"
              >
                📞 Contact Information
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Privacy Policy Section */}
              <section id="privacy-policy" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-700 mb-6">
                    At Nyaribu High School, Kiganjo, we are committed to protecting the privacy and security 
                    of all personal information collected from students, parents, staff, and visitors. This 
                    policy outlines our practices regarding data collection, usage, and protection.
                  </p>

                  <div className="grid gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">Information Collection</h3>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Student academic and personal records</li>
                        <li>• Parent/guardian contact information</li>
                        <li>• Staff employment and qualification data</li>
                        <li>• Medical information for emergency purposes</li>
                        <li>• Website usage analytics (anonymized)</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <h3 className="font-semibold text-green-900 mb-3">Purpose of Data Collection</h3>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Academic administration and reporting</li>
                        <li>• Student safety and welfare monitoring</li>
                        <li>• Communication with parents and guardians</li>
                        <li>• Compliance with educational regulations</li>
                        <li>• School improvement and planning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Terms of Service Section */}
              <section id="terms-of-service" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Acceptable Use</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>Users of Nyaribu High School's digital platforms agree to:</p>
                      <ul className="space-y-2 ml-4">
                        <li>• Use services only for legitimate educational purposes</li>
                        <li>• Maintain confidentiality of login credentials</li>
                        <li>• Respect intellectual property rights</li>
                        <li>• Report technical issues promptly</li>
                        <li>• Comply with all school policies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Collection Section */}
              <section id="data-collection" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Data Collection</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-orange-900 mb-3">Types of Data</h4>
                    <ul className="space-y-2 text-sm text-orange-800">
                      <li>• Academic performance records</li>
                      <li>• Attendance and behavior records</li>
                      <li>• Contact and demographic information</li>
                      <li>• Health and medical records</li>
                      <li>• Digital activity logs</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-teal-900 mb-3">Data Protection</h4>
                    <ul className="space-y-2 text-sm text-teal-800">
                      <li>• Secure encrypted storage</li>
                      <li>• Regular security audits</li>
                      <li>• Limited access controls</li>
                      <li>• Data retention policies</li>
                      <li>• Staff training on data protection</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* User Rights Section */}
              <section id="user-rights" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">User Rights</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: '👁️', title: 'Right to Access', desc: 'View personal data records' },
                    { icon: '✏️', title: 'Correction', desc: 'Request data corrections' },
                    { icon: '🗑️', title: 'Erasure', desc: 'Request data deletion' },
                    { icon: '⏸️', title: 'Restriction', desc: 'Limit data processing' },
                    { icon: '📤', title: 'Portability', desc: 'Receive data in standard format' },
                    { icon: '🚫', title: 'Objection', desc: 'Object to certain processing' }
                  ].map((right, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                      <div className="text-2xl mb-2">{right.icon}</div>
                      <h4 className="font-semibold text-sm mb-1 text-gray-900">{right.title}</h4>
                      <p className="text-xs text-gray-600">{right.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact-info" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                      <p className="text-sm opacity-90">Email: dpo@nyaribuhigh.sc.ke</p>
                      <p className="text-sm opacity-90">Phone: +254 720 123 456</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">General Inquiries</h4>
                      <p className="text-sm opacity-90">Email: info@nyaribuhigh.sc.ke</p>
                      <p className="text-sm opacity-90">Phone: +254 734 567 890</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-sm opacity-90">
                      Nyaribu High School, Kiganjo, Nyeri County, Kenya
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  I Understand & Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  Close Policy
                </motion.button>
              </div>

              {/* Last Updated */}
              <div className="text-center text-sm text-gray-500 mt-6">
                <p>This policy was last updated on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}