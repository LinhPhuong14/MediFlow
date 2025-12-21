import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Change this if VNPT gives you a custom base URL
const VNPT_BASE_URL = process.env.VNPT_STT_BASE_URL ?? 'https://api.idg.vnpt.vn';

export async function POST(request: NextRequest) {
  try {
    // Expect client to send FormData with a file field named 'audio'
    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Read audio binary
    const audioArrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    // Call VNPT STT endpoint
    const sttResponse = await fetch(`${VNPT_BASE_URL}/stt-service/v3/standard`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VNPT_ACCESS_TOKEN}`,
        'Token-id': process.env.VNPT_TOKEN_ID ?? '',
        'Token-key': process.env.VNPT_TOKEN_KEY ?? '',
        'Content-Type': file.type || 'application/octet-stream',
        'Enable-Lm': 'true',
        'Sample-Rate': '16000',    // recommended
        'capt_punct_recovery': '1',// auto punctuate
      },
      body: audioBuffer,
    });

    if (!sttResponse.ok) {
      const errText = await sttResponse.text();
      console.error('VNPT STT error:', errText);
      return NextResponse.json({ error: 'VNPT STT failed', details: errText }, { status: 502 });
    }

    const json = await sttResponse.json();

    console.log('VNPT STT result:', json);

    return NextResponse.json(json);

  } catch (err) {
    console.error('STT route error:', err);
    return NextResponse.json({ error: 'Internal error', details: String(err) }, { status: 500 });
  }
}
