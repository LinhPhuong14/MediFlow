import { GlassmorphismNav } from "@/components/doctor/landing/glassmorphism-nav";
import { HeroSection } from "@/components/doctor/landing/hero-section";
import { ProblemSolutionSection } from "@/components/doctor/landing/problem-solution-section";
import { FeaturesSection } from "@/components/doctor/landing/features-section";
import { TestimonialsSection } from "@/components/doctor/landing/testimonials-section";
import { ROICalculatorSection } from "@/components/doctor/landing/roi-calculator-section";
import { CTASection } from "@/components/doctor/landing/cta-section";
import { Footer } from "@/components/doctor/landing/footer";
import ShaderBackground from "@/components/landingpage/shader-background";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function HomePage() {
  return (
    <AuroraBackground>
      <div className="w-full min-h-screen overflow-hidden">
        <main className="min-h-screen relative overflow-hidden">
          
          <div className="relative z-10 w-full">
            <GlassmorphismNav />
            <HeroSection />
            <ProblemSolutionSection />
            <FeaturesSection />
            {/* <AITeamSection /> */}
            <TestimonialsSection />
            {/* <ROICalculatorSection /> */}
            <CTASection />
            <Footer />
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
}
