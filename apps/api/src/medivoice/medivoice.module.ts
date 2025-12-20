import { Module } from '@nestjs/common';
import { MedivoiceController } from './medivoice.controller';
import { MedivoiceService } from './medivoice.service';
import { SmartvoiceClient } from './smartvoice.client';

@Module({
  controllers: [MedivoiceController],
  providers: [MedivoiceService, SmartvoiceClient],
  exports: [MedivoiceService, SmartvoiceClient],
})
export class MedivoiceModule {}
