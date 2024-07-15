import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class UnsupportedAuthProviderException extends UnauthorizedException {
  constructor() {
    super('Unsupported authentication provider');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: AuthErrorCode.UNSUPPORTED_AUTH_PROVIDER,
    };
  }
}
