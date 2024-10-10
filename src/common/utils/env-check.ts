import { NodeEnv } from '@app/config/env/enum/node-env.enum';

export const isProdEnv = (): boolean => process.env.NODE_ENV === NodeEnv.PRODUCTION;
export const isDevEnv = (): boolean => process.env.NODE_ENV === NodeEnv.DEVELOPMENT;
export const isTestEnv = (): boolean => process.env.NODE_ENV === NodeEnv.TEST;
