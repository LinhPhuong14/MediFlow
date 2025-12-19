import { Injectable } from '@nestjs/common';
import { EncryptedPayload } from '../security/crypto.service';

@Injectable()
export class IntakeRepository {
    // Mock DB: Stores only encrypted payloads
    private storage: EncryptedPayload[] = [];

    async save(data: EncryptedPayload): Promise<void> {
        this.storage.push(data);
        console.log('Saved encrypted record:', data);
    }

    async getAll(): Promise<EncryptedPayload[]> {
        return this.storage;
    }
}
