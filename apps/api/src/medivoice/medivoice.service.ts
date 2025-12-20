import { Injectable } from '@nestjs/common';

@Injectable()
export class MedivoiceService {
  async makeErmDraft(transcript: string, lang: 'vi' | 'en' = 'vi', patient?: any) {
    return {
      patient_info: {
        age: patient?.age ?? null,
        gender: patient?.gender ?? null,
        nationality: patient?.nationality ?? null,
      },
      transcript,
      chief_complaint: 'Chưa xác định (AI cần thêm thông tin)',
      hpi: {
        duration: null,
        symptoms: [],
        negative_symptoms: [],
        description: transcript.slice(0, 300),
      },
      past_medical_history: {
        chronic_diseases: [],
        allergies: [],
        current_medications: [],
      },
      assessment: [],
      plan: {
        tests: [],
        medications: [],
        advice: [],
      },
      missing_fields: ['Tuổi', 'Giới', 'Lý do vào khám', 'Tiền sử', 'Dị ứng thuốc'],
      confidence: 0.5,
      note: 'Bản nháp do AI tạo – cần bác sĩ review trước khi lưu (hackathon MVP)',
      lang,
    };
  }
}
