import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Will be dynamic per locale
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Allow access to API routes and login
      if (nextUrl.pathname.includes('/api/auth')) return true;
      
      const isTryingToLogin = nextUrl.pathname.endsWith('/login');
      
      if (isLoggedIn) {
        if (isTryingToLogin) {
          // Default redirect to dashboard if logged in
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      
      // If NOT logged in and NOT on login page = kick to login
      if (!isTryingToLogin) {
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.team = (user as any).team;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).team = token.team;
      }
      return session;
    }
  },
  providers: [], // Add providers via injected auth.ts
} satisfies NextAuthConfig;
