'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: '🎤',
    title: 'Natural Voice AI',
    description: 'Human-like conversations powered by advanced neural networks. Understand context, emotion, and intent.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🌍',
    title: 'Multilingual Support',
    description: 'Communicate in 50+ languages with real-time translation. Break language barriers effortlessly.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: '⚡',
    title: 'Real-time Processing',
    description: 'Lightning-fast response times under 100ms. No delays, just seamless conversations.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Deep insights into customer interactions. Track sentiment, topics, and performance metrics.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance. Your data is safe with us, always.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: '🔄',
    title: 'Seamless Integration',
    description: 'Easy API integration with existing systems. Get started in minutes, not months.',
    gradient: 'from-pink-500 to-rose-500',
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
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
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

        <motion.div
          className="text-6xl mb-4"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {feature.icon}
        </motion.div>

        <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
        <p className="text-gray-400 leading-relaxed">{feature.description}</p>

        {/* Hover Glow Effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`} />
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

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
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to revolutionize customer communication
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
