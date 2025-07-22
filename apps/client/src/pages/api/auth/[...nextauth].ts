import NextAuth, { type DefaultSession, type NextAuthOptions, type DefaultUser } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import 'next-auth/jwt'; // For JWT type augmentation

const prisma = new PrismaClient();

// Extend the built-in types for User and Session
type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'USER';

interface IUser extends DefaultUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  familyId?: string | null;
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: IUser & DefaultSession['user'];
  }

  interface User extends IUser {
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    familyId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Configure your authentication providers here
    // Example:
    // CredentialsProvider({
    //   name: 'Credentials',
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //     // Add your own authorization logic here
    //     return null;
    //   }
    // })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: user.id,
          role: (user as IUser).role || 'USER',
          familyId: (user as IUser).familyId || null,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const userWithRole = user as IUser;
        return {
          ...token,
          id: userWithRole.id,
          role: userWithRole.role || 'USER',
          familyId: userWithRole.familyId || null,
        };
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
