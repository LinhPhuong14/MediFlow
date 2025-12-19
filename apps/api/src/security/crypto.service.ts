import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptedPayload {
    keyId: string;
    alg: string;
    iv: string;
    ciphertext: string;
    authTag: string;
}

@Injectable()
export class CryptoService implements OnModuleInit {
    private readonly algorithm = 'aes-256-gcm';
    private key: Buffer;
    private keyId: string;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const keyHex = this.configService.get<string>('AES_SECRET_KEY');
        this.keyId = this.configService.get<string>('KEY_ID') || '';

        if (!keyHex || !this.keyId) {
            throw new Error('Missing AES_SECRET_KEY or KEY_ID in environment variables');
        }

        if (keyHex.length !== 64) {
            throw new Error('AES_SECRET_KEY must be 32 bytes (64 hex characters)');
        }

        this.key = Buffer.from(keyHex, 'hex');
    }

    encrypt(plaintext: string): EncryptedPayload {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        return {
            keyId: this.keyId,
            alg: 'AES-256-GCM',
            iv: iv.toString('hex'),
            ciphertext: encrypted,
            authTag: authTag,
        };
    }

    decrypt(payload: EncryptedPayload): string {
        if (payload.keyId !== this.keyId) {
            throw new Error(`Unknown Key ID: ${payload.keyId}`);
        }

        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(payload.iv, 'hex'),
        );

        decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

        let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
