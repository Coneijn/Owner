import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isLoginPage = nextUrl.pathname === '/login';

      // Extraemos el rol y los perfiles inyectados en la sesión
      // Usamos @ts-ignore temporalmente si no has extendido los tipos de NextAuth
      // @ts-ignore
      const userRole = auth?.user?.role;
      // @ts-ignore
      const profiles: string[] = auth?.user?.profiles || [];

      // Función interna para determinar a dónde enviar al usuario según su jerarquía
      const determineRedirect = () => {
        // 1. Si es Admin, siempre va al panel principal de administración
        if (userRole === 'ADMIN') return new URL('/admin', nextUrl);
        
        // 2. Jerarquía de perfiles (puedes ajustar el orden de prioridad)
        if (profiles.includes('AGENT')) return new URL('/dashboard-agente', nextUrl);
        if (profiles.includes('SELLER')) return new URL('/dashboard-vendedor', nextUrl);
        // if (profiles.includes('BUYER')) return new URL('/dashboard-comprador', nextUrl);
        
        // 3. Fallback: Si no tiene perfiles asignados, lo mandamos a la página de inicio
        return new URL('/', nextUrl);
      };

      // Lógica de protección de rutas
      if (isOnAdmin) {
        if (!isLoggedIn) return false; // Expulsa al login si no hay sesión
        if (userRole === 'ADMIN') return true; // Permite el paso si es Admin
        
        // Si está logueado pero intenta entrar a /admin sin serlo, lo redirige a su panel
        return Response.redirect(determineRedirect());
        
      } else if (isLoggedIn && isLoginPage) {
        // Si ya tiene sesión activa e intenta ir a la página de login, lo redirige a su panel
        return Response.redirect(determineRedirect());
      }

      // Para cualquier otra ruta pública, permite el paso
      return true;
    },
    
    async jwt({ token, user }) {
      // Cuando el usuario inicia sesión, pasamos la info del usuario al token
      if (user) {
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.profiles = user.profiles; // Guardamos el array de perfiles
      }
      return token;
    },

    async session({ session, token }) {
      // Pasamos la info del token a la sesión final disponible en el cliente
      if (token.sub && session.user) {
        // @ts-ignore 
        session.user.id = token.sub;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.profiles = token.profiles; // Hacemos disponibles los perfiles
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;