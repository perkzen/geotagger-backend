import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWS_S3_CLIENT } from '@app/modules/aws/aws.constants';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { getS3Client } from '@app/modules/aws/s3/utils/get-s3-client';

@Module({
  imports: [],
  providers: [
    AwsS3Service,
    {
      inject: [ConfigService],
      provide: AWS_S3_CLIENT,
      useFactory: async (configService: ConfigService): Promise<S3Client> => getS3Client(configService),
    },
  ],
  exports: [AwsS3Service],
})
export class AwsModule {}
