import { Role } from '@app/modules/auth/enums/role.enum';

export type JwtPayload = {
  sub: {
    id: string;
    role: Role;
  };
  email: string;
};

export type JwtUser = {
  id: string;
  email: string;
  role: Role;
};
