"use client"

import { motion } from "framer-motion"
import { Mic } from "lucide-react"
import type { VoiceState } from "@/lib/types"
import { Waveform } from "./waveform"

interface VoiceButtonProps {
  state: VoiceState
  audioLevel: number
  onClick: () => void
  hasStarted: boolean
}

export function VoiceButton({ state, audioLevel, onClick, hasStarted }: VoiceButtonProps) {
  const isAnimated = hasStarted

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "180px",
          height: "180px",
        }}
        animate={{
          background: [
            "conic-gradient(from 0deg, rgba(59, 130, 246, 0.08), rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.08))",
            "conic-gradient(from 360deg, rgba(59, 130, 246, 0.08), rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.08))",
          ],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <motion.button
        onClick={onClick}
        className="relative z-10 w-36 h-36 rounded-full flex items-center justify-center transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200/40"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
          boxShadow: "0 10px 40px rgba(59, 130, 246, 0.25), 0 4px 16px rgba(6, 182, 212, 0.2)",
        }}
        animate={{
          scale: state === "listening" ? 1.08 + audioLevel * 0.08 : state === "thinking" ? [1, 1.02, 1] : 1,
          boxShadow:
            state === "listening"
              ? [
                  "0 10px 40px rgba(59, 130, 246, 0.25), 0 4px 16px rgba(6, 182, 212, 0.2)",
                  `0 12px 50px rgba(59, 130, 246, ${0.35 + audioLevel * 0.15}), 0 6px 24px rgba(6, 182, 212, ${0.3 + audioLevel * 0.1})`,
                  "0 10px 40px rgba(59, 130, 246, 0.25), 0 4px 16px rgba(6, 182, 212, 0.2)",
                ]
              : state === "speaking"
                ? [
                    "0 10px 40px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(6, 182, 212, 0.25)",
                    "0 14px 55px rgba(59, 130, 246, 0.4), 0 8px 28px rgba(6, 182, 212, 0.35)",
                    "0 10px 40px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(6, 182, 212, 0.25)",
                  ]
                : "0 10px 40px rgba(59, 130, 246, 0.25), 0 4px 16px rgba(6, 182, 212, 0.2)",
        }}
        transition={{
          scale: {
            duration: state === "listening" ? 0.3 : state === "thinking" ? 2.5 : 0.2,
            repeat: state === "thinking" ? Number.POSITIVE_INFINITY : 0,
            ease: "easeOut",
          },
          boxShadow: {
            duration: state === "listening" ? 0.4 : state === "speaking" ? 2 : 0.3,
            repeat: state === "speaking" ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          },
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label={
          !hasStarted
            ? "Start conversation"
            : state === "listening"
              ? "Listening to you"
              : state === "thinking"
                ? "Thinking"
                : state === "speaking"
                  ? "Tap to stop speaking"
                  : "Ready to listen"
        }
      >
        {(!hasStarted || state === "idle") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Mic className="w-14 h-14 text-white drop-shadow-md" />
          </motion.div>
        )}

        {state === "listening" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Waveform audioLevel={audioLevel} isActive={true} bars={7} color="white" />
          </motion.div>
        )}

        {state === "thinking" && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-white/90"
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [0.85, 1.15, 0.85],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.25,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {state === "speaking" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Waveform audioLevel={0.75} isActive={true} bars={7} color="white" />
          </motion.div>
        )}
      </motion.button>

      <motion.div
        className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-sm text-gray-400 font-light tracking-wide"
        initial={{ opacity: 0, y: -5 }}
        animate={{
          opacity: !hasStarted ? 0.6 : state === "listening" ? 0.7 : state === "speaking" ? 0.6 : 0.5,
          y: 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {!hasStarted && "Tap to begin"}
        {hasStarted && state === "idle" && "I'm listening"}
        {state === "listening" && "I'm listening"}
        {state === "thinking" && "One moment"}
        {state === "speaking" && ""}
      </motion.div>
    </div>
  )
}
