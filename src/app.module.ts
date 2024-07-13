import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { isTestEnv } from '@app/common/utils/env-check';
import { validateEnv } from '@app/config/env/env-var.validation';
import { PrismaModule } from '@app/modules/db/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: isTestEnv() ? '.env.test' : '.env',
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
