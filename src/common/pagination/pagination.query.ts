import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsPositive, Min } from 'class-validator';
import { DEFAULT_SKIP, DEFAULT_TAKE } from '@app/common/pagination/pagination.constants';

export class PaginationQuery {
  @ApiProperty({
    required: false,
    default: DEFAULT_TAKE,
  })
  @Transform(({ value }) => value | DEFAULT_TAKE)
  @IsPositive()
  take?: number;

  @ApiProperty({
    required: false,
    default: DEFAULT_SKIP,
  })
  @Transform(({ value }) => value | DEFAULT_SKIP)
  @Min(0)
  skip?: number;
}
