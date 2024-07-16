import { Injectable } from '@nestjs/common';
import { Location, Media, Prisma } from '@prisma/client';
import { PrismaService } from '@app/modules/db/prisma.service';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';

@Injectable()
export class LocationsRepository {
  private readonly location: PrismaService['location'];

  constructor(private readonly db: PrismaService) {
    this.location = this.db.location;
  }

  async create(data: CreateLocationDto, userId: string, mediaId: string) {
    return this.location.create({
      data: {
        ...data,
        user: {
          connect: {
            id: userId,
          },
        },
        media: {
          connect: {
            id: mediaId,
          },
        },
      },
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

  async findByUserId(userId: string, include?: Prisma.LocationInclude) {
    return this.location.findMany({
      where: {
        userId,
      },
      include,
    });
  }

  async delete(id: string): Promise<boolean> {
    const location = await this.location.delete({
      where: {
        id,
      },
    });
    return !!location;
  }
}
