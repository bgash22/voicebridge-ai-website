'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const featureIcons = ['🎤', '🌍', '⚡', '📊', '🔒', '🔄']
const featureGradients = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
]

function FeatureCard({ feature, gradient, icon, index }: { feature: { title: string; description: string }; gradient: string; icon: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, rotateZ: 1 }}
      className="group relative"
    >
      <div className="glass-morphism rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300">
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

        <motion.div
          className="text-6xl mb-4"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {icon}
        </motion.div>

        <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
        <p className="text-gray-400 leading-relaxed">{feature.description}</p>

        {/* Hover Glow Effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`} />
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient">
            {t.features.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.features.items.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              gradient={featureGradients[index]}
              icon={featureIcons[index]}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
