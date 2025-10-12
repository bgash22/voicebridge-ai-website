'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@/lib/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    [t.footer.product]: [
      { name: t.footer.features, href: '#features' },
      { name: t.footer.tryDemo, href: '#playground' },
      { name: t.footer.getStarted, href: '#pricing' },
    ],
    [t.footer.company]: [
      { name: t.footer.about, href: '#' },
      { name: t.footer.contact, href: 'mailto:contact@aivoicebridge.com' },
    ],
    [t.footer.resources]: [
      { name: t.footer.support, href: 'mailto:support@aivoicebridge.com' },
    ],
    [t.footer.legal]: [
      { name: t.footer.privacyPolicy, href: '#' },
      { name: t.footer.termsOfService, href: '#' },
    ],
  }

  const socialLinks: { name: string; icon: string; href: string }[] = [
    // Add your social media links here:
    // { name: 'Twitter', icon: '𝕏', href: 'https://twitter.com/yourhandle' },
    // { name: 'LinkedIn', icon: 'in', href: 'https://linkedin.com/company/yourcompany' },
    // { name: 'Discord', icon: 'DC', href: 'https://discord.gg/yourinvite' },
  ]

  return (
    <footer className="bg-black border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="VoiceBridge AI Logo"
                width={50}
                height={50}
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain"
              />
              <span className="text-white font-bold text-xl">VoiceBridge AI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Voice Bridge AI. {t.footer.rights}
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                {t.footer.privacyPolicy}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t.footer.termsOfService}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t.footer.cookieSettings}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
