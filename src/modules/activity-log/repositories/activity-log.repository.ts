import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@app/modules/db/prisma.service';

@Injectable()
export class ActivityLogRepository {
  private readonly activityLog: PrismaService['activityLog'];

  constructor(private readonly db: PrismaService) {
    this.activityLog = this.db.activityLog;
  }

  async create(data: Prisma.ActivityLogUncheckedCreateInput) {
    return this.activityLog.create({
      data,
    });
  }

  /**
   * Retrieves last 100 activity logs
   */
  async findMany() {
    return this.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
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
      take: 100,
    });
  }
}
