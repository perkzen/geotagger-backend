import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class CreateLocalUserDto {
  @ApiProperty({
    example: 'test@test.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'John',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  firstname: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  lastname: string;
}
