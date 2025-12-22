// import { NextResponse } from "next/server";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     console.log(" STT ROUTE HIT");

//     const audioBuffer = Buffer.from(await req.arrayBuffer());

//     const base64Audio = audioBuffer.toString("base64");

//     console.log("[STT] Received WAV", {
//       size: audioBuffer.length,
//       base64Length: base64Audio.length,
//     });

//     const requestBody = {
//       file_content: base64Audio,
//       audio_format: "wav",
//       sample_rate: 16000,
//       num_channels: 1,
//       language: "vi",
//       domain: "general",
//       cap_punct_recovery: "1",
//       enable_lm: "true",
//     };

//     console.log("[VNPT REQUEST]", {
//       endpoint: "https://api.idg.vnpt.vn/stt-service/v3/standard",
//       bodySize: JSON.stringify(requestBody).length,
//     });

//     const res = await fetch("https://api.idg.vnpt.vn/stt-service/v3/standard", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json", // Phải là JSON!
//         Authorization: `Bearer ${process.env.SMARTVOICE_STT_ACCESS_TOKEN}`,
//         "Token-id": process.env.SMARTVOICE_STT_TOKEN_ID!,
//         "Token-key": process.env.SMARTVOICE_STT_TOKEN_KEY!,
//       },
//       body: JSON.stringify(requestBody),
//     });

//     console.log("[VNPT RESPONSE STATUS]", res.status);

//     if (!res.ok) {
//       const text = await res.text();
//       console.error("[VNPT STT ERROR]", {
//         status: res.status,
//         statusText: res.statusText,
//         body: text,
//       });

//       return NextResponse.json(
//         { error: "VNPT STT failed", detail: text },
//         { status: res.status }
//       );
//     }

//     const data = await res.json();
//     console.log("[VNPT STT RESPONSE DATA]", data);

//     let transcript = "";
//     if (data?.hypotheses?.[0]?.transcript) {
//       transcript = data.hypotheses[0].transcript;
//     } else if (data?.result?.text) {
//       transcript = data.result.text;
//     } else if (data?.text) {
//       transcript = data.text;
//     }

//     console.log("[VNPT STT][TRANSCRIPT]", transcript);

//     return NextResponse.json({
//       transcript,
//       raw: data,
//     });
//   } catch (err: any) {
//     console.error("[STT API ERROR]", {
//       message: err?.message,
//       stack: err?.stack,
//     });

//     return NextResponse.json(
//       {
//         error: "Internal STT error",
//         message: err?.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export const runtime = "nodejs";

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  console.log(`[${requestId}] 🔥 STT ROUTE HIT`);

  try {
    // Lấy audio buffer
    const audioBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    console.log(`[${requestId}] Audio buffer size: ${buffer.length} bytes`);

    // Kiểm tra environment variables
    const envVars = {
      token: process.env.SMARTVOICE_STT_ACCESS_TOKEN,
      tokenId: process.env.SMARTVOICE_STT_TOKEN_ID,
      tokenKey: process.env.SMARTVOICE_STT_TOKEN_KEY,
    };
    
    if (!envVars.token || !envVars.tokenId || !envVars.tokenKey) {
      return NextResponse.json(
        { error: "Server configuration error - missing tokens" },
        { status: 500 }
      );
    }

    // Base URL
    const baseUrl = "https://api.idg.vnpt.vn/stt-service/v1/grpc/async/standard";
    
    // Tạo clientSession ID theo UUID format (có thể API yêu cầu UUID)
    const clientSessionId = uuidv4(); // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    
    // Test với các UUID formats khác nhau
    const testCases = [
      // Test 1: Header với UUID (format 1)
      {
        name: "Header with UUID v4",
        url: baseUrl,
        headers: {
          "Content-Type": "audio/wave",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
          "clientSession": clientSessionId, // UUID v4
        },
        body: buffer,
      },
      
      // Test 2: Header với UUID không có dấu gạch
      {
        name: "Header with UUID no dashes",
        url: baseUrl,
        headers: {
          "Content-Type": "audio/wave",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
          "clientSession": clientSessionId.replace(/-/g, ''), // UUID without dashes
        },
        body: buffer,
      },
      
      // Test 3: Header với format từ TTS token-id
      {
        name: "Header with TTS-like format",
        url: baseUrl,
        headers: {
          "Content-Type": "audio/wave",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
          "clientSession": envVars.tokenId, // Dùng token-id làm clientSession
        },
        body: buffer,
      },
      
      // Test 4: JSON với UUID trong body
      {
        name: "JSON with UUID in body",
        url: baseUrl,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
        },
        body: JSON.stringify({
          clientSession: clientSessionId,
          audio: {
            content: buffer.toString('base64'),
            format: "WAVE",
            sampleRate: 16000,
            channels: 1,
          }
        }),
      },
      
      // Test 5: Đúng như TTS API format
      {
        name: "TTS-like format",
        url: baseUrl,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
          "clientSession": clientSessionId,
        },
        body: JSON.stringify({
          file_content: buffer.toString('base64'),
          audio_format: "wav",
          sample_rate: 16000,
          num_channels: 1,
          language: "vi",
          domain: "general",
        }),
      },
      
      // Test 6: Thử endpoint khác (sync)
      {
        name: "Sync endpoint",
        url: "https://api.idg.vnpt.vn/stt-service/v1/grpc/sync/standard",
        headers: {
          "Content-Type": "audio/wave",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
          "clientSession": clientSessionId,
          "sample-rate": "16000",
          "domain": "general",
        },
        body: buffer,
      },
      
      // Test 7: Thử v3 endpoint với header
      {
        name: "v3 endpoint with headers",
        url: "https://api.idg.vnpt.vn/stt-service/v3/standard",
        headers: {
          "Content-Type": "audio/wave",
          "Authorization": `Bearer ${envVars.token}`,
          "Token-id": envVars.tokenId,
          "Token-key": envVars.tokenKey,
          "clientSession": clientSessionId,
          "sample-rate": "16000",
          "domain": "general",
          "bit-per-rate": "16",
          "Enable-Lm": "true",
        },
        body: buffer,
      },
    ];

    console.log(`[${requestId}] Testing ${testCases.length} formats with UUID...`);
    console.log(`[${requestId}] Generated clientSession UUID: ${clientSessionId}`);

    for (const testCase of testCases) {
      console.log(`\n[${requestId}] === Testing: ${testCase.name} ===`);
      console.log(`[${requestId}] URL: ${testCase.url}`);
      
      try {
        const response = await fetch(testCase.url, {
          method: "POST",
          headers: testCase.headers as HeadersInit,
          body: testCase.body,
        });

        console.log(`[${requestId}] Response status: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        console.log(`[${requestId}] Response:`, responseText.substring(0, 500));

        if (response.ok) {
          let data;
          try {
            data = JSON.parse(responseText);
          } catch {
            data = { raw: responseText };
          }

          const transcript = extractTranscript(data);
          
          console.log(`[${requestId}] ✅ SUCCESS with ${testCase.name}!`);
          console.log(`[${requestId}] Transcript: "${transcript}"`);
          console.log(`[${requestId}] Request completed in ${Date.now() - startTime}ms`);

          return NextResponse.json({
            success: true,
            transcript,
            raw: data,
            formatUsed: testCase.name,
            clientSessionId,
          });
        } else {
          // Log error type
          if (responseText.includes('clientSession')) {
            console.log(`[${requestId}] ❌ Still clientSession error`);
          } else if (responseText.includes('Audio file required')) {
            console.log(`[${requestId}] ❌ Audio file not accepted`);
          } else {
            console.log(`[${requestId}] ❌ Other error`);
          }
        }
      } catch (error: any) {
        console.log(`[${requestId}] ❌ Request failed:`, error.message);
        continue;
      }
    }

    // Tất cả đều thất bại
    console.log(`[${requestId}] All formats failed. Need VNPT API documentation.`);
    
    // Trả về mock nhưng với debug info chi tiết
    return NextResponse.json({
      success: false,
      mock: true,
      transcript: "Xin chào, hệ thống STT đang bảo trì",
      error: "VNPT STT API requires correct clientSession format",
      debug: {
        testedFormats: testCases.length,
        clientSessionId,
        requiredAction: "Contact VNPT for correct API format",
        contact: "support@vnpt.vn",
        note: "API responds but rejects clientSession format. Need official documentation."
      },
      suggestions: [
        "Ask VNPT for exact clientSession format (UUID? string? length?)",
        "Request complete API documentation for /stt-service/v1/grpc/async/standard",
        "Check if authentication tokens are correct for STT service"
      ]
    });

  } catch (err: any) {
    console.error(`[${requestId}] STT API ERROR:`, err.message);
    return NextResponse.json(
      {
        error: "Internal STT error",
        message: err.message,
      },
      { status: 500 }
    );
  }
}

function extractTranscript(data: any): string {
  // Implementation...
  return "";
}