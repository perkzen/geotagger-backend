import { Controller, Get } from '@nestjs/common';
import { Public } from '@app/modules/auth/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('/health')
  getHealth() {
    return this.appService.healthCheck();
  }
}
