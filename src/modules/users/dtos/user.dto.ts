import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { Role } from '@app/modules/auth/enums/role.enum';

export class UserDto {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  email: string;

  @ApiProperty()
  @IsString()
  @Expose()
  firstname: string;

  @ApiProperty()
  @IsString()
  @Expose()
  lastname: string;

  @ApiProperty({
    enum: Role,
  })
  @IsEnum(Role)
  @Expose()
  role: Role;
}
