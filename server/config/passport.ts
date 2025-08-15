import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { config } from './keys';
import { storage } from '../storage';
import { User } from '@shared/schema';

// Setup passport for user authentication
export const setupPassport = () => {
  // Serialize user id for session
  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  // Deserialize user from id stored in session
  passport.deserializeUser(async (id: number, done: any) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Configure Google Strategy only if credentials are provided
  if (config.google.oauth.clientID && config.google.oauth.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.google.oauth.clientID!,
          clientSecret: config.google.oauth.clientSecret!,
          callbackURL: config.google.oauth.callbackURL,
        },
      async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
        try {
          // Check if user already exists by email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Email not provided by Google'), undefined);
          }
          
          let user = await storage.getUserByEmail(email);
          
          // If user doesn't exist, create a new one
          if (!user) {
            const newUser = {
              username: profile.displayName || email.split('@')[0],
              email: email,
              password: null, // Not needed for OAuth
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || null
            };
            
            user = await storage.createUser(newUser);
          } else if (!user.googleId) {
            // Update user with Google ID if they already have an account with the same email
            user = await storage.updateUser(user.id, { 
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || user.avatarUrl
            });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
  } else {
    console.warn('Google OAuth credentials not provided - OAuth login disabled');
  }

  return passport;
};