import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
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
    private readonly configService: ConfigService,
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
    const payload = { email: data.email, sub: data.id };
    return {
      email: data.email,
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
}
