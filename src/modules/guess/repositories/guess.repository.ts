import { Injectable } from '@nestjs/common';
import { Location, Media, Prisma } from '@prisma/client';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { PrismaService } from '@app/modules/db/prisma.service';

@Injectable()
export class GuessRepository {
  private readonly guess: PrismaService['guess'];

  constructor(private readonly db: PrismaService) {
    this.guess = this.db.guess;
  }

  async create(data: Prisma.GuessUncheckedCreateInput) {
    return this.guess.create({
      data,
    });
  }

  async exists(userId: string, locationId: string) {
    return this.guess.findFirst({
      where: {
        userId,
        locationId,
      },
    });
  }

  async findByUserId(userId: string, { take, skip }: PaginationQuery) {
    const query: Prisma.GuessFindManyArgs = {
      where: {
        userId,
      },
      select: {
        distanceText: true,
        location: {
          select: {
            id: true,
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
      take,
      skip,
    };

    return this.db.$transaction([
      this.guess.findMany(query),
      this.guess.count({ where: query.where }),
    ]) as unknown as Promise<[{ distanceText: string; location: { id: string; media: { key: string } } }[], number]>;
  }
}
