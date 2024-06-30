import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toUTCString(),
      environment: this.configService.get('NODE_ENV'),
    };
  }
}
