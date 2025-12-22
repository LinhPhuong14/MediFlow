"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, MicOff } from "lucide-react"

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
  onerror: (event: any) => void
}


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là Giphe 🐸, trợ lý AI của GIPHE. Hỏi tôi bất cứ điều gì nhé!",
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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
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

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)
          setCurrentTranscript("")
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const appendMessage = (msg: Message) => setMessages((prev) => [...prev, msg])

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

      const data = (await res.json()) as { response?: string; error?: string }
      const botReply =
        data.response || data.error || "Xin lỗi, tôi không thể trả lời ngay lúc này. Bạn thử lại sau nhé! 😊"

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: "bot",
        timestamp: new Date(),
      }

      appendMessage(botMessage)
    } catch (err) {
      console.error("Chat error:", err)
      appendMessage({
        id: (Date.now() + 2).toString(),
        text: "Xin lỗi, hệ thống gặp sự cố kỹ thuật. Vui lòng thử lại sau! 😊",
        sender: "bot",
        timestamp: new Date(),
      })
    } finally {
      setIsTyping(false)
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const quickQuestions = ["GIPHE là gì?", "Giá cả như thế nào?", "Có những tính năng gì?", "Làm sao để liên hệ hỗ trợ?"]

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-16 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[70vh] sm:h-[500px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl">🐸</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Giphe</h3>
                  <p className="text-xs text-white/80">Trợ lý AI của GIPHE</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 sm:p-2"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-2xl ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div className="flex items-start space-x-1 sm:space-x-2">
                      {m.sender === "bot" && <Bot className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-blue-600" />}
                      {m.sender === "user" && <User className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-white" />}
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Live transcript */}
              {currentTranscript && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-2xl bg-blue-300 text-blue-900 border-2 border-blue-400 border-dashed">
                    <div className="flex items-start space-x-1 sm:space-x-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mt-1" />
                      <p className="text-xs sm:text-sm leading-relaxed">
                        {currentTranscript}
                        <span className="animate-pulse">|</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-2xl">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-blue-600" />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        GipheBee đang suy nghĩ...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-3 sm:px-4 pb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Câu hỏi thường gặp:</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInputValue(q)}
                      className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 sm:px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      disabled={isTyping}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1 sm:space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 dark:bg-gray-800 dark:border-gray-600 text-xs sm:text-sm"
                  disabled={isTyping}
                />
                <Button
                  onClick={toggleRecording}
                  disabled={isTyping}
                  className={`p-2 sm:p-3 ${
                    isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-gray-500 hover:bg-gray-600"
                  } ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isRecording ? (
                    <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 p-2 sm:p-3"
                >
                  {isTyping ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="flex items-center justify-center mt-2 text-red-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Đang ghi âm...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}