import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import AIPlayground from '@/components/AIPlayground'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black">
        <HeroSection />
        <FeaturesSection />
        <AIPlayground />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
