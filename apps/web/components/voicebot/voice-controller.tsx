"use client"

import { useState, useEffect, useRef } from "react"
import type { VoiceState, VoiceSettings } from "@/lib/types"
import { useVoiceSession } from "@/hooks/use-voice-session"
import { useAudioStream } from "@/hooks/use-audio-stream"
import { useConversation } from "@/hooks/use-conversation"
import { useSpeechOutput } from "@/hooks/use-speech-output"
import { VoiceButton } from "./voice-button"
import { ConversationLog } from "./conversation-log"
import { Volume2, VolumeX, RotateCcw, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const SILENCE_THRESHOLD_MS = 1500

export function VoiceController() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [lastResponse, setLastResponse] = useState("")
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: "neutral",
    rate: 1,
    pitch: 1,
    volume: 1,
  })

  // API-driven hooks - thin wrappers around backend calls
  const { sessionId, startSession, endSession } = useVoiceSession()
  const { audioLevel, startRecording, stopRecording } = useAudioStream()
  const { messages, isThinking, sendMessage } = useConversation()
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechOutput()

  const lastAudioActivityRef = useRef<number>(Date.now())
  const silenceTimeoutRef = useRef<NodeJS.Timeout>()

  // Update voice state based on backend responses
  useEffect(() => {
    if (isThinking) {
      setVoiceState("thinking")
    } else if (isSpeaking) {
      setVoiceState("speaking")
    } else if (currentTranscript) {
      setVoiceState("listening")
    } else {
      setVoiceState("idle")
    }
  }, [isThinking, isSpeaking, currentTranscript])

  // Auto-restart listening after AI speaks (continuous conversation)
  useEffect(() => {
    if (!hasStarted || !sessionId) return

    if (!isSpeaking && !currentTranscript && voiceState === "idle") {
      const timeout = setTimeout(() => {
        startRecording(sessionId, handleTranscript)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [hasStarted, sessionId, isSpeaking, currentTranscript, voiceState])

  // Monitor audio levels for silence detection (visual only, backend handles actual detection)
  useEffect(() => {
    if (audioLevel > 0.15) {
      lastAudioActivityRef.current = Date.now()
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [audioLevel])

  // Handle transcript updates from backend
  const handleTranscript = (transcript: string, isFinal: boolean) => {
    setCurrentTranscript(transcript)

    // Backend signals final transcript - stop recording and send message
    if (isFinal && transcript.trim()) {
      stopRecording()
      handleUserMessage(transcript)
    }
  }

  // Send user message to backend and get AI response
  const handleUserMessage = async (text: string) => {
    if (!sessionId || !text.trim()) return

    setCurrentTranscript("")

    try {
      // Backend processes message with LLM
      const response = await sendMessage(sessionId, text)
      setLastResponse(response)

      // Backend handles TTS
      if (!isMuted && sessionId) {
        await speak(sessionId, response, voiceSettings)
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }

  const handleVoiceButtonClick = async () => {
    if (!hasStarted) {
      // Initialize session with backend
      setHasStarted(true)
      const newSessionId = await startSession()
      if (newSessionId) {
        startRecording(newSessionId, handleTranscript)
      }
    } else if (voiceState === "speaking") {
      // Stop current speech
      stopSpeaking()
    }
  }

  const handleReplay = async () => {
    if (lastResponse && !isSpeaking && sessionId) {
      await speak(sessionId, lastResponse, voiceSettings)
    }
  }

  const handleVoiceChange = (voice: VoiceSettings["voice"]) => {
    setVoiceSettings((prev) => ({ ...prev, voice }))
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      if (sessionId) {
        endSession()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-12">
      <div className="flex-shrink-0">
        <VoiceButton
          state={voiceState}
          audioLevel={audioLevel}
          onClick={handleVoiceButtonClick}
          hasStarted={hasStarted}
        />
      </div>

      {hasStarted && (
        <div className="flex-shrink-0 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLogOpen(true)}
            className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            aria-label="View conversation history"
          >
            <History className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            aria-label={isMuted ? "Unmute voice" : "Mute voice"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleReplay}
            disabled={!lastResponse || isSpeaking}
            className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30"
            aria-label="Replay last response"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              >
                Voice: {voiceSettings.voice}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleVoiceChange("neutral")}>Neutral</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVoiceChange("male")}>Male</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVoiceChange("female")}>Female</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ConversationLog messages={messages} isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </div>
  )
}
