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

  async create(data: CreateLocationDto & { userId: string; mediaId: string }, tx?: Prisma.TransactionClient) {
    const db = tx || this.db;
    return db.location.create({
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

  async findOneWithDetails(id: string) {
    return this.location.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        address: true,
        lng: true,
        lat: true,
        userId: true,
        media: {
          select: {
            key: true,
          },
        },
        guesses: {
          select: {
            id: true,
            distanceText: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                imageUrl: true,
                media: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
          orderBy: {
            distance: 'asc',
          },
          take: 10,
        },
      },
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

    type LocationWithMedia = Prisma.LocationGetPayload<typeof query>;

    return this.db.$transaction([
      this.location.findMany(query),
      this.location.count({ where: query.where }),
    ]) as Promise<[LocationWithMedia[], number]>;
  }

  async findManyWithPagination({ take, skip }: PaginationQuery) {
    const query: Prisma.LocationFindManyArgs = {
      include: {
        media: true,
      },
      orderBy: {
        createdAt: DEFAULT_ORDER,
      },
      take,
      skip,
    };

    type LocationWithMedia = Prisma.LocationGetPayload<typeof query>;

    return this.db.$transaction([this.location.findMany(query), this.location.count()]) as Promise<
      [LocationWithMedia[], number]
    >;
  }

  async update(id: string, data: UpdateLocationDto & { mediaId?: string }, tx?: Prisma.TransactionClient) {
    const db = tx || this.db;
    return db.location.update({
      where: {
        id,
      },
      data,
      include: {
        media: true,
      },
    });
  }

  async transaction<T>(callback: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.db.$transaction(callback);
  }
}
