import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Queue } from 'bullmq';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { ChangePasswordDto } from '@app/modules/auth/dtos/change-password.dto';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { CannotChangePasswordException } from '@app/modules/auth/exceptions/cannot-change-password.exception';
import { IncorrectPasswordException } from '@app/modules/auth/exceptions/incorrect-password.exception';
import { UserAlreadyExistsException } from '@app/modules/auth/exceptions/user-already-exists.exception';
import { JwtPayload, JwtUser } from '@app/modules/auth/types/jwt.types';
import { comparePasswords, hashPassword } from '@app/modules/auth/utils/password.utils';
import { EmailTemplate } from '@app/modules/email/enums/email-template.enum';
import { ProcessEmailPayload } from '@app/modules/email/interfaces/process-email-payload.interface';
import { JobName } from '@app/modules/queue/enums/job-name.enum';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { CreateSocialUserDto } from '@app/modules/users/dtos/create-social-user.dto';
import { UserDto } from '@app/modules/users/dtos/user.dto';
import { UsersService } from '@app/modules/users/services/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectQueue(QueueName.EMAIL) private readonly emailQueue: Queue<ProcessEmailPayload>,
  ) {}

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && (await comparePasswords(password, user.password))) {
      return serializeToDto(UserDto, user);
    }

    return null;
  }

  async validateSocialUser(data: CreateSocialUserDto) {
    const user = await this.usersService.findByEmail(data.email);

    if (user) {
      return serializeToDto(UserDto, user);
    }

    const newUser = await this.usersService.createSocialUser(data);
    return serializeToDto(UserDto, newUser);
  }

  async login({ id, email, role }: UserDto) {
    return await this.generateTokens({ id, email, role });
  }

  async register(data: CreateLocalUserDto) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      this.logger.error(`User with email ${data.email} already exists`);
      throw new UserAlreadyExistsException();
    }

    const user = await this.usersService.createLocalUser({ ...data, password: await hashPassword(data.password) });
    return await this.generateTokens({ id: user.id, email: user.email, role: user.role });
  }

  /**
   * User can only update their password if they are a local user,
   * because only local users have passwords.
   */
  async changePassword(userId: string, { newPassword, currentPassword }: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (user.provider !== AuthStrategy.LOCAL) {
      throw new CannotChangePasswordException();
    }

    const isPasswordValid = await comparePasswords(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new IncorrectPasswordException();
    }

    await this.usersService.updatePassword(userId, await hashPassword(newPassword));
  }

  async requestResetPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) return;

    const payload: Omit<JwtPayload['sub'], 'role'> = {
      id: user.id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync({ sub: payload }, { expiresIn: '15m' });

    try {
      await this.emailQueue.add(JobName.PROCESS_EMAIL, {
        recipient: user.email,
        subject: 'Reset your password',
        template: EmailTemplate.RESET_PASSWORD,
        data: {
          name: user.firstname,
          link: `${this.configService.getOrThrow('FRONTEND_URL')}/reset-password?token=${token}`,
        },
      });

      this.logger.log(`Reset password email was sent to queue for user with email ${user.email}`);
    } catch (err) {
      this.logger.error(`Failed to send forgot password email to ${user.email}: `, err);
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const {
        sub: { id },
      } = await this.jwtService.verifyAsync<{ sub: Omit<JwtPayload['sub'], 'role'> }>(token);
      await this.usersService.updatePassword(id, await hashPassword(password));
      this.logger.log(`User with id ${id} reset their password successfully`);
    } catch (err) {
      throw new CannotChangePasswordException();
    }
  }

  async refreshAccessToken(user: JwtUser) {
    return await this.generateTokens(user);
  }

  private async generateTokens(user: JwtUser) {
    const payload: JwtPayload = {
      sub: user,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    };
  }
}
