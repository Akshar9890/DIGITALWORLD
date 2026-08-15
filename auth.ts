/**
 * auth.ts — Auth.js v5 Configuration
 *
 * Providers:
 *  - Credentials (email + bcrypt password)
 *  - Google OAuth
 *
 * Roles: retail | wholesale_pending | wholesale_approved | admin
 * Admin sub-roles: SUPER_ADMIN | PRODUCT_MANAGER | ORDER_MANAGER | SUPPORT | ACCOUNTING
 */

import NextAuth from "next-auth";
import "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { UserRole, AdminSubRole } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    // ── Google OAuth ────────────────────────────────────────────────────────
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    // ── Credentials (email + password) ──────────────────────────────────────
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          adminSubRole: user.adminSubRole,
        };
      },
    }),
  ],

  callbacks: {
    // Include role in JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role as UserRole;
        token.adminSubRole = (user as any).adminSubRole as AdminSubRole | null;
      }
      // Refresh role from DB on session update
      if (trigger === "update" && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, adminSubRole: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.adminSubRole = dbUser.adminSubRole;
        }
      }
      return token;
    },
    // Expose role in session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.adminSubRole = token.adminSubRole as AdminSubRole | null;
      }
      return session;
    },
  },
});

// ── Type augmentation ──────────────────────────────────────────────────────
declare module "next-auth" {
  interface User {
    role: UserRole;
    adminSubRole: AdminSubRole | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      adminSubRole: AdminSubRole | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    adminSubRole: AdminSubRole | null;
  }
}
