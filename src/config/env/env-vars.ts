import { z } from 'zod';
import { NodeEnv } from '@app/config/env/enum/node-env.enum';
import { unknownToBoolean } from '@app/config/env/utils/preprocess';

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().int().positive(),
  SWAGGER_PATH: z.string().default('docs'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('secret'),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('1d'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  FACEBOOK_CLIENT_ID: z.string(),
  FACEBOOK_CLIENT_SECRET: z.string(),
  FACEBOOK_CALLBACK_URL: z.string(),
  AWS_S3_REGION: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  AUTH_CALLBACK_URL: z.string().default('http://localhost:3000'),
  PINO_LOG_LEVEL: z.string().default('debug'),
  PINO_LOG_REQUESTS: z.preprocess(unknownToBoolean, z.boolean()).default(true),
  PINO_QUIET_REQ: z.preprocess(unknownToBoolean, z.boolean()).default(true),
  PINO_ENABLE_PRETTY_PRINT: z.preprocess(unknownToBoolean, z.boolean()).default(true),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
