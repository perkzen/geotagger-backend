import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  /**
   * Find users best guesses based on distance
   * @param userId
   * @param take
   * @param skip
   */
  async findByUserId(userId: string, { take, skip }: PaginationQuery) {
    const query: Prisma.GuessFindManyArgs = {
      where: {
        userId,
      },
      select: {
        id: true,
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
      distinct: ['id'],
      take,
      skip,
    };

    return this.db.$transaction([
      this.guess.findMany(query),
      this.guess.count({ where: query.where }),
    ]) as unknown as Promise<[{ distanceText: string; location: { id: string; media: { key: string } } }[], number]>;
  }

  /**
   * Count the number of guesses for a user in a location
   * @param userId
   * @param locationId
   */
  async guessCount(userId: string, locationId: string) {
    return this.guess.count({
      where: {
        userId,
        locationId,
      },
    });
  }
}
