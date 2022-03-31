import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../lib/prisma'

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // https://next-auth.js.org/configuration/providers
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
  ],

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true,

    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    // secret: 'INp8IvdIyeMcoGAgFGoA61DdBglwwSqnXJZkgz8PSnw',
    // Set to true to use encryption (default: false)
    // encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },

  // You can define custom pages to override the built-in ones. These will be regular Next.js pages
  // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: '/signin', // Displays signin buttons
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify', // Used for check email page
    // newUser: '/bully', // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // async signIn(user, account, profile) { return true },
    // async redirect(url, baseUrl) { return baseUrl },
    async session(session, token) {  return session  },
    async jwt(args) {
      // args = { token, user, account, profile, isNewUser }

      console.log('----------------------------------------------------------')
      console.log("Creating JWT.... ")

      var user_id = null;
      if (args.user) { user_id = args.user.id }
      console.log(`NEW USER: ${args.isNewUser} | USER ID: ${user_id}`)

      var token = args.token;
      console.log(`Token:`);
      console.log(token);
      
      if (args.isNewUser) {
        console.log(`THIS IS A NEW USER.  CREATE ACCOUNT / VERIFY IT.`);

        console.log(`Attempting to add role as "USER" for new user...`)
        const updateUser = await prisma.user.update({
          where: {
            id: args.user.id
          },
          data: {
            role: "USER"
          }
        });
      }

      if (user_id && !token.role) {
        console.log("Retrieving user Role...")
        const role = await prisma.user.findUnique({
          where: {
            id: args.user.id
          },
          select: {
            role: true
          }
        });
        console.log(`Retrieved role: ${role.role}`)
  
        token.role = role.role;
      }

      console.log("Final Token (Next Line):")
      console.log(token)

      return token
    }
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {
    /*
    signIn: ({ user, account, profile, isNewUser }) => {
      console.log(`User Sign In successful.`)
      console.log(`User:`);
      console.log(user);

      console.log(`User ID: ${user.id}`)

      console.log(`Account:`);
      console.log(account);

      console.log(`Profile:`);
      console.log(profile);
    },
    */
    // updateUser({ user })
  },

  // You can set the theme to 'light', 'dark' or use 'auto' to default to the
  // whatever prefers-color-scheme is set to in the browser. Default is 'auto'
  theme: 'light',

  // Enable debug messages in the console if you are having problems
  debug: false,
});
