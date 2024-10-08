import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isProdEnv } from '@app/common/utils/env-check';
import { BaseSetup } from '@app/config/setups/base.setup';
import { AUTH_COOKIE_NAME } from '@app/modules/auth/constants/auth.constants';

export class SwaggerSetup extends BaseSetup {
  constructor(readonly app: NestExpressApplication) {
    super(app);
  }

  init(): void {
    if (isProdEnv()) {
      this.logger.log('Prod environment detected, skipping Swagger docs init');
      return;
    }

    SwaggerModule.setup(this.configService.getOrThrow('SWAGGER_PATH'), this.app, this.createDocument());
    this.logger.log('Swagger setup completed!');
  }

  private createDocument() {
    const config = new DocumentBuilder()
      .setTitle('Geotagger REST API')
      .setDescription('Web application for geotagging photos and sharing them with friends.')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth(AUTH_COOKIE_NAME, {
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      })
      .build();

    return SwaggerModule.createDocument(this.app, config);
  }
}
