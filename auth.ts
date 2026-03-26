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
  code: z.string().optional(), // Campo opcional para el código 2FA
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password, code } = parsedCredentials.data;
          
          // 1. Buscamos al usuario e INCLUIMOS sus perfiles conectados
          const user = await prisma.user.findUnique({ 
            where: { email },
            include: {
              sellerProfile: true, 
              buyerProfile: true, 
              agentProfile: true, 
            }
          });
          
          if (!user) return null;

          // Verificamos la contraseña
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;

          // --- LÓGICA 2FA ---
          if (user.isTwoFactorEnabled) {
            if (!code) {
              // Si tiene 2FA pero no mandó código, lanzamos error para que la UI lo pida
              throw new Error('2FA_REQUIRED'); 
            }

            // Verificamos que el código ingresado sea válido
            const isValidOTP = authenticator.verify({
              token: code,
              secret: user.twoFactorSecret!
            });

            if (!isValidOTP) {
              throw new Error('INVALID_2FA_CODE');
            }
          }
          // ------------------

          // 2. Evaluamos qué perfiles tiene este usuario y armamos el arreglo
          const userProfiles: string[] = [];
          
          if (user.sellerProfile) userProfiles.push('SELLER');
          if (user.buyerProfile) userProfiles.push('BUYER');
           if (user.agentProfile) userProfiles.push('AGENT');

          // 3. Retornamos la información vital, inyectando el rol y los perfiles
          return {
            id: user.id,
            email: user.email,
            role: user.role, // Puede ser 'ADMIN' o 'USER'
            profiles: userProfiles // Arreglo como ['SELLER', 'BUYER']
          };
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});