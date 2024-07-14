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
import { InjectS3Client } from '@app/modules/aws/s3/utils/inject-s3-client';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    @InjectS3Client()
    private readonly client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
    this.region = this.configService.getOrThrow('AWS_S3_REGION');
  }

  async putObject(key: string, body: Buffer, mimeType: string): Promise<string> {
    this.logger.log(`Uploading object ${key} to S3 bucket: ${this.bucketName}`);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: mimeType,
    });

    const res = await this.client.send(command);

    console.log(res);
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
}
