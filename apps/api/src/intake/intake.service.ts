import { Injectable } from '@nestjs/common';
import { CryptoService, EncryptedPayload } from '../security/crypto.service';
import { IntakeRepository } from './intake.repository';

export interface PatientIntakeDto {
    name: string;
    phone: string;
    address: string;
    symptom: string;
}

@Injectable()
export class IntakeService {
    constructor(
        private cryptoService: CryptoService,
        private intakeRepository: IntakeRepository,
    ) { }

    async processSecureIntake(data: PatientIntakeDto) {
        // 1. Identify sensitive data to encrypt (Whole object for MVP simplicity)
        const sensitiveJson = JSON.stringify(data);

        // 2. Encrypt
        const encryptedPayload = this.cryptoService.encrypt(sensitiveJson);

        // 3. Store encrypted only
        await this.intakeRepository.save(encryptedPayload);

        // 4. Decrypt for demo response verification
        const decryptedJson = this.cryptoService.decrypt(encryptedPayload);
        const decryptedData = JSON.parse(decryptedJson);

        return {
            original: data,
            encrypted: encryptedPayload,
            decrypted: decryptedData,
        };
    }
}
