import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const getS3Client = (configService: ConfigService): S3Client => {
  return new S3Client({
    region: configService.get('AWS_S3_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });
};
