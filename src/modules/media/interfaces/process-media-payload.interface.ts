import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';

export interface ProcessMediaPayload {
  key: string;
  bucket: BucketPath;
}
