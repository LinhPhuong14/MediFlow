"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Mic, MicOff, X } from "lucide-react";
import { VoiceController } from "@/components/voicebot/voice-controller";
import ShaderBackground from "@/components/landingpage/shader-background";

/* =======================
   Types
======================= */

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type SpeechRecognitionCtor =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition

/* =======================
   Component
======================= */

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là MediGuide 🧑‍⚕️. Hãy mô tả nhu cầu khám bệnh của bạn để mình tư vấn khoa khám nhé!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isExpanded]);
  /* =======================
     Init Speech Recognition
  ======================= */

 useEffect(() => {
  if (typeof window === "undefined") return;

  const SpeechRecognitionCtor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    console.warn("SpeechRecognition not supported");
    return;
  }

  const recognition = new SpeechRecognitionCtor();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "vi-VN";

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      setInputValue(finalTranscript);
      setCurrentTranscript("");
      handleSendMessage(finalTranscript);
    } else {
      setCurrentTranscript(interimTranscript);
    }
  };

  recognition.onend = () => {
    setIsRecording(false);
    setCurrentTranscript("");
  };

  recognition.onerror = () => {
    setIsRecording(false);
    setCurrentTranscript("");
  };

  recognitionRef.current = recognition;

  return () => recognition.abort();
}, []);

  /* =======================
     Auto scroll
  ======================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript, isTyping]);

  /* =======================
     Helpers
  ======================= */

  const appendMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const handleSendMessage = async (messageText?: string) => {
    const userText = messageText || inputValue.trim();
    if (!userText || isTyping) return;

    setInputValue("");
    setCurrentTranscript("");

    appendMessage({
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    });

    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      appendMessage({
        id: (Date.now() + 1).toString(),
        text:
          data.response ||
          data.error ||
          "Xin lỗi, tôi chưa trả lời được lúc này",
        sender: "bot",
        timestamp: new Date(),
      });
    } catch {
      appendMessage({
        id: (Date.now() + 2).toString(),
        text: "Có lỗi kỹ thuật, bạn thử lại nhé!",
        sender: "bot",
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }

    setIsRecording((prev) => !prev);
  };

  /* =======================
     Render
  ======================= */

  return (
    <section className="bg-white relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-400/50 to-lime-300/50 text-teal-900 px-4 py-3 flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 text-4xl rounded-full flex items-center justify-center">
          🧑‍⚕️
        </div>
        <div>
          <h3 className="font-bold">MediGuide</h3>
          <p className="text-xs text-teal-900/80">
            Trợ lý AI tiếp đón của MediFlow
          </p>
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
                    ? "bg-lime-500 text-white"
                    : "bg-amber-200/20 text-gray-800"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
            <div className="bg-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2">
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
      <div className="border-t px-6 py-3 flex gap-2 items-center">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Nhập câu hỏi..."
          disabled={isTyping}
          className="flex-1 w-3xl px-auto outline-grey"
        />

        <Button onClick={handleExpand} className="bg-red-600 rounded-full">
          <Mic />
        </Button>

        <Button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isTyping}
          className="bg-blue-600 rounded-full"
        >
          {isTyping ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            layoutId="cta-card"
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="
            fixed inset-0 z-50
            w-full h-full
            max-w-none
            overflow-hidden
            transform-gpu will-change-transform
          "
            style={{ borderRadius: "0px" }} // full screen = no radius
          >
            <ShaderBackground>
              {/* Overlay animation layer */}
              <motion.div
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inset-0 pointer-events-none"
              />

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="
              relative z-50
              flex flex-col lg:flex-row
              w-full h-full
            
              gap-6 lg:gap-16
              items-center justify-center
            "
              >
                <VoiceController />
              </motion.div>

              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                aria-label="Close"
                className="
              fixed top-4 right-4 sm:top-6 sm:right-6
              z-50
              flex h-10 w-10 items-center justify-center
              rounded-full
              text-white
              bg-white/10 backdrop-blur
              hover:bg-white/20
              transition
            "
              >
                <X className="h-5 w-5 z-50" />
              </motion.button>
            </ShaderBackground>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
