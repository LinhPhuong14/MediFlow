"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Highlight } from "../ui/hero-highlight";
import { GrainOverlay } from "@/components/landingpage/grain-overlay";
import { PointerHighlight } from "../ui/pointer-highlight";

const HeroShader = dynamic(() => import("./hero-shader"), { ssr: false });
export default function HeroSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(t);
  }, []);

  const scrollToSection = (index: number) => {
    if (!scrollContainerRef.current) return;
    const w = scrollContainerRef.current.offsetWidth;
    scrollContainerRef.current.scrollTo({
      left: w * index,
      behavior: "smooth",
    });
    setCurrentSection(index);
  };
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY });
        const w = container.offsetWidth;
        const next = Math.round(container.scrollLeft / w);
        if (next !== currentSection) setCurrentSection(next);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentSection]);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <GrainOverlay />
      <HeroShader />
      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="inline-block mb-6"
              >
                <div className="w-30 h-30 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-7xl">🧑‍⚕️</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 text-6xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-7xl lg:text-8xl">
                <span className=" my-4 py-2 inline-block ">
                  Khám bệnh đơn giản cùng{" "}<PointerHighlight containerClassName="inline-block">MediFlow</PointerHighlight>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              >
                Trải nghiệm khám bệnh thông minh với{" "}
                <motion.span
                  className="relative inline-block font-semibold text-blue-600 dark:text-blue-400"
                  whileHover={{ scale: 1.1 }}
                >
                  trợ lí AI cá nhân hóa
                </motion.span>
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="shadow-3xl border-2 border-white bg-gradient-to-r rounded-full from-blue-600/80 to-green-600/10  hover:from-blue-300 hover:to-green-400 text-white px-8 py-4 text-lg group"
              >
                <a href="/patient/register" className="flex items-center">
                  Bắt đầu
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>

              {/* <Button
            variant="outline"
            size="lg"
            className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-4 text-lg group bg-transparent"
          >
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Xem demo
          </Button> */}
            </motion.div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
