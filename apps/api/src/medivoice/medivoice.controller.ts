import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MedivoiceService } from './medivoice.service';
import { SmartvoiceClient } from './smartvoice.client';

@Controller('medivoice')
export class MedivoiceController {
  constructor(
    private readonly medivoice: MedivoiceService,
    private readonly smartvoice: SmartvoiceClient,
  ) {}

  /**
   * 1) STT only (SmartVoice) - upload audio -> transcript
   * POST /medivoice/stt?mode=sync|async
   * form-data: audio=<file>
   */
  @Post('stt')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async stt(
    @UploadedFile() audio?: Express.Multer.File,
    @Query('mode') mode: 'sync' | 'async' = 'sync',
    @Body() body?: any,
  ) {
    if (!audio?.buffer?.length) {
      throw new BadRequestException('Missing audio file. Use form-data field name "audio".');
    }

    // Validate mode
    if (mode !== 'sync' && mode !== 'async') {
      throw new BadRequestException('Invalid mode. Use "sync" or "async"');
    }

    if (mode === 'async') {
      return this.smartvoice.sttAsync(audio, body);
    }

    const transcript = await this.smartvoice.sttSync(audio, body);
    return { transcript };
  }

  /**
   * 2) Get async STT result (optional)
   * GET /medivoice/stt/result/:jobId
   */
  @Get('stt/result/:jobId')
  async sttResult(@Param('jobId') jobId: string) {
    if (!jobId || jobId.trim().length === 0) {
      throw new BadRequestException('Missing or invalid jobId parameter');
    }
    return this.smartvoice.getSttResult(jobId);
  }

  /**
   * 3) ERM draft from transcript
   * POST /medivoice/draft
   * body: { transcript: string, lang?: 'vi'|'en', patient?: {...} }
   */
  @Post('draft')
  async draft(@Body() body: any) {
    const transcript = body?.transcript;
    if (!transcript || typeof transcript !== 'string') {
      throw new BadRequestException('Missing body.transcript (string)');
    }
    return this.medivoice.makeErmDraft(transcript, body?.lang ?? 'vi', body?.patient);
  }

  /**
   * 4) ONE-SHOT: audio -> STT -> ERM draft (best for frontend)
   * POST /medivoice/draft-from-audio
   * form-data: audio=<file>
   */
  @Post('draft-from-audio')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async draftFromAudio(@UploadedFile() audio?: Express.Multer.File, @Body() body?: any) {
    if (!audio?.buffer?.length) {
      throw new BadRequestException('Missing audio file. Use form-data field name "audio".');
    }
    const transcript = await this.smartvoice.sttSync(audio, body);
    const draft = await this.medivoice.makeErmDraft(transcript, body?.lang ?? 'vi', body?.patient);
    return { ...draft, transcript };
  }

  /**
   * 5) TTS (Text-to-Speech)
   * POST /medivoice/tts
   * body: {
   *   text: string (required),
   *   text_split?: boolean,
   *   model?: string,
   *   speed?: string,
   *   region?: string
   * }
   */
  @Post('tts')
  async tts(@Body() body: any) {
    if (!body?.text || typeof body.text !== 'string') {
      throw new BadRequestException('Missing body.text (string)');
    }
    
    // Format body theo API VNPT SmartVoice
    const ttsBody = {
      text: body.text,
      text_split: body.text_split ?? false,
      model: body.model ?? 'books',
      speed: body.speed ?? '1',
      region: body.region ?? 'female_north_ngochoa',
    };
    
    return this.smartvoice.tts(ttsBody);
  }

  /**
   * 6) Optional: conversation summary
   * POST /medivoice/summary
   */
  @Post('summary')
  async summary(@Body() body: any) {
    if (!body?.text || typeof body.text !== 'string') {
      throw new BadRequestException('Missing body.text (string)');
    }
    return this.smartvoice.summary(body);
  }
}
