import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { saveUser } from "@/lib/user-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        (session.user as Record<string, unknown>).provider = token.provider;
      }
      return session;
    },
  },
});
