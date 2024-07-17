import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginatedMetaDataDto {
  @ApiProperty({
    required: true,
    title: 'Total number of entities',
    type: 'number',
  })
  @Expose()
  total: number;

  @ApiProperty({
    required: true,
    title: 'Number of entities per page',
    type: 'number',
  })
  @Expose()
  take: number;

  @ApiProperty({
    required: true,
    title: 'Number of skipped entities',
    type: 'number',
  })
  @Expose()
  skip: number;
}

export class PaginatedDto<T> {
  @ApiProperty({
    isArray: true,
    required: true,
    title: 'Array of entities',
    type: 'object',
  })
  @Expose()
  data: T[];

  @Expose()
  meta: PaginatedMetaDataDto;
}
