"use client";

import { useState, useCallback } from "react";
import type { VoiceState } from "@/lib/types";
import { VoiceButton } from "./voice-button";
import { ConversationLog } from "./conversation-log";
import { useAudioStream } from "@/hooks/use-audio-stream";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VoiceController() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Simple transcript log (local only)
  const [messages, setMessages] = useState<
    { id: string; role: "user"; content: string; timestamp: number }[]
  >([]);

  const { audioLevel, isRecording, startRecording, stopRecording } =
    useAudioStream();

  /**
   * UI-driven voice state
   */
  const voiceState: VoiceState = isRecording ? "listening" : "idle";

  /**
   * Mic button click
   */
  const handleVoiceButtonClick = useCallback(async () => {
    if (!hasStarted) {
      setHasStarted(true);
      await startRecording();
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [hasStarted, isRecording, startRecording, stopRecording]);

  /**
   * Optional: manual log entry (future-proof)
   * Hiện tại transcript được log ở console từ API
   */
  const appendTranscript = (text: string) => {
    console.log("[VOICE CONTROLLER][TRANSCRIPT]", text);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      },
    ]);
  };

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLogOpen(true)}
            className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            aria-label="View conversation history"
          >
            <History className="w-5 h-5" />
          </Button>
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
