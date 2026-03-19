import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { saveUser } from "@/lib/user-store";

// Test-only credentials — never use in production
const TEST_USER = {
  id: "test-user-001",
  email: "admin@test.com",
  password: "test1234",
  name: "Test User",
  image: "",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Test Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === TEST_USER.email &&
          credentials?.password === TEST_USER.password
        ) {
          return { id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name, image: TEST_USER.image };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (user?.email) {
        await saveUser({
          name: user.name ?? "",
          email: user.email,
          image: user.image ?? "",
          provider: account?.provider ?? "unknown",
          signedUpAt: new Date().toISOString(),
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.provider = account?.provider;
        token.signedUpAt = token.signedUpAt ?? Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).provider = token.provider;
      }
      return session;
    },
  },
});
