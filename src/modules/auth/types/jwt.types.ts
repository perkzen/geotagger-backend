import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: {
    id: string;
    role: Role;
    email: string;
  };
};

export type JwtUser = {
  id: string;
  email: string;
  role: Role;
};

export type RestPasswordJwtPayload = { sub: { id: string; email: string } };
