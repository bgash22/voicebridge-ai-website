'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/lib/LanguageContext'
import { LanguageCode } from '@/lib/translations'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    { code: 'EN' as LanguageCode, name: 'English', flag: '🇬🇧' },
    { code: 'AR' as LanguageCode, name: 'العربية', flag: '🇸🇦' },
    { code: 'ES' as LanguageCode, name: 'Español', flag: '🇪🇸' },
    { code: 'FR' as LanguageCode, name: 'Français', flag: '🇫🇷' },
    { code: 'ZH' as LanguageCode, name: '中文', flag: '🇨🇳' },
    { code: 'DE' as LanguageCode, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'TR' as LanguageCode, name: 'Türkçe', flag: '🇹🇷' },
    { code: 'HI' as LanguageCode, name: 'हिन्दी', flag: '🇮🇳' },
  ]

  const navLinks = [
    { name: t.nav.features, href: '#features' },
    { name: t.nav.playground, href: '#playground' },
    { name: t.nav.getStarted, href: '#pricing' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Image
              src="/logo.png"
              alt="VoiceBridge AI Logo"
              width={50}
              height={50}
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain"
            />
            <span className="text-white font-bold text-xl">VoiceBridge AI</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                whileHover={{ scale: 1.1 }}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.name}
              </motion.a>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                <span>{languages.find(l => l.code === language)?.flag}</span>
                <span className="font-medium">{language}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {/* Language Dropdown */}
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 right-0 glass-morphism rounded-lg shadow-xl border border-white/10 py-2 min-w-[160px] z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setLangMenuOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-white/10 transition-colors ${
                        language === lang.code ? 'text-primary-400' : 'text-gray-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.a
              href="#pricing"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
            >
              {t.nav.getStarted}
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-gray-300 hover:text-white transition-colors duration-200 py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}

            {/* Mobile Language Selector */}
            <div className="py-2 border-t border-white/10 mt-3 pt-3">
              <div className="text-gray-400 text-sm mb-2">Language</div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      language === lang.code
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-center"
            >
              {t.nav.getStarted}
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
