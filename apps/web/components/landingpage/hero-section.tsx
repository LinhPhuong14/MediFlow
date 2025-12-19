"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { PointerHighlight } from "../ui/pointer-highlight";
import { Highlight } from "../ui/hero-highlight";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 dark:from-blue-500/5 dark:via-transparent dark:to-green-500/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 dark:bg-green-400/10 rounded-full blur-3xl animate-pulse" />

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
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className=" bg-clip-text bg-blue-800 text-transparent my-4 py-0">
              Khám bệnh đơn giản cùng
            </span>
            <br />
            <motion.span className="relative inline-block">
              <Highlight className="text-black dark:text-white">
                <span className=" bg-clip-text bg-blue-400 text-transparent my-4 py-0">
                   MediFlow
                </span>
              </Highlight>

              <motion.div
                className="absolute -bottom-4 left-0 right-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-0 leading-7 h-[3px] px-0 py-0 my-0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </motion.span>
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
              <motion.div
                className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg -z-10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
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
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg group"
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
  );
}


