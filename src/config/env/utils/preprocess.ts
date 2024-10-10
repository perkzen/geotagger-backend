import { z } from 'zod';

export const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value === 'true';
  }
  return value;
}, z.boolean());
