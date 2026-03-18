const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getAuth } = require('firebase-admin/auth');
const admin = require("../firebaseAdmin")
const router = express.Router();

const serializeUser = (user, extra = {}) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    name: user.name,
    bio: user.bio,
    location: user.location,
    website: user.website,
    phone: user.phone,
    ...extra,
});


/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500: 
 *         description: internal error
 */

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email: normalizedEmail, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: serializeUser(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500: 
 *         description: internal error
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: serializeUser(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/google-auth", async (req, res) => {
    try {

        console.log(req.body);
        const { stsTokenManager } = req.body;

        const firebaseToken = stsTokenManager.accessToken;

        const decodedToken = await getAuth().verifyIdToken(firebaseToken);

        const { uid, email, name, picture } = decodedToken;

        let user = await User.findOne({ email });
        console.log(user?.authProvider);
 if(user && user.authProvider !== "google"){
            return res.status(200).json({message : `Last time you have created account through ${user?.authProvider?.toUpperCase()}!! Pleae try with that only!!`})
        }
        if (!user) {
            user = new User({
                username: name?.replace(/\s+/g, "").toLowerCase(),
                email: email,
                googleId: uid,
                avatar: picture,
                name : name,
                authProvider: "google",
            });

            await user.save();
        }


        if (user) {
            user.avatar = picture
        }

        user.authProvider = "google"
        await user.save();

        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token: jwtToken,
            user: serializeUser(user, {
                isFirstLogin: false,
            }),
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


router.post("/github-auth", async (req, res) => {
    try {
        const { stsTokenManager } = req.body;

        const firebaseToken = stsTokenManager.accessToken;

        const decodedToken = await getAuth().verifyIdToken(firebaseToken);

        const { uid, email, name, picture } = decodedToken;

        let user = await User.findOne({ email });
        
        if(user && user.authProvider !== "github"){
            return res.status(200).json({message : `Last time you have created account through ${user.authProvider.toUpperCase()}!! Pleae try with that only!!`})
        }

        if (!user) {
            user = new User({
                username: name?.replace(/\s+/g, "").toLowerCase() || email.split("@")[0],
                email: email,
                githubId: uid,
                avatar: picture,
                authProvider: "github",
                name : name
            });

            await user.save();
        }

        // update avatar if changed
        if (picture) {
            user.avatar = picture;
            await user.save();
        }

        user.authProvider = "github";
        await user.save();

        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token: jwtToken,
            user: serializeUser(user, {
                isFirstLogin: false,
            }),
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/google-auth-mobile", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { idToken } = req.body;

    // ✅ Validate input
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    // ✅ Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const {
      uid,
      email,
      name = "",
      picture = "",
    } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: "Email not found in token" });
    }

    let user = await User.findOne({ email });

    // ❌ Prevent login with different provider
    if (user && user.authProvider !== "google") {
      return res.status(400).json({
        message: `Last time you used ${user.authProvider.toUpperCase()} login. Please use that.`,
      });
    }

    let isFirstLogin = false;

    // ✅ Create user if not exists
    if (!user) {
      isFirstLogin = true;

      user = new User({
        username:
          name?.replace(/\s+/g, "").toLowerCase() ||
          email.split("@")[0],
        email,
        googleId: uid,
        avatar: picture,
        name,
        authProvider: "google",
      });

      await user.save();
    }

    // ✅ Update latest info (important)
    user.avatar = picture || user.avatar;
    user.name = name || user.name;
    user.authProvider = "google";

    await user.save();

    // ✅ Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token: jwtToken,
      user: serializeUser(user, { isFirstLogin }),
    });

  } catch (error) {
    console.log("❌ ERROR:", error);

    return res.status(500).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
});

module.exports = router;
