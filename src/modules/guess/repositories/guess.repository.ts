import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
}
