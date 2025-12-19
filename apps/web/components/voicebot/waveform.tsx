"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface WaveformProps {
  audioLevel: number
  isActive: boolean
  bars?: number
  color?: string
}

export function Waveform({ audioLevel, isActive, bars = 5, color = "white" }: WaveformProps) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTime((t) => t + 0.1)
    }, 50)

    return () => clearInterval(interval)
  }, [isActive])

  const barArray = Array.from({ length: bars }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {barArray.map((i) => {
        const baseHeight = 4
        const maxHeight = 24
        const centerIndex = Math.floor(bars / 2)
        const distanceFromCenter = Math.abs(i - centerIndex)

        const wavePhase = Math.sin(time + i * 0.8) * 0.5 + 0.5
        const centerBoost = 1 - (distanceFromCenter / centerIndex) * 0.3
        const variance = wavePhase * centerBoost

        const height = isActive ? baseHeight + (maxHeight - baseHeight) * audioLevel * variance : baseHeight

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{
              backgroundColor: color === "white" ? "rgb(255, 255, 255)" : color,
            }}
            animate={{
              height: height,
              opacity: isActive ? 0.95 : 0.4,
            }}
            transition={{
              height: { duration: 0.1, ease: "easeOut" },
              opacity: { duration: 0.2 },
            }}
          />
        )
      })}
    </div>
  )
}
