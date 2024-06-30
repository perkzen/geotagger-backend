import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { UserAlreadyExistsException } from '@app/modules/auth/exceptions/user-already-exists.exception';
import { comparePasswords, hashPassword } from '@app/modules/auth/utils/password.utils';
import { CreateUserDto } from '@app/modules/users/dtos/create-user.dto';
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

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && (await comparePasswords(password, user.password))) {
      return serializeToDto(UserDto, user);
    }

    return null;
  }

  async login(data: UserDto) {
    const payload = { email: data.email, sub: data.id };
    return {
      email: data.email,
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      }),
    };
  }

  async register(data: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      this.logger.error(`User with email ${data.email} already exists`);
      throw new UserAlreadyExistsException();
    }

    return await this.usersService.create({ ...data, password: await hashPassword(data.password) });
  }
}
