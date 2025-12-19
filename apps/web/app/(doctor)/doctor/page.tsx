import { GlassmorphismNav } from "@/components/doctor/landing/glassmorphism-nav"
import { HeroSection } from "@/components/doctor/landing/hero-section"
import { ProblemSolutionSection } from "@/components/doctor/landing/problem-solution-section"
import Aurora from "@/components/doctor/landing/Aurora"
import { FeaturesSection } from "@/components/doctor/landing/features-section"
import { AITeamSection } from "@/components/doctor/landing/ai-team-section"
import { TestimonialsSection } from "@/components/doctor/landing/testimonials-section"
import { ROICalculatorSection } from "@/components/doctor/landing/roi-calculator-section"
import { CTASection } from "@/components/doctor/landing/cta-section"
import { Footer } from "@/components/doctor/landing/footer"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-cyan-200 overflow-hidden">
      <main className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 w-full h-full">
          <Aurora colorStops={["#475569", "#64748b", "#475569"]} amplitude={1.2} blend={0.6} speed={0.8} />
        </div>
        <div className="relative z-10">
          <GlassmorphismNav />
          <HeroSection />
          <ProblemSolutionSection />
          <FeaturesSection />
          <AITeamSection />
          <TestimonialsSection />
          <ROICalculatorSection />
          <CTASection />
          <Footer />
        </div>
      </main>
    </div>
  )
}
