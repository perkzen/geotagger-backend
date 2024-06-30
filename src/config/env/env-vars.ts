import { z } from 'zod';
import { Environment } from '@app/config/env/env-enum';

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment),
  PORT: z.coerce.number().int().positive(),
  SWAGGER_PATH: z.string().optional().default('docs'),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
