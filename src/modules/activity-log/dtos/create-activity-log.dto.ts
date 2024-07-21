import { ApiProperty } from '@nestjs/swagger';
import { Action, ComponentType } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty({
    enum: Action,
  })
  @Expose()
  @IsEnum(Action)
  action: Action;

  @ApiProperty({
    enum: ComponentType,
  })
  @Expose()
  @IsEnum(ComponentType)
  componentType: ComponentType | null;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @Expose()
  value: string | null;

  @ApiProperty()
  @IsString()
  @Expose()
  location: string;
}
