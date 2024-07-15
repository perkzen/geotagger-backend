import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseLocationDto } from '@app/modules/locations/dtos/base-location.dto';

/**
 * This type is only used for Swagger documentation
 */
export class CreateLocationSwaggerDto extends BaseLocationDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  image: Express.Multer.File;
}

export class CreateLocationDto extends BaseLocationDto {}
