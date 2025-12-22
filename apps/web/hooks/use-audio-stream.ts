"use client";

import { useRef, useState, useCallback } from "react";

const TARGET_SAMPLE_RATE = 16000;
const RECORD_DURATION_MS = 5_000; // Giảm xuống 5 giây để test

export function useAudioStream() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSampleRateRef = useRef<number>(44100);

  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    
    setError(null);
    setTranscript("");
    setIsLoading(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      inputSampleRateRef.current = audioContext.sampleRate;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      chunksRef.current = [];
      setIsRecording(true);

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(input));

        // Calculate audio level
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        setAudioLevel(Math.sqrt(sum / input.length));
      };

      console.log("[AUDIO] Recording started");

      // Send audio every 5 seconds
      timerRef.current = setTimeout(async function tick() {
        if (isRecording) {
          await flushAudio();
          timerRef.current = setTimeout(tick, RECORD_DURATION_MS);
        }
      }, RECORD_DURATION_MS);

    } catch (err: any) {
      console.error("[AUDIO START ERROR]", err);
      setError(`Mic access failed: ${err.message}`);
    }
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    setIsLoading(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Send final audio chunk
      await flushAudio();
    } finally {
      setIsLoading(false);
      
      // Cleanup
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      setAudioLevel(0);
      console.log("[AUDIO] Recording stopped");
    }
  }, []);

  const flushAudio = async () => {
    if (!chunksRef.current.length) {
      console.log("[AUDIO] No audio chunks to send");
      return;
    }

    console.log("[AUDIO] Processing", chunksRef.current.length, "chunks");
    
    const pcm = flattenChunks(
      chunksRef.current,
      inputSampleRateRef.current
    );
    chunksRef.current = [];

    console.log("[AUDIO] PCM samples:", pcm.length, 
      "duration:", (pcm.length / TARGET_SAMPLE_RATE).toFixed(2), "s");

    // Kiểm tra nếu audio quá ngắn (dưới 1 giây)
    if (pcm.length < TARGET_SAMPLE_RATE) {
      console.warn("[AUDIO] Audio too short, skipping");
      return;
    }

    const wavBuffer = encodeWAV(pcm, TARGET_SAMPLE_RATE);
    const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

    console.log("[AUDIO] Sending to STT:", {
      size: wavBlob.size,
      duration: (pcm.length / TARGET_SAMPLE_RATE).toFixed(2) + "s"
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error("[STT] Request timeout");
      }, 30000);

      const res = await fetch("/api/stt", {
        method: "POST",
        body: wavBlob,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("[STT] Response status:", res.status);

      if (!res.ok) {
        let errorDetail = `HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          console.error("[STT ERROR DATA]", errorData);
          errorDetail = errorData.detail || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          // Không parse được JSON
          const text = await res.text();
          errorDetail = text || `Status: ${res.status}`;
        }
        
        throw new Error(errorDetail);
      }

      const data = await res.json();
      console.log("[STT SUCCESS]", data);
      
      if (data.transcript) {
        setTranscript(prev => {
          const newText = data.transcript.trim();
          return prev ? `${prev} ${newText}` : newText;
        });
      } else if (data.success) {
        // Không có transcript nhưng success
        console.log("[STT] Success but no transcript");
      }

    } catch (err: any) {
      console.error("[STT ERROR]", err);
      setError(`STT Error: ${err.message}`);
    }
  };

  // Thêm function để test với file audio có sẵn
  const testWithSampleAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Tạo audio test đơn giản (sine wave với tiếng nói giả)
      const duration = 3; // seconds
      const sampleRate = 16000;
      const samples = new Float32Array(sampleRate * duration);
      
      // Tạo tiếng nói giả
      for (let i = 0; i < samples.length; i++) {
        // Tạo sóng sine với frequency thay đổi (giống tiếng nói)
        const freq = 200 + Math.sin(i * 0.001) * 100;
        samples[i] = Math.sin(2 * Math.PI * freq * i / sampleRate) * 0.5;
      }
      
      const wavBuffer = encodeWAV(samples, sampleRate);
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
      
      console.log("[TEST] Sending sample audio:", wavBlob.size, "bytes");
      
      const res = await fetch("/api/stt", {
        method: "POST",
        body: wavBlob,
      });
      
      const data = await res.json();
      console.log("[TEST RESULT]", data);
      
      if (data.transcript) {
        setTranscript(data.transcript);
      } else if (data.error) {
        setError(data.error);
      }
      
    } catch (err: any) {
      console.error("[TEST ERROR]", err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    audioLevel,
    isRecording,
    transcript,
    error,
    isLoading,
    startRecording,
    stopRecording,
    testWithSampleAudio, // Thêm function test
  };
}
/* ================= helpers ================= */

function flattenChunks(
  chunks: Float32Array[],
  inputSampleRate: number
) {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const buffer = new Float32Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  return downsampleBuffer(buffer, inputSampleRate, TARGET_SAMPLE_RATE);
}

function downsampleBuffer(
  buffer: Float32Array,
  inputRate: number,
  outputRate: number
) {
  if (inputRate === outputRate) return buffer;

  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);

  let offset = 0;
  for (let i = 0; i < newLength; i++) {
    const next = Math.round((i + 1) * ratio);
    let sum = 0;
    let count = 0;

    for (let j = offset; j < next && j < buffer.length; j++) {
      sum += buffer[j];
      count++;
    }

    result[i] = sum / count;
    offset = next;
  }

  return result;
}

function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write PCM data
  floatTo16BitPCM(view, 44, samples);
  return buffer;
}

function floatTo16BitPCM(
  view: DataView,
  offset: number,
  samples: Float32Array
) {
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}