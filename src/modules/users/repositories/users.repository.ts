import { Injectable } from '@nestjs/common';
import { Media, Prisma, User } from '@prisma/client';
import { PrismaService } from '@app/modules/db/prisma.service';
import { UpdateUserDto } from '@app/modules/users/dtos/update-user.dto';

@Injectable()
export class UsersRepository {
  private readonly user: PrismaService['user'];

  constructor(private readonly db: PrismaService) {
    this.user = this.db.user;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.user.create({
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.user.delete({
      where: {
        id,
      },
    });
    return !!user;
  }

  async findOne(id: string, include?: Prisma.UserInclude): Promise<(User & { media: Media | null }) | null> {
    return this.user.findUnique({
      where: {
        id,
      },
      include,
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
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
}
