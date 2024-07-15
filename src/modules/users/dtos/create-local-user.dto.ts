import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

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
  firstname: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  lastname: string;
}
