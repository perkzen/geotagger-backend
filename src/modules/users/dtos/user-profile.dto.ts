import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsEnum, IsUrl } from 'class-validator';
import { UserDto } from '@app/modules/users/dtos/user.dto';

export class UserProfileDto extends UserDto {
  @ApiProperty()
  @IsUrl()
  @Expose()
  imageUrl: string | null;

  @ApiProperty({
    enum: Provider,
  })
  @IsEnum(Provider)
  @Expose()
  provider: Provider;
}
