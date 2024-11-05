import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Media, Prisma } from '@prisma/client';
import { MimeType } from '@app/common/enums/mime-type.enum';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { CreateMediaDto } from '@app/modules/media/dtos/create-media.dto';
import { CreateUploadUrlDto } from '@app/modules/media/dtos/create-upload-url.dto';
import { MediaEventName } from '@app/modules/media/enums/media-event-name.enum';
import { MediaUploadedEvent } from '@app/modules/media/events/media-uploaded.event';
import { FailedUploadException } from '@app/modules/media/exceptions/failed-upload.exception';
import { MissingMetadataException } from '@app/modules/media/exceptions/missing-metadata.exception';
import { ProcessMediaPayload } from '@app/modules/media/interfaces/process-media-payload.interface';
import { MediaRepository } from '@app/modules/media/repositories/media.repository';
import { sanitizeFilename } from '@app/modules/media/utils/sanitize-filename';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly s3: AwsS3Service,
    private readonly mediaRepository: MediaRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Uploads a media file to S3 and creates a new media record in the database.
   */
  async upload(file: Express.Multer.File, bucketPath: BucketPath): Promise<Media> {
    this.logger.log(`Attempting to uploading media file (${file.originalname}) to bucket (${bucketPath})`);

    // https://github.com/expressjs/multer/issues/1104#issuecomment-1152987772 -> multer doesn't support utf8 filenames
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const filename = sanitizeFilename(file.originalname);
    const key = `${bucketPath}/${filename}`;

    const objectKey = await this.s3.putObject(key, file.buffer, file.mimetype);

    try {
      const media = this.mediaRepository.createOrUpdate({
        key: objectKey,
        mimeType: file.mimetype as MimeType,
        filename,
      });

      this.logger.log(`Uploaded media file (${file.originalname}) to bucket (${bucketPath}) successfully`);

      return media;
    } catch (error) {
      this.logger.error({ error }, `Failed to upload media file (${file.originalname}) to bucket (${bucketPath})`);
      await this.s3.deleteObject(objectKey);
      throw new FailedUploadException();
    }
  }

  async create(data: CreateMediaDto, tx?: Prisma.TransactionClient) {
    return this.mediaRepository.create(data, tx);
  }

  async delete(mediaId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    this.logger.log(`Attempting to delete media (${mediaId}) from database and S3 storage`);

    if (tx) {
      const media = await this.mediaRepository.findOneOrFail(mediaId);

      await tx.media.delete({
        where: {
          id: mediaId,
        },
      });

      await this.s3.deleteObject(media.key);
      this.logger.log(`Media (${mediaId}) deleted from database and S3 storage`);
      return true;
    }

    try {
      return await this.mediaRepository.transaction(async (db) => {
        const media = await this.mediaRepository.findOneOrFail(mediaId);
        await db.media.delete({
          where: {
            id: mediaId,
          },
        });
        await this.s3.deleteObject(media.key);
        this.logger.log(`Media (${mediaId}) deleted from database and S3 storage`);
        return true;
      });
    } catch (error) {
      this.logger.error({ error }, `Failed to delete media (${mediaId}) from database and S3 storage`);
      return false;
    }
  }

  /**
   * Returns a signed URL for the media file.
   * @param key
   */
  async getMediaUrl(key: string): Promise<string> {
    return this.s3.getObjectUrl(key);
  }

  /**
   * Generates a signed URL for uploading a file to S3.
   *
   * You need to implement file validation in S3 bucket rules to
   * prevent malicious files from being uploaded.
   *
   */
  async getUploadUrl({ originalFilename, bucketPath, mimeType, ownerId }: CreateUploadUrlDto): Promise<string> {
    const filename = sanitizeFilename(originalFilename);

    const key = `${bucketPath}/${filename}`;

    return this.s3.getUploadUrl(ownerId, { key, mimeType, bucketPath });
  }

  async processUpload({ key }: ProcessMediaPayload) {
    const object = await this.s3.getObject(key);
    const filename = key.split('/').pop();
    const mimeType = `image/${filename.split('.')?.pop() ?? '*'} ` as MimeType;
    const ownerId = object.Metadata['ownerid'];
    const bucketPath = object.Metadata['bucketpath'] as BucketPath;

    if (!ownerId) {
      throw new MissingMetadataException('ownerid');
    }

    if (!bucketPath) {
      throw new MissingMetadataException('bucketpath');
    }

    if (bucketPath === BucketPath.PROFILE_IMAGES) {
      this.eventEmitter.emit(
        MediaEventName.PROFILE_IMAGE_UPLOADED,
        new MediaUploadedEvent({
          key,
          filename,
          mimeType,
          ownerId,
        }),
      );
    }

    if (bucketPath === BucketPath.LOCATIONS_IMAGES) {
      this.eventEmitter.emit(
        MediaEventName.LOCATION_IMAGE_UPLOADED,
        new MediaUploadedEvent({
          key,
          filename,
          mimeType,
          ownerId,
        }),
      );
    }
  }
}
