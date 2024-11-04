import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/modules/db/prisma.service';
import { CreateMediaDto } from '@app/modules/media/dtos/create-media.dto';

@Injectable()
export class MediaRepository {
  private readonly media: PrismaService['media'];

  constructor(private readonly db: PrismaService) {
    this.media = this.db.media;
  }

  async create(data: CreateMediaDto) {
    return this.media.create({
      data,
    });
  }

  async findOneOrFail(id: string) {
    return this.media.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async createOrUpdate(data: CreateMediaDto) {
    return this.media.upsert({
      where: {
        key: data.key,
      },
      update: data,
      create: data,
    });
  }

  async update(id: string, data: CreateMediaDto) {
    return this.media.update({
      where: {
        id,
      },
      data,
    });
  }

  async transaction<T>(fn: (db: PrismaService) => Promise<T>) {
    return this.db.$transaction(fn);
  }
}
