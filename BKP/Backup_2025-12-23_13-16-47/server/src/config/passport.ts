import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../prisma';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_google_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_secret',
    callbackURL: "http://localhost:3000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = (profile as any).emails?.[0].value;
      if (!email) return done(new Error('No email found'));

      // 1. Try to find user by Google ID
      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

      if (!user) {
        // 2. Try to find user by email
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Link Google ID to existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id }
          });
        } else {
          // 3. Create new user
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              googleId: profile.id,
              role: 'USER',
              emailVerified: new Date()
            }
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'mock_github_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock_github_secret',
    callbackURL: "http://localhost:3000/api/auth/github/callback",
    scope: ['user:email']
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const email = (profile as any).emails?.[0].value;
      if (!email) return done(new Error('No email found'));

      // 1. Try to find user by GitHub ID
      let user = await prisma.user.findUnique({ where: { githubId: profile.id } });

      if (!user) {
        // 2. Try to find user by email
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Link GitHub ID to existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: { githubId: profile.id }
          });
        } else {
          // 3. Create new user
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username,
              githubId: profile.id,
              role: 'USER',
              emailVerified: new Date()
            }
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

export default passport;
