export const unknownToBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return false;
};
