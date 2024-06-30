import { z } from 'zod';
import { Environment } from '@app/config/env/env-enum';

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment),
  PORT: z.coerce.number().int().positive(),
  SWAGGER_PATH: z.string().default('docs'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('secret'),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('1d'),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string().default('7d'),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
