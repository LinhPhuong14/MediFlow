import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { promisify } from 'util';
import path from 'path';

// Load proto file
const PROTO_PATH = path.join(__dirname, 'vnpt_asr.proto');

// Định nghĩa proto (từ Python code của bạn)
const protoDefinition = `
syntax = "proto3";

package vnpt.asr;

service VnptSpeechRecognition {
  rpc StreamingRecognize(stream StreamingRecognizeRequest) returns (stream StreamingRecognizeResponse);
}

message StreamingRecognizeRequest {
  oneof streaming_request {
    StreamingRecognitionConfig streaming_config = 1;
    bytes audio_content = 2;
  }
}

message StreamingRecognitionConfig {
  RecognitionConfig config = 1;
  bool interim_results = 2;
}

message RecognitionConfig {
  string language_code = 1;
  AudioEncoding encoding = 2;
  int32 sample_rate_hertz = 3;
  int32 max_alternatives = 4;
  bool enable_automatic_punctuation = 5;
}

enum AudioEncoding {
  ENCODING_UNSPECIFIED = 0;
  LINEAR_PCM = 1;
  FLAC = 2;
  MULAW = 3;
  AMR = 4;
  AMR_WB = 5;
  OGG_OPUS = 6;
  SPEEX_WITH_HEADER_BYTE = 7;
}

message StreamingRecognizeResponse {
  repeated SpeechRecognitionResult results = 1;
}

message SpeechRecognitionResult {
  repeated SpeechRecognitionAlternative alternatives = 1;
  bool is_final = 2;
}

message SpeechRecognitionAlternative {
  string transcript = 1;
  float confidence = 2;
}
`;

// Tạo package definition
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

// Hoặc tạo trực tiếp từ string
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const vnptProto = grpc.loadPackageDefinition(packageDef) as any;

export class VNPTGRPCClient {
  private client: any;
  private metadata: grpc.Metadata;

  constructor(
    private server: string = 'api.idg.vnpt.vn:50000',
    private token: string,
    private tokenId: string,
    private tokenKey: string
  ) {
    // Tạo credentials
    const credentials = grpc.credentials.createInsecure();
    
    // Tạo client
    this.client = new vnptProto.vnpt.asr.VnptSpeechRecognition(
      server,
      credentials
    );

    // Tạo metadata
    this.metadata = new grpc.Metadata();
    this.metadata.add('authorization', `bearer ${token}`);
    this.metadata.add('token-id', tokenId);
    this.metadata.add('token-key', tokenKey);
  }

  async streamRecognize(
    audioBuffer: Buffer,
    sampleRate: number = 16000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const call = this.client.StreamingRecognize(this.metadata);
      
      let finalTranscript = '';
      let receivedResults = false;

      // Gửi config đầu tiên
      const config = {
        streaming_config: {
          config: {
            language_code: 'vi-VN',
            encoding: 1, // LINEAR_PCM
            sample_rate_hertz: sampleRate,
            max_alternatives: 1,
            enable_automatic_punctuation: false,
          },
          interim_results: false,
        },
      };

      call.write(config);

      // Gửi audio data
      const CHUNK_SIZE = 1024;
      for (let i = 0; i < audioBuffer.length; i += CHUNK_SIZE) {
        const chunk = audioBuffer.slice(i, i + CHUNK_SIZE);
        call.write({ audio_content: chunk });
      }

      call.end();

      // Nhận responses
      call.on('data', (response: any) => {
        receivedResults = true;
        
        if (response.results && response.results.length > 0) {
          for (const result of response.results) {
            if (result.alternatives && result.alternatives.length > 0) {
              const transcript = result.alternatives[0].transcript;
              
              if (result.is_final) {
                finalTranscript += transcript + ' ';
              }
            }
          }
        }
      });

      call.on('end', () => {
        if (!receivedResults) {
          reject(new Error('No results received from VNPT STT'));
        } else {
          resolve(finalTranscript.trim());
        }
      });

      call.on('error', (error: Error) => {
        reject(error);
      });
    });
  }
}