import { EnvironmentVariables, environmentVariablesSchema } from '@app/config/env/env-vars';

export function validateEnv(envConfig: Record<string, unknown>): EnvironmentVariables {
  const parseResult = environmentVariablesSchema.safeParse(envConfig);

  if (!parseResult.success) {
    throw new Error('Configuration validation error: ' + JSON.stringify(parseResult.error.format()));
  }

  return parseResult.data;
}
