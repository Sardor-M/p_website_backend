import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  //private readonly logger = new Logger(HealthController.name);

  @Get()
  check() {
    // Return a simple response without logging
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}