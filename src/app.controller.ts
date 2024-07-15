import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/modules/auth/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    description: 'Health check response',
    schema: { example: { status: 'ok', timestamp: 'Tue, 01 Jan 2022 00:00:00 GMT', environment: 'development' } },
  })
  getHealth() {
    return this.appService.healthCheck();
  }
}
