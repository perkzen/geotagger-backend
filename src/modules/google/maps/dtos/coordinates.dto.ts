import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CoordinatesDto {
  @ApiProperty()
  @Expose()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  lng: number;
}
