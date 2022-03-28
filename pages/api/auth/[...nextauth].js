
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '../../../lib/prisma'
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    jwt: true
  },
  secret: process.env.SECRET,
  theme: 'dark',
  pages: {
    // signIn: '/auth/signin', displays signin buttons
    // signOut: '/auth/sightout', //Displays form with sign out button
    // error: '/auth/error', //Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: null // If set, new users will be directed here on first sign in
  },
  callbacks: {
    // async signIn(user, account, profile) { return true },
    // async redirect(url, baseUrl) { return baseUrl },
    // async session(session, user) { return session },
    // async jwt(token, user, account, profile, isNewUser) { return token }
  },
  debug: false,
});
