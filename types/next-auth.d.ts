import 'next-auth';
import { UserRole, OpticianStatus } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    opticianStatus?: OpticianStatus;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      opticianStatus?: OpticianStatus;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    opticianStatus?: OpticianStatus;
  }
}
