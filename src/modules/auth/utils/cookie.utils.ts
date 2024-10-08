import { CookieOptions } from 'express';
import { isProdEnv } from '@app/common/utils/env-check';

export const cookieOptions: CookieOptions = {
  httpOnly: false,
  secure: isProdEnv(),
  sameSite: 'strict',
};
