"use client"

import { useState, useCallback, useRef } from "react"
import { apiClient } from "@/lib/api-client"

/**
 * Hook for playing speech audio from backend
 *
 * Responsibilities:
 * - Request speech from backend
 * - Play audio response
 * - Track playback state
 *
 * Does NOT:
 * - Generate speech (handled by backend TTS)
 * - Process audio
 * - Synthesize voice
 */
export function useSpeechOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(
    async (
      sessionId: string,
      text: string,
      voiceSettings?: { voice: string; rate: number; pitch: number },
    ): Promise<void> => {
      setError(null)

      try {
        // Request TTS audio from backend
        const { audioUrl } = await apiClient.requestSpeech(sessionId, text, voiceSettings)

        // Play audio
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => setIsSpeaking(false)
        audio.onerror = () => {
          setIsSpeaking(false)
          setError("Failed to play audio")
        }

        await audio.play()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate speech"
        setError(message)
        setIsSpeaking(false)
        throw err
      }
    },
    [],
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
    }
  }, [])

  return {
    isSpeaking,
    error,
    speak,
    stop,
  }
}
