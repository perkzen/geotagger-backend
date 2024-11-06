import { Injectable } from '@nestjs/common';
import { Media, Prisma, User } from '@prisma/client';
import { PrismaService } from '@app/modules/db/prisma.service';
import { DEFAULT_POINTS } from '@app/modules/users/constants/points.constants';

@Injectable()
export class UsersRepository {
  private readonly user: PrismaService['user'];

  constructor(private readonly db: PrismaService) {
    this.user = this.db.user;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.user.create({
      data: {
        ...data,
        points: DEFAULT_POINTS,
      },
    });
  }

  async findOne(id: string, include?: Prisma.UserInclude): Promise<(User & { media: Media | null }) | null> {
    return this.user.findUnique({
      where: {
        id,
      },
      include,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({
      where: {
        email,
      },
    });
  }

  async incrementPoints(userId: string, points: number, tx?: Prisma.TransactionClient) {
    const db = tx || this.db;

    return db.user.update({
      where: {
        id: userId,
      },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }

  async decrementPoints(userId: string, points: number, tx?: Prisma.TransactionClient) {
    const db = tx || this.db;

    return db.user.update({
      where: {
        id: userId,
      },
      data: {
        points: {
          decrement: points,
        },
      },
    });
  }

  async transaction<T>(callback: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.db.$transaction(callback);
  }
}
