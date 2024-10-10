import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseSetup } from '@app/config/setups/base.setup';

export class BullBoardSetup extends BaseSetup {
  static readonly BULL_BOARD_PATH = '/bull-board';

  constructor(protected readonly app: NestExpressApplication) {
    super(app);
  }

  init(): void {
    const username = this.configService.get('BULL_BOARD_USERNAME');
    const password = this.configService.get('BULL_BOARD_PASSWORD');

    if (username && password) {
      this.logger.log(
        `Access Bull Board at http://localhost:8000${BullBoardSetup.BULL_BOARD_PATH}`,
        BullBoardSetup.name,
      );
      this.protectRouteWithBasicAuth(BullBoardSetup.BULL_BOARD_PATH, username, password);
    }
  }
}
