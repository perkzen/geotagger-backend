import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { InjectS3Client } from '@app/modules/aws/s3/utils/inject-s3-client';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly bucketName: string;

  constructor(
    @InjectS3Client()
    private readonly client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
  }

  async putObject(key: string, body: Buffer, mimeType: string): Promise<string> {
    this.logger.log(`Uploading object ${key} to S3 bucket: ${this.bucketName}`);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: mimeType,
    });

    await this.client.send(command);

    return key;
  }

  async deleteObject(key: string): Promise<DeleteObjectCommandOutput> {
    this.logger.log(`Deleting object ${key} from S3 bucket: ${this.bucketName}`);
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return this.client.send(command);
  }

  async getObjectUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.client, command);
  }

  async getUploadUrl(
    ownerId: string,
    {
      key,
      mimeType,
      bucketPath,
    }: {
      key: string;
      mimeType: string;
      bucketPath: BucketPath;
    },
  ) {
    this.logger.log(`Generating signed URL for upload to S3 bucket: ${this.bucketName}, key: ${key}`);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
      Metadata: {
        ownerid: ownerId,
        bucketpath: bucketPath,
      },
    });

    return await getSignedUrl(this.client, command, { expiresIn: 60 });
  }

  async getObject(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return this.client.send(command);
  }
}
