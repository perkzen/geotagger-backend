import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsPositive, IsUrl } from 'class-validator';
import { MediaDto } from '@app/modules/media/dtos/media.dto';
import { UserDto } from '@app/modules/users/dtos/user.dto';

export class UserProfileDto extends UserDto {
  /**
   * The user's profile image URL provider by social login.
   */
  @ApiProperty({ description: "The user's profile image URL provider by social login." })
  @IsUrl()
  @Expose()
  imageUrl: string | null;

  @ApiProperty()
  @Expose()
  @IsPositive()
  points: number;

  @ApiProperty({
    enum: Provider,
  })
  @IsEnum(Provider)
  @Expose()
  provider: Provider;

  @ApiProperty()
  @Expose()
  @Type(() => MediaDto)
  media: MediaDto | null;
}
