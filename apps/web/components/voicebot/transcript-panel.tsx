"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Message } from "@/lib/types"
import { User, Bot } from "lucide-react"

interface TranscriptPanelProps {
  messages: Message[]
  currentTranscript?: string
  isListening: boolean
}

export function TranscriptPanel({ messages, currentTranscript, isListening }: TranscriptPanelProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <AnimatePresence mode="popLayout">
        {/* Display conversation history */}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user" ? "bg-blue-600 text-white" : "bg-card text-card-foreground border border-border"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Live transcript while listening */}
        {isListening && currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 justify-end"
          >
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600/50 text-white border-2 border-blue-500 border-dashed">
              <p className="text-sm leading-relaxed">{currentTranscript}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
