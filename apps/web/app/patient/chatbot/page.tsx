"use client"
import Chatbot from "@/components/landingpage/chatbot"
import { Button } from "@/components/ui/button"
import { VoiceController } from "@/components/voicebot/voice-controller"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { motion } from "framer-motion"
import { useState } from "react"

function VoiceMode() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-blue-100 text-blue-800"
    >
      <VoiceController />
    </motion.div>
  )
}

function ChatMode() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-green-100 text-green-800"
    >
      <Chatbot />
    </motion.div>
  )
}
export default function Page() {
  const [mode, setMode] = useState<"voice" | "chat" | null>(null)

  if (mode === "voice") return <VoiceMode />
  if (mode === "chat") return <ChatMode />

  return (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-screen gap-4"
    >
      <h1 className="text-2xl font-semibold mb-2">Choose your mode</h1>
      <div className="flex gap-4">
        <Button
          onClick={() => setMode("voice")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          🎤 Voice
        </Button>
        <Button
          onClick={() => setMode("chat")}
          className="bg-green-600 hover:bg-green-700"
        >
          💬 Chat
        </Button>
      </div>
    </motion.div>
  )
}
