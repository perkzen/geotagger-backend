import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthController } from '@app/modules/auth/controllers/local-auth.controller';
import { SocialsAuthController } from '@app/modules/auth/controllers/socials-auth.controller';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { JwtStrategy } from '@app/modules/auth/stragegies/jwt.strategy';
import { LocalStrategy } from '@app/modules/auth/stragegies/local.strategy';
import { UsersModule } from '@app/modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') },
      }),
    }),
  ],
  controllers: [LocalAuthController, SocialsAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
