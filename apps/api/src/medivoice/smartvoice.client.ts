import { Injectable } from '@nestjs/common';

/**
 * VNPT SmartVoice client (embedded inside Medivoice module)
 *
 * Required env:
 *  - SMARTVOICE_BASE_URL
 *
 * STT (Speech-to-Text) credentials:
 *  - SMARTVOICE_STT_TOKEN_ID
 *  - SMARTVOICE_STT_TOKEN_KEY
 *  - SMARTVOICE_STT_ACCESS_TOKEN (or OAuth)
 *
 * TTS (Text-to-Speech) credentials:
 *  - SMARTVOICE_TTS_TOKEN_ID
 *  - SMARTVOICE_TTS_TOKEN_KEY
 *  - SMARTVOICE_TTS_ACCESS_TOKEN (or OAuth)
 *
 * API paths (adjust to match VNPT doc/Postman):
 *  - SMARTVOICE_STT_SYNC_PATH    default: /stt-service/v1/standard
 *  - SMARTVOICE_STT_ASYNC_PATH   default: /stt-service/v1/async/standard
 *  - SMARTVOICE_STT_RESULT_PATH  default: /stt-service/v1/async/result
 *  - SMARTVOICE_TTS_PATH         default: /tts-service/v1/standard
 *  - SMARTVOICE_SUMMARY_PATH     default: /eval-emotion-service/v1/conversation/summary
 */
@Injectable()
export class SmartvoiceClient {
  private readonly baseUrl = process.env.SMARTVOICE_BASE_URL ?? '';
  
  // STT credentials
  private readonly sttTokenId = process.env.SMARTVOICE_STT_TOKEN_ID ?? '';
  private readonly sttTokenKey = process.env.SMARTVOICE_STT_TOKEN_KEY ?? '';
  
  // TTS credentials
  private readonly ttsTokenId = process.env.SMARTVOICE_TTS_TOKEN_ID ?? '';
  private readonly ttsTokenKey = process.env.SMARTVOICE_TTS_TOKEN_KEY ?? '';
  
  // Fallback to common credentials if separate ones not provided
  private readonly tokenId = process.env.SMARTVOICE_TOKEN_ID ?? '';
  private readonly tokenKey = process.env.SMARTVOICE_TOKEN_KEY ?? '';

  private readonly sttSyncPath = process.env.SMARTVOICE_STT_SYNC_PATH ?? '/stt-service/v1/standard';
  private readonly sttAsyncPath = process.env.SMARTVOICE_STT_ASYNC_PATH ?? '/stt-service/v1/async/standard';
  private readonly sttResultPath = process.env.SMARTVOICE_STT_RESULT_PATH ?? '/stt-service/v1/async/result';
  private readonly ttsPath = process.env.SMARTVOICE_TTS_PATH ?? '/tts-service/v1/standard';
  private readonly summaryPath =
    process.env.SMARTVOICE_SUMMARY_PATH ?? '/eval-emotion-service/v1/conversation/summary';

  private sttAccessTokenCache: { token: string; expiresAtMs: number } | null = null;
  private ttsAccessTokenCache: { token: string; expiresAtMs: number } | null = null;

  private mustEnv(name: string, value: string) {
    if (!value) throw new Error(`Missing env: ${name}`);
  }

  private buildUrl(path: string) {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  private async getAccessToken(type: 'stt' | 'tts'): Promise<string> {
    // Get type-specific token first, fallback to common token
    const staticToken = type === 'stt' 
      ? (process.env.SMARTVOICE_STT_ACCESS_TOKEN ?? process.env.SMARTVOICE_ACCESS_TOKEN)
      : (process.env.SMARTVOICE_TTS_ACCESS_TOKEN ?? process.env.SMARTVOICE_ACCESS_TOKEN);
    
    if (staticToken) return staticToken;

    // Option B: OAuth
    const oauthUrl = process.env.SMARTVOICE_OAUTH_URL;
    if (!oauthUrl) {
      const envName = type === 'stt' ? 'SMARTVOICE_STT_ACCESS_TOKEN' : 'SMARTVOICE_TTS_ACCESS_TOKEN';
      throw new Error(`Missing ${envName} or SMARTVOICE_ACCESS_TOKEN or SMARTVOICE_OAUTH_URL`);
    }

    const now = Date.now();
    const cache = type === 'stt' ? this.sttAccessTokenCache : this.ttsAccessTokenCache;
    if (cache && cache.expiresAtMs > now + 10_000) {
      return cache.token;
    }

    const clientId = process.env.SMARTVOICE_CLIENT_ID;
    const clientSecret = process.env.SMARTVOICE_CLIENT_SECRET;
    const username = process.env.SMARTVOICE_USERNAME;
    const password = process.env.SMARTVOICE_PASSWORD;

    const params = new URLSearchParams();

    if (clientId && clientSecret) {
      params.set('grant_type', 'client_credentials');
      params.set('client_id', clientId);
      params.set('client_secret', clientSecret);
    } else if (username && password) {
      params.set('grant_type', 'password');
      params.set('username', username);
      params.set('password', password);
    } else {
      throw new Error('Missing OAuth credentials: set client_id/client_secret or username/password');
    }

    const res = await fetch(oauthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`SmartVoice OAuth failed: ${res.status} ${t}`);
    }

    const data: any = await res.json();
    const token = data?.access_token;
    const expiresIn = Number(data?.expires_in ?? 55 * 60);

    if (!token) throw new Error(`OAuth response missing access_token: ${JSON.stringify(data)}`);

    const tokenCache = { token, expiresAtMs: now + expiresIn * 1000 };
    if (type === 'stt') {
      this.sttAccessTokenCache = tokenCache;
    } else {
      this.ttsAccessTokenCache = tokenCache;
    }
    return token;
  }

  private async buildSttHeaders(extra?: Record<string, string>) {
    this.mustEnv('SMARTVOICE_BASE_URL', this.baseUrl);
    
    // Use STT-specific credentials, fallback to common credentials
    const tokenId = this.sttTokenId || this.tokenId;
    const tokenKey = this.sttTokenKey || this.tokenKey;
    
    if (!tokenId) throw new Error('Missing SMARTVOICE_STT_TOKEN_ID or SMARTVOICE_TOKEN_ID');
    if (!tokenKey) throw new Error('Missing SMARTVOICE_STT_TOKEN_KEY or SMARTVOICE_TOKEN_KEY');

    const token = await this.getAccessToken('stt');
    return {
      Authorization: `Bearer ${token}`,
      'Token-id': tokenId,
      'Token-key': tokenKey,
      ...(extra ?? {}),
    };
  }

  private async buildTtsHeaders(extra?: Record<string, string>) {
    this.mustEnv('SMARTVOICE_BASE_URL', this.baseUrl);
    
    // Use TTS-specific credentials, fallback to common credentials
    const tokenId = this.ttsTokenId || this.tokenId;
    const tokenKey = this.ttsTokenKey || this.tokenKey;
    
    if (!tokenId) throw new Error('Missing SMARTVOICE_TTS_TOKEN_ID or SMARTVOICE_TOKEN_ID');
    if (!tokenKey) throw new Error('Missing SMARTVOICE_TTS_TOKEN_KEY or SMARTVOICE_TOKEN_KEY');

    const token = await this.getAccessToken('tts');
    return {
      Authorization: `Bearer ${token}`,
      'Token-id': tokenId,
      'Token-key': tokenKey,
      ...(extra ?? {}),
    };
  }

  /**
   * IMPORTANT: update mapping when you have REAL VNPT response JSON.
   */
  private extractTranscript(payload: any): string {
    return (
      payload?.result?.text ??
      payload?.result?.transcript ??
      payload?.text ??
      payload?.transcript ??
      payload?.data?.text ??
      payload?.data?.transcript ??
      (typeof payload === 'string' ? payload : JSON.stringify(payload))
    );
  }

  async sttSync(audio: Express.Multer.File, options?: any): Promise<string> {
    const url = this.buildUrl(this.sttSyncPath);

    const form = new FormData();
    form.append('audioFile', new Blob([new Uint8Array(audio.buffer)]), audio.originalname || 'audio.wav');

    if (options?.clientSession) form.append('clientSession', String(options.clientSession));
    if (options?.languageCode) form.append('languageCode', String(options.languageCode));
    if (options?.sampleRate) form.append('sampleRate', String(options.sampleRate));

    const headers = await this.buildSttHeaders();
    const res = await fetch(url, { method: 'POST', headers: headers as any, body: form as any });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`SmartVoice STT sync failed: ${res.status} ${t}`);
    }

    const data: any = await res.json().catch(async () => await res.text());
    return this.extractTranscript(data);
  }

  async sttAsync(audio: Express.Multer.File, options?: any): Promise<any> {
    const url = this.buildUrl(this.sttAsyncPath);

    const form = new FormData();
    form.append('audioFile', new Blob([new Uint8Array(audio.buffer)]), audio.originalname || 'audio.wav');
    if (options?.clientSession) form.append('clientSession', String(options.clientSession));
    if (options?.languageCode) form.append('languageCode', String(options.languageCode));

    const headers = await this.buildSttHeaders();
    const res = await fetch(url, { method: 'POST', headers: headers as any, body: form as any });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`SmartVoice STT async failed: ${res.status} ${t}`);
    }

    return await res.json().catch(async () => await res.text());
  }

  async getSttResult(jobId: string): Promise<any> {
    const url = this.buildUrl(this.sttResultPath);
    const headers = await this.buildSttHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(url, {
      method: 'POST',
      headers: headers as any,
      body: JSON.stringify({ jobId }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`SmartVoice STT result failed: ${res.status} ${t}`);
    }

    const data: any = await res.json().catch(async () => await res.text());
    const transcript = this.extractTranscript(data);
    return { ...((typeof data === 'object' && data) || { raw: data }), transcript };
  }

  async tts(body: any): Promise<any> {
    const url = this.buildUrl(this.ttsPath);
    const headers = await this.buildTtsHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(url, {
      method: 'POST',
      headers: headers as any,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`SmartVoice TTS failed: ${res.status} ${t}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return await res.json();

    const buf = Buffer.from(await res.arrayBuffer());
    return { audioBase64: buf.toString('base64') };
  }

  async summary(body: any): Promise<any> {
    const url = this.buildUrl(this.summaryPath);
    const headers = await this.buildTtsHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(url, {
      method: 'POST',
      headers: headers as any,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`SmartVoice summary failed: ${res.status} ${t}`);
    }

    return await res.json().catch(async () => await res.text());
  }
}
