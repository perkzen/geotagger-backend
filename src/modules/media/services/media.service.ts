import { Injectable, Logger } from '@nestjs/common';
import { Media } from '@prisma/client';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { MediaRepository } from '@app/modules/media/repositories/media.repository';
import { sanitizeFilename } from '@app/modules/media/utils/sanitize-filename';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async uploadMedia(file: Express.Multer.File, userId: string, bucketPath: BucketPath): Promise<Media> {
    this.logger.log(
      `User (${userId}) is attempting to uploading media file (${file.originalname}) to bucket (${bucketPath})`,
    );

    // https://github.com/expressjs/multer/issues/1104#issuecomment-1152987772 -> multer doesn't support utf8 filenames
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const filename = sanitizeFilename(file.originalname);
    const key = `${bucketPath}/${userId}/${filename}`;

    const objectKey = await this.awsS3Service.putObject(key, file.buffer, file.mimetype);

    const media = this.mediaRepository.createOrUpdate({
      key: objectKey,
      mimeType: file.mimetype,
      filename,
      userId,
    });

    this.logger.log(
      `User (${userId}) uploaded media file (${file.originalname}) to bucket (${bucketPath}) successfully`,
    );

    return media;
  }

  async deleteMedia(mediaId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete media (${mediaId}) from database and S3 storage`);

    try {
      return await this.mediaRepository.transaction(async (db) => {
        const media = await this.mediaRepository.findOneOrFail(mediaId);
        await this.awsS3Service.deleteObject(media.key);

        await db.media.delete({
          where: {
            id: mediaId,
          },
        });

        this.logger.log(`Media (${mediaId}) deleted from database and S3 storage`);
        return true;
      });
    } catch (error) {
      this.logger.error({ error }, `Failed to delete media (${mediaId}) from database and S3 storage`);
      return false;
    }
  }

  async getMediaUrl(key: string): Promise<string> {
    return this.awsS3Service.getObjectUrl(key);
  }
}
