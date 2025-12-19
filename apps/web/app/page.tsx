"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeroSection from "@/components/landingpage/hero-section";
import LoadingScreen from "@/components/landingpage/loading-screen";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {!isLoading && (
        <AuroraBackground>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-screen"
          >
            <HeroSection />
          </motion.div>
        </AuroraBackground>
      )}
    </>
  );
}
