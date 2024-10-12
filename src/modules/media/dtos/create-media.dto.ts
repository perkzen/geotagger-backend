import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { MimeType } from '@app/common/enums/mime-type.enum';

export class CreateMediaDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsEnum(MimeType)
  mimeType: MimeType;
}
