import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CrudRepository } from '@app/common/repository/crud-repository.interface';
import { PrismaService } from '@app/modules/db/prisma.service';
import { UpdateUserDto } from '@app/modules/users/dtos/update-user.dto';

@Injectable()
export class UsersRepository implements CrudRepository<Prisma.UserCreateInput, Prisma.UserUpdateInput, User> {
  constructor(private readonly db: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.db.user.delete({
      where: {
        id,
      },
    });
    return !!user;
  }

  async findAll(): Promise<User[]> {
    return this.db.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: {
        id,
      },
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
    return this.db.user.findUnique({
      where: {
        email,
      },
    });
  }
}
