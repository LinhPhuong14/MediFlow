/**
 * API Client for Voice AI Backend
 *
 * All intelligence (STT, LLM, TTS) is handled by external backend.
 * Frontend only sends events and receives responses.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com"

interface ApiError {
  message: string
  code?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }))
        throw new Error(error.message)
      }

      return response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  /**
   * Start a new voice session
   * Backend initializes session and returns session ID
   */
  async startSession(): Promise<{ sessionId: string }> {
    return this.request("/voice/session/start", {
      method: "POST",
    })
  }

  /**
   * End voice session
   */
  async endSession(sessionId: string): Promise<void> {
    return this.request(`/voice/session/${sessionId}/end`, {
      method: "POST",
    })
  }

  /**
   * Send audio chunk to backend for transcription
   * Backend handles STT and returns transcript
   */
  async transcribeAudio(sessionId: string, audioBlob: Blob): Promise<{ transcript: string; isFinal: boolean }> {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    formData.append("sessionId", sessionId)

    const response = await fetch(`${this.baseUrl}/voice/transcribe`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Send user message to backend for AI processing
   * Backend handles LLM and returns response
   */
  async sendMessage(sessionId: string, message: string): Promise<{ response: string; messageId: string }> {
    return this.request("/voice/message", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        message,
      }),
    })
  }

  /**
   * Request TTS audio from backend
   * Backend generates speech and returns audio URL or stream
   */
  async requestSpeech(
    sessionId: string,
    text: string,
    voiceSettings?: { voice: string; rate: number; pitch: number },
  ): Promise<{ audioUrl: string }> {
    return this.request("/voice/speak", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        text,
        voiceSettings,
      }),
    })
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(sessionId: string): Promise<{
    messages: Array<{
      id: string
      role: "user" | "assistant"
      content: string
      timestamp: number
    }>
  }> {
    return this.request(`/voice/session/${sessionId}/history`)
  }
}

// Singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
