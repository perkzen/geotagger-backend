import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, Min } from 'class-validator';

export class CreateGuessDto {
  @ApiProperty()
  @IsLatitude()
  lat: number;

  @ApiProperty()
  @IsLongitude()
  lng: number;
}
