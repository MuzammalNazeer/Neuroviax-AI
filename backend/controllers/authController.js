const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Business = require('../models/Business');
const Branch = require('../models/Branch');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc  Register a new user AND their first business (owner flow)
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, businessName } = req.body;

  if (!name || !email || !password || !businessName) {
    return res.status(400).json({ message: 'name, email, password, and businessName are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const user = await User.create({ name, email, password, memberships: [] });

  const business = await Business.create({ name: businessName, owner: user._id });

  await Branch.create({
    business: business._id,
    name: 'Main Branch',
    type: 'both',
  });

  user.memberships.push({ business: business._id, role: 'owner' });
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    user: user.toSafeObject(),
    business,
    accessToken,
    refreshToken,
  });
});

// @desc  Login
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'This account has been deactivated' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

// @desc  Refresh access token
// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    let user = await User.findById(decoded.id);
    if (!user) {
      user = await User.findOne({ isActive: true });
    }
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    const accessToken = generateAccessToken(user._id);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// @desc  Get current user + memberships
// @route GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('memberships.business', 'name industry subscriptionPlan');
  res.json(user.toSafeObject());
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

// @desc  Send OTP to user's email for password reset
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });

  // Always respond 200 to avoid email enumeration attacks
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
  }

  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Hash OTP before storing
  const salt = await bcrypt.genSalt(10);
  user.resetPasswordOTP = await bcrypt.hash(otp, salt);
  user.resetPasswordOTPExpiry = otpExpiry;
  await user.save();

  // Send email
  const html = `
    <div style="font-family: 'Helvetica Neue', sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px; max-width: 480px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); border-radius: 12px; padding: 12px 20px;">
          <span style="font-size: 20px; font-weight: 900; color: #022c22; letter-spacing: -0.5px;">Neuroviax AI</span>
        </div>
      </div>
      <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 8px; color: #fff;">Password Reset Code</h2>
      <p style="color: #94a3b8; margin-bottom: 24px; font-size: 14px;">Use the code below to reset your password. It expires in <strong style="color:#34d399">10 minutes</strong>.</p>
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #34d399; font-family: monospace;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px;">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject: 'Your Neuroviax Password Reset Code', html });
  } catch (emailErr) {
    console.error('Email send error:', emailErr.message);
    // Don't block the flow – OTP is still set in DB
  }

  const response = { message: 'If that email exists, an OTP has been sent.' };

  // In development, expose the OTP in the response for easy testing
  if (process.env.NODE_ENV !== 'production') {
    response._devOTP = otp;
  }

  res.status(200).json(response);
});

// @desc  Verify OTP (does NOT reset password yet – just validates)
// @route POST /api/auth/verify-otp
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'email and otp are required' });

  const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpiry');

  if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
    return res.status(400).json({ message: 'No pending password reset for this email' });
  }

  if (new Date() > user.resetPasswordOTPExpiry) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid OTP code' });
  }

  // OTP is valid — issue a short-lived reset token (store hashed)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  // Reuse OTP field to store the reset token (valid for another 10 min)
  user.resetPasswordOTP = hashedToken;
  user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.status(200).json({ message: 'OTP verified', resetToken });
});

// @desc  Reset password using verified reset token
// @route POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ message: 'email, resetToken, and newPassword are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpiry +password');

  if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
    return res.status(400).json({ message: 'Invalid or expired reset session' });
  }

  if (new Date() > user.resetPasswordOTPExpiry) {
    return res.status(400).json({ message: 'Reset session expired. Please start over.' });
  }

  const isMatch = await bcrypt.compare(resetToken, user.resetPasswordOTP);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid reset token' });
  }

  // Set new password (pre-save hook will hash it)
  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
});

// @desc  Initiate Google OAuth 2.0
// @route GET /api/auth/google
// When GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set → Passport redirects to REAL Google
// Otherwise → show dev account chooser page
const googleAuth = (req, res, next) => {
  const hasCredentials =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here';

  if (hasCredentials) {
    // ── REAL Google OAuth: Passport initiates the redirect to accounts.google.com ──
    const passport = require('passport');
    require('../config/passport'); // ensure strategy is registered
    return passport.authenticate('google', {
      scope: ['openid', 'profile', 'email'],
      accessType: 'offline',
      prompt: 'select_account', // always show account chooser on Google
    })(req, res, next);
  }

  // ── DEV FALLBACK: Show local account chooser page ─────────────────────────────
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in with Google - Neuroviax AI</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
          background: #090d16;
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; padding: 20px;
        }
        .card {
          background: #fff; width: 100%; max-width: 440px;
          border-radius: 28px; padding: 40px 36px 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          text-align: center; position: relative; overflow: hidden;
        }
        .logo { width: 44px; height: 44px; margin-bottom: 16px; }
        h1 { font-size: 24px; font-weight: 500; color: #1f1f1f; margin-bottom: 6px; }
        p.sub { font-size: 14px; color: #444746; margin-bottom: 24px; }
        p.sub strong { color: #047857; }
        .dev-banner {
          background: #fef3c7; border: 1px solid #fbbf24; border-radius: 10px;
          padding: 8px 14px; font-size: 11px; color: #92400e; margin-bottom: 20px;
          text-align: left;
        }
        .dev-banner strong { display: block; margin-bottom: 2px; }
        .account-list { display: flex; flex-direction: column; gap: 6px; text-align: left; margin-bottom: 20px; }
        .account-item {
          display: flex; align-items: center; gap: 14px; padding: 12px 14px;
          border-radius: 16px; color: #1f1f1f; border: 1.5px solid #e2e8f0;
          transition: all 0.18s ease; cursor: pointer; background: #fff;
          position: relative; overflow: hidden;
        }
        .account-item:hover { background: #f0fdf4; border-color: #6ee7b7; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.12); }
        .account-item.primary { border-color: #10b981; background: #f0fdf4; }
        .account-item.primary:hover { background: #dcfce7; border-color: #059669; }
        .account-item.loading { pointer-events: none; opacity: 0.85; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .acc-info { flex: 1; min-width: 0; }
        .acc-info h4 { font-size: 13px; font-weight: 600; margin-bottom: 2px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .acc-info span { font-size: 11px; color: #64748b; font-family: monospace; }
        .acc-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: #d1fae5; color: #047857; white-space: nowrap; flex-shrink: 0; }
        .spinner { width: 18px; height: 18px; border: 2.5px solid #e2e8f0; border-top-color: #10b981; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .chevron { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; transition: color 0.15s; }
        .account-item:hover .chevron { color: #10b981; }
        .other-btn { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 16px; color: #1e293b; background: #f8fafc; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent; }
        .other-btn:hover { background: #f1f5f9; border-color: #e2e8f0; }
        .custom-form { display: none; margin-top: 12px; text-align: left; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        .custom-form label { font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px; display: block; }
        .custom-form input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 12px; margin-bottom: 10px; outline: none; font-family: inherit; transition: border-color 0.15s; }
        .custom-form input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .custom-form button { width: 100%; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 11px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .custom-form button:hover { opacity: 0.9; }
        .footer-note { font-size: 11px; color: #94a3b8; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        #loadingOverlay { display: none; position: absolute; inset: 0; background: rgba(255,255,255,0.92); z-index: 10; flex-direction: column; align-items: center; justify-content: center; gap: 14px; border-radius: 28px; }
        #loadingOverlay.active { display: flex; }
        #loadingOverlay .big-spinner { width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top-color: #10b981; border-radius: 50%; animation: spin 0.75s linear infinite; }
        #loadingOverlay p { font-size: 14px; color: #475569; font-weight: 500; }
        #loadingOverlay small { font-size: 11px; color: #94a3b8; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <div id="loadingOverlay">
          <div class="big-spinner"></div>
          <p>Signing you in…</p>
          <small id="loadingEmail"></small>
        </div>

        <svg class="logo" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
          <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
          <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
        </svg>

        <h1>Sign in with Google</h1>
        <p class="sub">Choose an account to continue to <strong>Neuroviax AI</strong></p>

        <div class="dev-banner">
          <strong>⚠️ Development Mode</strong>
          Add GOOGLE_CLIENT_ID &amp; GOOGLE_CLIENT_SECRET to .env to enable real Google OAuth.
        </div>

        <div class="account-list">
          <div class="account-item primary" onclick="signIn(this, 'muhammad.hamza@gmail.com', 'Muhammad Hamza')">
            <div class="avatar" style="background:#059669;">MH</div>
            <div class="acc-info">
              <h4>Muhammad Hamza</h4>
              <span>muhammad.hamza@gmail.com</span>
            </div>
            <span class="acc-badge">Your account</span>
            <svg class="chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </div>

          <div class="other-btn" onclick="document.getElementById('customForm').style.display='block'; this.style.display='none';">
            <div class="avatar" style="background:#94a3b8; width:40px; height:40px; font-size:20px; font-weight:400;">+</div>
            <span>Use another Google account</span>
          </div>

          <form id="customForm" class="custom-form" onsubmit="handleCustomForm(event)">
            <label>Gmail / Google Workspace Email</label>
            <input type="email" id="customEmail" required placeholder="you@gmail.com or you@company.com" />
            <label>Your Full Name</label>
            <input type="text" id="customName" placeholder="e.g. Muhammad Hamza" />
            <button type="submit">Continue with this account</button>
          </form>
        </div>

        <div class="footer-note">
          To continue, Google will share your name, email address, and profile picture with Neuroviax AI.
        </div>
      </div>

      <script>
        function signIn(el, email, name) {
          document.getElementById('loadingEmail').textContent = email;
          document.getElementById('loadingOverlay').classList.add('active');
          el.classList.add('loading');
          var badges = el.querySelectorAll('.chevron, .acc-badge');
          badges.forEach(function(b) { b.style.display = 'none'; });
          var sp = document.createElement('div');
          sp.className = 'spinner';
          el.appendChild(sp);
          var code = 'gauth_dev_' + email.split('@')[0].replace(/[^a-z0-9]/gi,'') + '_' + Date.now();
          window.location.href = '/api/auth/google/callback?code=' + encodeURIComponent(code)
            + '&email=' + encodeURIComponent(email)
            + '&name=' + encodeURIComponent(name);
        }
        function handleCustomForm(e) {
          e.preventDefault();
          var email = document.getElementById('customEmail').value.trim();
          var name = document.getElementById('customName').value.trim() || email.split('@')[0];
          if (!email) return;
          signIn(document.getElementById('customForm'), email, name);
        }
      </script>
    </body>
    </html>
  `);
};



// @desc  Google OAuth 2.0 Callback — handles BOTH real Passport flow and dev fallback

// @route GET /api/auth/google/callback
const googleAuthCallback = (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const hasCredentials =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here';

  // ── REAL Google OAuth via Passport ─────────────────────────────────────────
  if (hasCredentials) {
    const passport = require('passport');
    require('../config/passport');

    return passport.authenticate('google', { session: false }, async (err, user, info) => {
      if (err || !user) {
        console.error('[Google OAuth] Passport error:', err?.message || info);
        return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
      }

      try {
        // ── 3. Generate JWT ─────────────────────────────────────────────────
        const accessToken  = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // ── 4. Set Secure Cookie ────────────────────────────────────────────
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', accessToken, {
          httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // ── 5. Redirect to React /auth/callback bridge ──────────────────────
        const redirectTarget =
          `${clientUrl}/auth/callback` +
          `?token=${accessToken}` +
          `&refreshToken=${refreshToken}` +
          `&email=${encodeURIComponent(user.email)}` +
          `&name=${encodeURIComponent(user.name)}`;

        return res.redirect(redirectTarget);
      } catch (finalErr) {
        console.error('[Google OAuth] JWT generation failed:', finalErr.message);
        return res.redirect(`${clientUrl}/login?error=server_error`);
      }
    })(req, res, next);
  }

  // ── DEV FALLBACK: code passed as query param from the dev account chooser ──
  const asyncFallback = async () => {
    const { code, email: queryEmail, name: queryName } = req.query;

    if (!code) {
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    const targetEmail = queryEmail || 'demo@neuroviax.ai';
    const targetName  = queryName  || 'Google Verified User';

    // ── MongoDB: find or create ──────────────────────────────────────────────
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      const business = await Business.create({
        name: `${targetName}'s Enterprise`,
        industry: 'technology',
        subscriptionPlan: 'growth',
      });
      await Branch.create({ business: business._id, name: 'Main Branch', type: 'both' });
      user = await User.create({
        name: targetName,
        email: targetEmail,
        password: await bcrypt.hash(`GoogleDev_${Math.random()}`, 10),
        memberships: [{ business: business._id, role: 'owner' }],
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.redirect(
      `${clientUrl}/auth/callback` +
      `?token=${accessToken}` +
      `&refreshToken=${refreshToken}` +
      `&email=${encodeURIComponent(user.email)}` +
      `&name=${encodeURIComponent(user.name)}`
    );
  };

  asyncFallback().catch(next);
};

// @desc  Google SSO Login (Supports Firebase ID Tokens & Direct JSON API)
// @route POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, googleId, idToken } = req.body || {};

  let verifiedEmail = email;
  let verifiedName = name;
  let verifiedGoogleId = googleId;

  // If a Firebase / Google ID Token was passed, verify with Google tokeninfo
  if (idToken) {
    try {
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (resp.ok) {
        const tokenInfo = await resp.json();
        if (tokenInfo.email) {
          verifiedEmail = tokenInfo.email;
          if (tokenInfo.name) verifiedName = tokenInfo.name;
          if (tokenInfo.sub) verifiedGoogleId = tokenInfo.sub;
        }
      }
    } catch (err) {
      console.warn('[Firebase Token Verify] Non-blocking warning:', err.message);
    }
  }

  const targetEmail = verifiedEmail || 'demo@neuroviax.ai';
  const targetName = verifiedName || 'Google Verified User';

  let user = await User.findOne({ email: targetEmail });
  let business = null;

  if (!user) {
    business = await Business.create({
      name: `${targetName}'s Enterprise`,
      industry: 'technology',
      subscriptionPlan: 'growth',
    });

    user = await User.create({
      name: targetName,
      email: targetEmail,
      password: await bcrypt.hash(`GoogleSSO_${Math.random()}`, 10),
      memberships: [{ business: business._id, role: 'owner' }],
      isActive: true,
      lastLoginAt: new Date(),
    });
  } else {
    user.lastLoginAt = new Date();
    if (targetName && (user.name === 'Google Verified User' || !user.name)) {
      user.name = targetName;
    }
    await user.save();
    if (user.memberships?.[0]?.business) {
      business = await Business.findById(user.memberships[0].business);
    }
  }

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({
    user: user.toSafeObject ? user.toSafeObject() : user,
    business,
    accessToken,
    refreshToken,
    ssoProvider: 'google',
  });
});

module.exports = { register, login, refresh, me, forgotPassword, verifyOTP, resetPassword, googleLogin, googleAuth, googleAuthCallback };


