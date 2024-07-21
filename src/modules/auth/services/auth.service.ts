import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { UpdatePasswordDto } from '@app/modules/auth/dtos/update-password.dto';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { CannotChangePasswordException } from '@app/modules/auth/exceptions/cannot-change-password.exception';
import { UserAlreadyExistsException } from '@app/modules/auth/exceptions/user-already-exists.exception';
import { comparePasswords, hashPassword } from '@app/modules/auth/utils/password.utils';
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

  async login(data: UserDto) {
    const payload = {
      email: data.email,
      sub: {
        id: data.id,
        role: data.role,
      },
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(data: CreateLocalUserDto) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      this.logger.error(`User with email ${data.email} already exists`);
      throw new UserAlreadyExistsException();
    }

    return await this.usersService.createLocalUser({ ...data, password: await hashPassword(data.password) });
  }

  /**
   * User can only update their password if they are a local user,
   * because only local users have passwords.
   */
  async changePassword(userId: string, { newPassword, oldPassword }: UpdatePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (user.provider !== AuthStrategy.LOCAL) {
      throw new CannotChangePasswordException();
    }

    const isPasswordValid = await comparePasswords(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new CannotChangePasswordException();
    }

    await this.usersService.updatePassword(userId, await hashPassword(newPassword));
  }
}
