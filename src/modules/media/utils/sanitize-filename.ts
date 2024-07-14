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
  const baseName = parse(filename).name;
  const extension = parse(filename).ext;

  const sanitizedFileName = slugify(baseName, {
    lower: true,
    strict: true, // Removes unsafe character for URLs
  });

  const newFileName = sanitizedFileName.substring(0, 22) + extension.toLowerCase();

  return `${uuid()}-${newFileName}`;
};
