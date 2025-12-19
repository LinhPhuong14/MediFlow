"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import type { Message } from "@/lib/types"

/**
 * Hook for managing conversation with AI backend
 *
 * Responsibilities:
 * - Send messages to backend
 * - Track conversation state
 * - Expose loading/error states
 *
 * Does NOT:
 * - Generate AI responses (handled by backend)
 * - Process or analyze messages
 * - Handle conversation logic
 */
export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (sessionId: string, content: string): Promise<string> => {
    setIsThinking(true)
    setError(null)

    // Add user message to conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      // Backend processes message with LLM and returns response
      const { response, messageId } = await apiClient.sendMessage(sessionId, content)

      // Add AI response to conversation
      const aiMessage: Message = {
        id: messageId,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message"
      setError(message)
      throw err
    } finally {
      setIsThinking(false)
    }
  }, [])

  const loadHistory = useCallback(async (sessionId: string) => {
    setError(null)

    try {
      const { messages: history } = await apiClient.getConversationHistory(sessionId)
      setMessages(history)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load history"
      setError(message)
      throw err
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isThinking,
    error,
    sendMessage,
    loadHistory,
    clearMessages,
  }
}
