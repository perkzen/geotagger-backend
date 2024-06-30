import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { InvalidCredentialsException } from '@app/modules/auth/exceptions/invalid-credentials.exception';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { UserDto } from '@app/modules/users/dtos/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<UserDto> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new InvalidCredentialsException();
    }
    return user;
  }
}
