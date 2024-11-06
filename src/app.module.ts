import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { isTestEnv } from '@app/common/utils/env-check';
import { validateEnv } from '@app/config/env/env-var.validation';
import { AwsModule } from '@app/modules/aws/aws.module';
import { PrismaModule } from '@app/modules/db/prisma.module';
import { RateLimitModule } from '@app/modules/rate-limit/rate-limit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { GoogleModule } from './modules/google/google.module';
import { GuessModule } from './modules/guess/guess.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MediaModule } from './modules/media/media.module';
import { QueueModule } from './modules/queue/queue.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: isTestEnv() ? '.env.test' : '.env',
      isGlobal: true,
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AwsModule,
    MediaModule,
    LocationsModule,
    GuessModule,
    GoogleModule,
    ActivityLogModule,
    RateLimitModule,
    EmailModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
