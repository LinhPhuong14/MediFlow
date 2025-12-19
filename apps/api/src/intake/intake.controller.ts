import { Body, Controller, Post } from '@nestjs/common';
import { IntakeService, PatientIntakeDto } from './intake.service';

@Controller('intake')
export class IntakeController {
    constructor(private readonly intakeService: IntakeService) { }

    @Post('secure-demo')
    async secureDemo(@Body() body: PatientIntakeDto) {
        return this.intakeService.processSecureIntake(body);
    }
}
