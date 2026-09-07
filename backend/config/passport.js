const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Business = require('../models/Business');
const Branch = require('../models/Branch');
const bcrypt = require('bcryptjs');

/**
 * Google OAuth 2.0 Strategy
 * Triggered after user authenticates with Google and grants consent.
 * Google sends back: accessToken, refreshToken, profile
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name  = profile.displayName || profile.name?.givenName || 'Google User';
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email returned from Google'), null);
        }

        // ── 1. Check if user already exists ──────────────────────────────
        let user = await User.findOne({ email });

        if (user) {
          // ── 2a. YES → update login timestamp ─────────────────────────
          user.lastLoginAt = new Date();
          // Store googleId if first time signing in via Google
          if (!user.googleId) {
            user.googleId = googleId;
          }
          await user.save();
        } else {
          // ── 2b. NO → Create business + branch + user ─────────────────
          const business = await Business.create({
            name: `${name}'s Workspace`,
            industry: 'technology',
            subscriptionPlan: 'growth',
          });

          await Branch.create({
            business: business._id,
            name: 'Main Branch',
            type: 'both',
          });

          user = await User.create({
            name,
            email,
            googleId,
            // Random password — they'll use Google to login, not password
            password: await bcrypt.hash(`google_${googleId}_${Date.now()}`, 10),
            memberships: [{ business: business._id, role: 'owner' }],
            isActive: true,
            lastLoginAt: new Date(),
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize / Deserialize (needed by Passport session, but we use JWT so minimal)
passport.serializeUser((user, done) => done(null, user._id?.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
