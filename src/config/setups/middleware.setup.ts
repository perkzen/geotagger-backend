import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { BaseSetup } from '@app/config/setups/base.setup';

export class MiddlewareSetup extends BaseSetup {
  constructor(protected readonly app: NestExpressApplication) {
    super(app);
  }

  init(): void | Promise<void> {
    this.setupHelmet();
    this.setupCors();
    this.setupCompression();
    this.setupPipes();
    this.setupFilters();
    this.setupInterceptors();
    this.setupShutdownHooks();
    this.setupCookieParser();
    this.logger.log('Middleware setup completed!');
  }

  private setupHelmet() {
    this.app.use(helmet());
  }

  private setupCors() {
    this.app.enableCors({ origin: this.configService.getOrThrow('FRONTEND_URL'), credentials: true });
  }

  private setupCompression() {
    this.app.use(compression());
  }

  private setupPipes() {
    this.app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  }

  private setupFilters() {
    const adapterHost = this.app.get(HttpAdapterHost);
    this.app.useGlobalFilters(new HttpExceptionFilter(adapterHost));
  }

  private setupInterceptors() {
    this.app.useGlobalInterceptors(new LoggingInterceptor());
  }

  private setupShutdownHooks(): void {
    this.app.enableShutdownHooks();
  }

  private setupCookieParser() {
    this.app.use(cookieParser());
  }
}
