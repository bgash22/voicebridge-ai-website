'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Try Demo', href: '#playground' },
      { name: 'Get Started', href: '#pricing' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Contact', href: 'mailto:contact@voicebridgeai.com' },
    ],
    Resources: [
      { name: 'Support', href: 'mailto:support@voicebridgeai.com' },
      { name: 'GitHub', href: 'https://github.com/bgash22/voicebridge-ai-website' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
  }

  const socialLinks = [
    { name: 'GitHub', icon: 'GH', href: 'https://github.com/bgash22/voicebridge-ai-website' },
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
              Transform customer interactions with intelligent voice AI. Real-time, multilingual, and always available.
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
              © {new Date().getFullYear()} Voice Bridge AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
