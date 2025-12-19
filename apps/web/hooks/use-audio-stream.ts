"use client"

import { useState, useRef, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

/**
 * Hook for capturing and streaming audio to backend
 *
 * Responsibilities:
 * - Capture microphone audio
 * - Calculate audio levels for UI visualization
 * - Send audio chunks to backend
 *
 * Does NOT:
 * - Transcribe speech (handled by backend)
 * - Detect silence (handled by backend)
 * - Process audio data
 */
export function useAudioStream() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Calculate audio levels for visualization only
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    setAudioLevel(average / 255)

    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }, [])

  const startRecording = useCallback(
    async (sessionId: string, onTranscript?: (transcript: string, isFinal: boolean) => void) => {
      setError(null)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        // Setup audio analysis for visualization
        audioContextRef.current = new AudioContext()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)

        analyzeAudio()

        // Setup media recorder to capture audio chunks
        mediaRecorderRef.current = new MediaRecorder(stream)

        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0 && sessionId) {
            // Send audio chunk to backend for transcription
            try {
              const result = await apiClient.transcribeAudio(sessionId, event.data)
              onTranscript?.(result.transcript, result.isFinal)
            } catch (err) {
              console.error("Transcription error:", err)
            }
          }
        }

        // Send chunks every 500ms
        mediaRecorderRef.current.start(500)
        setIsRecording(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start recording"
        setError(message)
        throw err
      }
    },
    [analyzeAudio],
  )

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setIsRecording(false)
    setAudioLevel(0)
  }, [isRecording])

  return {
    isRecording,
    audioLevel,
    error,
    startRecording,
    stopRecording,
  }
}
