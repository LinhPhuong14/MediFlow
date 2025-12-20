"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { VoiceState, VoiceSettings } from "@/lib/types";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { useAudioStream } from "@/hooks/use-audio-stream";
import { useConversation } from "@/hooks/use-conversation";
import { useSpeechOutput } from "@/hooks/use-speech-output";
import { VoiceButton } from "./voice-button";
import { ConversationLog } from "./conversation-log";
import { Volume2, VolumeX, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function VoiceController() {
  const [isMuted, setIsMuted] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: "neutral",
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  // Backend-driven hooks
  const { sessionId, startSession, endSession } = useVoiceSession();
  const { audioLevel, startRecording, stopRecording } = useAudioStream();
  const { messages, isThinking, sendMessage } = useConversation();
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechOutput();

  // Refs
  const lastAudioActivityRef = useRef<number>(0);

  useEffect(() => {
    lastAudioActivityRef.current = Date.now();
  }, []);

  /**
   * ✅ DERIVED STATE (no useEffect, no setState)
   */
  const voiceState: VoiceState = useMemo(() => {
    if (isThinking) return "thinking";
    if (isSpeaking) return "speaking";
    if (currentTranscript) return "listening";
    return "idle";
  }, [isThinking, isSpeaking, currentTranscript]);

  /**
   * Send user message → LLM → TTS
   */
  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!sessionId || !text.trim()) return;

      setCurrentTranscript("");

      try {
        const response = await sendMessage(sessionId, text);
        setLastResponse(response);

        if (!isMuted) {
          await speak(sessionId, response, voiceSettings);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
    [sessionId, sendMessage, speak, voiceSettings, isMuted]
  );

  /**
   * Handle transcript streaming from backend
   */
  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      setCurrentTranscript(transcript);

      if (isFinal && transcript.trim()) {
        stopRecording();
        handleUserMessage(transcript);
      }
    },
    [stopRecording, handleUserMessage]
  );

  /**
   * Auto restart listening (continuous conversation)
   */
  useEffect(() => {
    if (!hasStarted || !sessionId) return;

    if (!isSpeaking && !currentTranscript && voiceState === "idle") {
      const timeout = setTimeout(() => {
        startRecording(sessionId, handleTranscript);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [
    hasStarted,
    sessionId,
    isSpeaking,
    currentTranscript,
    voiceState,
    startRecording,
    handleTranscript,
  ]);

  /**
   * Audio activity tracking (visual only)
   */
  useEffect(() => {
    if (audioLevel > 0.15) {
      lastAudioActivityRef.current = Date.now();
    }
  }, [audioLevel]);

  const handleVoiceButtonClick = async () => {
    if (!hasStarted) {
      setHasStarted(true);
      const newSessionId = await startSession();
      if (newSessionId) {
        startRecording(newSessionId, handleTranscript);
      }
    } else if (voiceState === "speaking") {
      stopSpeaking();
    }
  };

  const handleReplay = async () => {
    if (lastResponse && !isSpeaking && sessionId) {
      await speak(sessionId, lastResponse, voiceSettings);
    }
  };

  const handleVoiceChange = (voice: VoiceSettings["voice"]) => {
    setVoiceSettings((prev) => ({ ...prev, voice }));
  };

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      stopRecording();
      if (sessionId) endSession();
    };
  }, [stopRecording, endSession, sessionId]);

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
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
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
              <DropdownMenuItem onClick={() => handleVoiceChange("neutral")}>
                Neutral
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVoiceChange("male")}>
                Male
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVoiceChange("female")}>
                Female
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ConversationLog
        messages={messages}
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
      />
    </div>
  );
}
