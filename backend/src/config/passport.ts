import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User';
import { uploadGoogleProfileImage } from './cloudinary';

// Serialize/Deserialize user (not strictly needed for session: false, but good practice)
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
            user.googleId = profile.id;
            if (!user.profileImage && profile.photos?.[0]?.value) {
              // Upload Google profile image to Cloudinary
              const cloudinaryResult = await uploadGoogleProfileImage(
                profile.photos[0].value,
                user._id.toString()
              );
              if (cloudinaryResult.url) {
                user.profileImage = cloudinaryResult.url;
              }
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create new user with Cloudinary image
        let profileImageUrl = '';
        if (profile.photos?.[0]?.value) {
          // We'll upload after user is created to get the user ID
          profileImageUrl = profile.photos[0].value;
        }

        const newUser = await User.create({
          fullName: profile.displayName,
          email: email,
          googleId: profile.id,
          role: 'student', // Default role
          isProfileComplete: false,
          isEmailVerified: true, // Google verified
        });

        // Upload profile image to Cloudinary after user is created
        if (profileImageUrl) {
          const cloudinaryResult = await uploadGoogleProfileImage(
            profileImageUrl,
            newUser._id.toString()
          );
          if (cloudinaryResult.url) {
            newUser.profileImage = cloudinaryResult.url;
            await newUser.save();
          }
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
            user.linkedinId = profile.id;
            if (!user.profileImage && profile.photos?.[0]?.value) {
              // Upload LinkedIn profile image to Cloudinary
              const cloudinaryResult = await uploadGoogleProfileImage(
                profile.photos[0].value,
                user._id.toString()
              );
              if (cloudinaryResult.url) {
                user.profileImage = cloudinaryResult.url;
              }
            }
            if (!user.linkedInUrl) {
              // Construct public profile URL if possible or store ID
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create new user with Cloudinary image
        let profileImageUrl = '';
        if (profile.photos?.[0]?.value) {
          profileImageUrl = profile.photos[0].value;
        }

        const newUser = await User.create({
          fullName: profile.displayName,
          email: email,
          linkedinId: profile.id,
          role: 'student', // Default role
          isProfileComplete: false,
          isEmailVerified: true, // LinkedIn verified
        });

        // Upload profile image to Cloudinary after user is created
        if (profileImageUrl) {
          const cloudinaryResult = await uploadGoogleProfileImage(
            profileImageUrl,
            newUser._id.toString()
          );
          if (cloudinaryResult.url) {
            newUser.profileImage = cloudinaryResult.url;
            await newUser.save();
          }
        }

        done(null, newUser);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

export default passport;
