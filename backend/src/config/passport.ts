import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User';
import { uploadGoogleProfileImage } from './cloudinary';

// Helper function to upload profile image
const uploadProfileImage = async (
  imageUrl: string | undefined,
  userId: string
): Promise<string> => {
  if (!imageUrl) return '';
  
  const result = await uploadGoogleProfileImage(imageUrl, userId);
  return result.url || '';
};

// Helper function to handle existing user with OAuth
const linkOAuthToExistingUser = async (
  user: any,
  oauthId: string,
  oauthProvider: 'google' | 'linkedin',
  profileImageUrl?: string
) => {
  if (oauthProvider === 'google') {
    user.googleId = oauthId;
  } else {
    user.linkedinId = oauthId;
  }

  if (!user.profileImage && profileImageUrl) {
    const imageUrl = await uploadProfileImage(profileImageUrl, user._id.toString());
    if (imageUrl) {
      user.profileImage = imageUrl;
    }
  }

  await user.save();
  return user;
};

// Serialize/Deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        // Check if user exists by email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link googleId to existing user
            const linkedUser = await linkOAuthToExistingUser(
              user,
              profile.id,
              'google',
              profile.photos?.[0]?.value
            );
            return done(null, linkedUser);
          }
        }

        // Create new user - role is always 'student' (company registration disabled)
        const newUser = await User.create({
          fullName: profile.displayName,
          email,
          googleId: profile.id,
          role: 'student', // Force student role
          isProfileComplete: false,
          isEmailVerified: true,
        });

        // Upload profile image after user creation
        const imageUrl = await uploadProfileImage(
          profile.photos?.[0]?.value,
          newUser._id.toString()
        );
        if (imageUrl) {
          newUser.profileImage = imageUrl;
          await newUser.save();
        }

        done(null, newUser);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'mock_client_secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/linkedin/callback`,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Check if user exists by linkedinId
        let user = await User.findOne({ linkedinId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists by email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link linkedinId to existing user
            const linkedUser = await linkOAuthToExistingUser(
              user,
              profile.id,
              'linkedin',
              profile.photos?.[0]?.value
            );
            return done(null, linkedUser);
          }
        }

        // Create new user - role is always 'student' (company registration disabled)
        const newUser = await User.create({
          fullName: profile.displayName,
          email,
          linkedinId: profile.id,
          role: 'student', // Force student role
          isProfileComplete: false,
          isEmailVerified: true,
        });

        // Upload profile image after user creation
        const imageUrl = await uploadProfileImage(
          profile.photos?.[0]?.value,
          newUser._id.toString()
        );
        if (imageUrl) {
          newUser.profileImage = imageUrl;
          await newUser.save();
        }

        done(null, newUser);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

export default passport;
