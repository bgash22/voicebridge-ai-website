'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, LanguageCode, Translation } from './translations'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('EN')
  const [mounted, setMounted] = useState(false)

  // Load saved language from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('language') as LanguageCode
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang)
    }
  }, [])

  // Update HTML attributes and localStorage when language changes
  useEffect(() => {
    if (!mounted) return

    const isRTL = language === 'AR'
    const langCode = language.toLowerCase()

    document.documentElement.setAttribute('lang', langCode)
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    localStorage.setItem('language', language)
  }, [language, mounted])

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
