import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';

class GuessDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  displayName: string;

  @ApiProperty()
  @Expose()
  imageUrl: string;

  @ApiProperty()
  @Expose()
  distance: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

export class LocationDetailsDto extends LocationDto {
  @ApiProperty()
  @Expose()
  @IsArray()
  guesses: GuessDto[];
}
