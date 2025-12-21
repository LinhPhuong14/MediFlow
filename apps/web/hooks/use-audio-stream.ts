"use client";

import { useState, useRef, useCallback } from "react";

export function useAudioStream() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(
    async (
      sessionId: string,
      onTranscript?: (text: string, isFinal: boolean) => void
    ) => {
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        const interval = setInterval(() => {
          setAudioLevel(Math.random() * 0.3);
        }, 200);

        mediaRecorder.onstop = async () => {
          clearInterval(interval);
          setAudioLevel(0);

          const audioBlob = new Blob(chunksRef.current, { type: mimeType });

          const formData = new FormData();
          formData.append("audio", audioBlob, "speech");

          try {
            const res = await fetch("/api/stt", {
              method: "POST",
              body: formData,
            });

            const json = await res.json();

            const text =
              json?.result || json?.hypotheses?.[0]?.transcript || "";

            if (text && onTranscript) {
              onTranscript(text, true);
            }
          } catch (err) {
            console.error("STT error:", err);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start recording"
        );
      }
    },
    []
  );

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  return {
    isRecording,
    audioLevel,
    error,
    startRecording,
    stopRecording,
  };
}
