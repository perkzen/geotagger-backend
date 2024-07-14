import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ImageDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;
}
