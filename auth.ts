// auth.ts (Modificado)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/preset-default';

const prisma = new PrismaClient();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  code: z.string().optional(), // Nuevo campo opcional para el código 2FA
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password, code } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;

          // --- LOGICA 2FA ---
          if (user.isTwoFactorEnabled) {
            // 1. Si no enviaron código, lanzamos un error específico o retornamos null
            // para que la UI sepa que debe pedir el código.
            // En NextAuth Credentials, manejar esto es complejo. 
            // Una opción simple es requerir que el usuario ponga el código en el login si tiene 2FA.
            
            if (!code) {
              // Opción A: Retornar null (Login fallido)
              // Opción B: Lanzar Error para capturarlo en el cliente (Recomendado si quieres UX avanzada)
              throw new Error('2FA_REQUIRED'); 
            }

            // 2. Verificar el código
            const isValidOTP = authenticator.verify({
              token: code,
              secret: user.twoFactorSecret!
            });

            if (!isValidOTP) {
              throw new Error('INVALID_2FA_CODE');
            }
          }
          // ------------------

          return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});