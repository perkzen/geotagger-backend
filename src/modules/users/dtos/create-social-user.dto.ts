import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { IsEmail, IsEnum, IsString, IsUrl } from 'class-validator';

export class CreateSocialUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
  @IsEnum(Provider)
  provider: Provider;
}
