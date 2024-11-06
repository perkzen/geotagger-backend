import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMimeType, IsString } from 'class-validator';
import { MimeType } from '@app/common/enums/mime-type.enum';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';

export class CreateUploadUrlDto {
  @ApiProperty({
    enum: BucketPath,
  })
  @IsEnum(BucketPath)
  bucketPath: BucketPath;

  @ApiProperty()
  @IsString()
  originalFilename: string;

  @ApiProperty({
    enum: MimeType,
  })
  @IsMimeType()
  mimeType: MimeType;

  @ApiProperty({
    description: ' OwnerId represent who is the owner of the file. Example it could be a location or a user',
  })
  @IsString()
  ownerId: string;
}
