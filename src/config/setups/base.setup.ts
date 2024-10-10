import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import basicAuth from 'express-basic-auth';

export abstract class BaseSetup<SetupConfig = undefined> {
  protected configService: ConfigService;
  protected logger: Logger;

  protected constructor(protected readonly app: NestExpressApplication) {
    this.configService = app.get(ConfigService);
    this.logger = new Logger(this.constructor.name);
  }

  abstract init(setupConfig?: SetupConfig): void | Promise<void>;

  protected protectRouteWithBasicAuth(path: string, username: string, password: string): void {
    this.logger.log(`Protecting route ${path} with basic auth`);
    this.app.use([`${path}`], basicAuth({ challenge: true, users: { [username]: password } }));
  }
}
