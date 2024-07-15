import { parse } from 'path';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';

/**
 * Sanitizes a file name by removing unsafe characters and truncating it to a maximum of 64 characters.
 * - 36 for UUIDv4
 * - 1 for the dash (-)
 * - 1 for the dot (.) before the file extension
 * - 4 (or 3) for the file extension
 * - leaves us with 22 (64-36-1-1-4) for the subset of original file name.
 *
 * @param filename - The original file name.
 */
export const sanitizeFilename = (filename: string): string => {
  const { name, ext } = parse(filename);

  const sanitizedFilename = slugify(name, {
    lower: true,
    strict: true,
  });

  const newFilename = sanitizedFilename.substring(0, 22) + ext.toLowerCase();

  return `${uuid()}-${newFilename}`;
};
