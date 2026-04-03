import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { saveUser } from "@/lib/user-store";
import { isAdminEmail } from "@/lib/visitor-analytics";

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
          phone: (user as { phone?: string | null }).phone ?? "",
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
        token.phone = (user as { phone?: string | null }).phone ?? token.phone;
      }
      token.isAdmin = typeof token.email === "string" && isAdminEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as unknown as Record<string, unknown>;
        sessionUser.provider = token.provider;
        sessionUser.isAdmin = typeof token.email === "string" && isAdminEmail(token.email);
        sessionUser.phone = token.phone;
      }
      return session;
    },
  },
});
