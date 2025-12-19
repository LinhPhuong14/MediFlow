// Voice bot state types
export type VoiceState = "idle" | "listening" | "thinking" | "speaking"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface VoiceSettings {
  voice: "male" | "female" | "neutral"
  rate: number
  pitch: number
  volume: number
}
