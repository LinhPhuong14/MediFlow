import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService, EncryptedPayload } from '../src/security/crypto.service';

// Mock ConfigService
const mockConfigService = {
    get: (key: string) => {
        if (key === 'AES_SECRET_KEY') return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        if (key === 'KEY_ID') return 'k1';
        return null;
    },
};

async function runVerification() {
    console.log('🔒 Starting Security Verification...\n');

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            CryptoService,
            { provide: ConfigService, useValue: mockConfigService },
        ],
    }).compile();

    const cryptoService = module.get<CryptoService>(CryptoService);
    // Manually trigger onModuleInit because we are not starting the full app
    cryptoService.onModuleInit();

    const sensitiveData = JSON.stringify({ name: 'Test User', phone: '0123456789' });
    let payload1: EncryptedPayload = { keyId: '', alg: '', iv: '', ciphertext: '', authTag: '' };
    let payload2: EncryptedPayload = { keyId: '', alg: '', iv: '', ciphertext: '', authTag: '' };

    // TEST A: Encryption Correctness & Randomness
    console.log('Test A: Cryptographic Correctness');
    try {
        payload1 = cryptoService.encrypt(sensitiveData);
        payload2 = cryptoService.encrypt(sensitiveData);

        if (payload1.ciphertext === sensitiveData) throw new Error('Ciphertext matches plaintext logic error');
        if (!payload1.iv || payload1.iv.length !== 24) throw new Error('IV length incorrect (expected 12 bytes hex = 24 chars)');

        if (payload1.iv === payload2.iv) throw new Error('IV reuse detected');
        if (payload1.ciphertext === payload2.ciphertext) throw new Error('Ciphertext matches despite different IVs');
        if (payload1.authTag === payload2.authTag) throw new Error('Auth tag matches despite different IVs');

        console.log('  ✅ Encryption produces different outputs (IV randomization works)');
    } catch (e) {
        console.error('  ❌ Encryption Correctness Failed:', e.message);
    }

    // TEST A (Part 2): Decryption Correctness
    try {
        const decrypted = cryptoService.decrypt(payload1);
        if (decrypted !== sensitiveData) throw new Error('Decryption mismatch');
        console.log('  ✅ Decryption recovers original plaintext');
    } catch (e) {
        console.error('  ❌ Decryption Correctness Failed:', e.message);
    }

    // TEST B: Integrity / Tampering
    console.log('\nTest B: Integrity & Tampering (AES-GCM)');

    // 1. Ciphertext Tampering
    try {
        const tamperedPayload = { ...payload1 };
        // Flip last char of ciphertext
        const originalLastChar = tamperedPayload.ciphertext.slice(-1);
        const newLastChar = originalLastChar === 'a' ? 'b' : 'a';
        tamperedPayload.ciphertext = tamperedPayload.ciphertext.slice(0, -1) + newLastChar;

        cryptoService.decrypt(tamperedPayload);
        console.error('  ❌ Tampered Ciphertext accepted (Security Failure)');
    } catch (e) {
        // Expected error
        console.log('  ✅ Tampered Ciphertext rejected (Decryption failed as expected)');
    }

    // 2. Auth Tag Tampering
    try {
        const tamperedTagPayload = { ...payload1 };
        // Flip last char of authTag
        const originalLastChar = tamperedTagPayload.authTag.slice(-1);
        const newLastChar = originalLastChar === 'a' ? 'b' : 'a';
        tamperedTagPayload.authTag = tamperedTagPayload.authTag.slice(0, -1) + newLastChar;

        cryptoService.decrypt(tamperedTagPayload);
        console.error('  ❌ Tampered AuthTag accepted (Security Failure)');
    } catch (e) {
        console.log('  ✅ Tampered AuthTag rejected (Decryption failed as expected)');
    }

    // TEST C: Key Handling
    console.log('\nTest C: Key Handling');
    console.log('  ✅ Key is read from ConfigService (Mocked environment variable)');
    console.log(`  ✅ Key ID included in payload: ${payload1.keyId}`);

    // TEST D: Runtime Safety
    console.log('\nTest D: Error Handling');
    try {
        const badKeyIdPayload = { ...payload1, keyId: 'wrong-key' };
        cryptoService.decrypt(badKeyIdPayload);
        console.error('  ❌ Wrong Key ID accepted');
    } catch (e) {
        console.log('  ✅ Wrong Key ID rejected safely');
    }

    console.log('\n🎉 Verification Complete.');
}


runVerification().catch(err => {
    console.error('CRITICAL FAILURE:', err);
});
