import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntakeModule } from './intake/intake.module';
import { RoutingModule } from './routing/routing.module';
import { MedivoiceModule } from './medivoice/medivoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    IntakeModule,
    RoutingModule,
    MedivoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
