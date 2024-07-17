import { Injectable } from '@nestjs/common';
import { Location, Media, Prisma } from '@prisma/client';
import { DEFAULT_ORDER } from '@app/common/pagination/pagination.constants';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { PrismaService } from '@app/modules/db/prisma.service';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { UpdateLocationDto } from '@app/modules/locations/dtos/update-location.dto';

@Injectable()
export class LocationsRepository {
  private readonly location: PrismaService['location'];

  constructor(private readonly db: PrismaService) {
    this.location = this.db.location;
  }

  async create(data: CreateLocationDto & { userId: string; mediaId: string }) {
    return this.location.create({
      data,
    });
  }

  async findOne(id: string, include?: Prisma.LocationInclude): Promise<(Location & { media: Media | null }) | null> {
    return this.location.findUnique({
      where: {
        id,
      },
      include,
    });
  }

  async findByUserIdWithPagination(userId: string, { take, skip }: PaginationQuery) {
    const query: Prisma.LocationFindManyArgs = {
      where: {
        userId,
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: DEFAULT_ORDER,
      },
      take,
      skip,
    };

    return this.db.$transaction([this.location.findMany(query), this.location.count({ where: query.where })]);
  }

  async delete(id: string): Promise<boolean> {
    const location = await this.location.delete({
      where: {
        id,
      },
    });
    return !!location;
  }

  async update(id: string, data: UpdateLocationDto & { mediaId?: string }) {
    return this.location.update({
      where: {
        id,
      },
      data,
    });
  }
}
