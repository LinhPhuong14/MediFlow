import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';
import { IntakeRepository } from './intake.repository';

@Module({
    imports: [SecurityModule],
    controllers: [IntakeController],
    providers: [IntakeService, IntakeRepository],
})
export class IntakeModule { }
