import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntakeModule } from './intake/intake.module';
import { RoutingModule } from './routing/routing.module';
import { MedivoiceModule } from './medivoice/medivoice.module';

@Module({
  imports: [IntakeModule, RoutingModule, MedivoiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
