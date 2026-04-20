import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// 1. Extendemos el tipo User y Session
declare module 'next-auth' {
  // Qué propiedades extra tiene tu usuario al hacer el authorize
  interface User extends DefaultUser {
    role: string;
    profiles: string[];
  }

  // Qué propiedades extra estarán disponibles en el cliente usando useSession() o auth()
  interface Session {
    user: {
      id: string;
      role: string;
      profiles: string[];
    } & DefaultSession['user'];
  }
}

// 2. Extendemos el tipo JWT para los callbacks
declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    profiles?: string[];
  }
}