import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsString, ValidateNested } from 'class-validator';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';

class UserDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsString()
  firstname: string;

  @ApiProperty()
  @Expose()
  @IsString()
  lastname: string;

  @ApiProperty()
  @Expose()
  @IsString()
  imageUrl: string;
}

class GuessDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsString()
  distanceText: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ type: UserDto, description: 'User who made the guess' })
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}

export class LocationDetailsDto extends LocationDto {
  @ApiProperty({ type: [GuessDto], description: 'List of guesses associated with the location' })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuessDto)
  guesses: GuessDto[];
}
