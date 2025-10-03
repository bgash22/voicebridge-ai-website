'use client'

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Simplified background - removing Three.js temporarily to debug */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 animate-pulse" />
    </div>
  )
}
