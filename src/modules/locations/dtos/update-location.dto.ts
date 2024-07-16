import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseLocationDto } from '@app/modules/locations/dtos/base-location.dto';

export class UpdateLocationDto extends PartialType(BaseLocationDto) {}

export class UpdateLocationSwaggerDto extends UpdateLocationDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  image: Express.Multer.File;
}
