"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

/**
  Hook for managing voice session with backend
 Responsibilities:
 - Start/end session
 - Track session ID
 - Expose loading/error states
 */
export function useVoiceSession() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { sessionId: newSessionId } = await apiClient.startSession()
      setSessionId(newSessionId)
      return newSessionId
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start session"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const endSession = useCallback(async () => {
    if (!sessionId) return

    setIsLoading(true)
    setError(null)

    try {
      await apiClient.endSession(sessionId)
      setSessionId(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to end session"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  return {
    sessionId,
    isActive: !!sessionId,
    isLoading,
    error,
    startSession,
    endSession,
  }
}
