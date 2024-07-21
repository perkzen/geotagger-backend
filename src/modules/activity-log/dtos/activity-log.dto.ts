import { ApiProperty } from '@nestjs/swagger';
import { Action, ComponentType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { MediaDto } from '@app/modules/media/dtos/media.dto';

class User {
  @ApiProperty()
  @Expose()
  firstname: string;

  @ApiProperty()
  @Expose()
  lastname: string;

  @ApiProperty()
  @Expose()
  @Type(() => MediaDto)
  media: MediaDto | null;
}

export class ActivityLogDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  @Type(() => User)
  user: User;

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

  @ApiProperty()
  @Expose()
  value: string | null;

  @ApiProperty()
  @Expose()
  location: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
