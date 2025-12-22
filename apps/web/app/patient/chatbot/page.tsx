"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Bot, User, Loader2, Mic, MicOff } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onstart: () => void
  onend: () => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là MediGuide 🧑‍⚕️. Hãy mô tả nhu cầu khám bệnh của bạn để mình tư vấn khoa khám nhé!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Init Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "vi-VN"

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setInputValue(finalTranscript)
            setCurrentTranscript("")
            handleSendMessage(finalTranscript)
          } else {
            setCurrentTranscript(interimTranscript)
          }
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
          setCurrentTranscript("")
        }

        recognitionRef.current.onerror = () => {
          setIsRecording(false)
          setCurrentTranscript("")
        }
      }
    }

    return () => recognitionRef.current?.abort()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentTranscript, isTyping])

  const appendMessage = (msg: Message) =>
    setMessages((prev) => [...prev, msg])

  const handleSendMessage = async (messageText?: string) => {
    const userText = messageText || inputValue.trim()
    if (!userText || isTyping) return

    setInputValue("")
    setCurrentTranscript("")

    appendMessage({
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    })

    setIsTyping(true)

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      })

      const data = await res.json()
      appendMessage({
        id: (Date.now() + 1).toString(),
        text:
          data.response ||
          data.error ||
          "Xin lỗi, tôi chưa trả lời được lúc này",
        sender: "bot",
        timestamp: new Date(),
      })
    } catch {
      appendMessage({
        id: (Date.now() + 2).toString(),
        text: "Có lỗi kỹ thuật, bạn thử lại nhé!",
        sender: "bot",
        timestamp: new Date(),
      })
    } finally {
      setIsTyping(false)
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) return
    isRecording
      ? recognitionRef.current.stop()
      : recognitionRef.current.start()
    setIsRecording(!isRecording)
  }

  return (
    <section className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-400/50 to-lime-600/50 text-teal-900 px-4 py-3 flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 text-4xl rounded-full flex items-center justify-center">
          🧑‍⚕️
        </div>
        <div>
          <h3 className="font-bold">MediGuide</h3>
          <p className="text-xs text-teal-900/80">Trợ lý AI tiếp đón của MediFlow</p>
        </div>
      </div>

      {/* Messages */}
      <div className="relative mt-16 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="flex gap-2 items-start">
                  {m.sender === "bot" ? (
                    <Bot className="w-4 h-4 mt-1 text-blue-500" />
                  ) : (
                    <User className="w-4 h-4 mt-1" />
                  )}
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live transcript */}
        {currentTranscript && (
          <div className="flex justify-end">
            <div className="bg-blue-200 text-blue-900 px-4 py-3 rounded-2xl border border-dashed">
              {currentTranscript}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-500">
                MediGuide đang trả lời...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-12 py-3 flex gap-2 w-full items-center justify-between">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Nhập câu hỏi..."
          disabled={isTyping}
          className="w-2xl flex-1 border-gray-300  border-2 rounded-md px-4 py-2"
        />
        <div className="flex items-center gap-2" >
        <Button
          onClick={toggleRecording}
          className="bg-red-600 rounded-full right-0 mx-auto px-4 py-2 flex items-center"
        >
          {isRecording ? <MicOff /> : <Mic />}
        </Button>
        <Button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isTyping}
          className="bg-blue-600 right-0 rounded-full px-4 py-2 flex items-center justify-center"
        >
          {isTyping ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
        </div>
      </div>
    </section>
  )
}
