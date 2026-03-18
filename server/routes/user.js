const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

const normalizeWebsite = (website = '') => {
    const trimmed = website.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username email online avatar').populate('pendingRequests', 'username email');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { username, email, name, avatar, bio, location, website, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (typeof username === 'string') {
            const normalizedUsername = username.trim();

            if (!normalizedUsername) {
                return res.status(400).json({ message: 'Username is required' });
            }

            const existingUsername = await User.findOne({
                username: normalizedUsername,
                _id: { $ne: req.user.id }
            });

            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            user.username = normalizedUsername;
        }

        if (typeof email === 'string') {
            const normalizedEmail = email.trim().toLowerCase();

            if (!normalizedEmail) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const existingEmail = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: req.user.id }
            });

            if (existingEmail) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            user.email = normalizedEmail;
        }

        if (typeof name === 'string') user.name = name.trim();
        if (typeof avatar === 'string') user.avatar = avatar.trim();
        if (typeof bio === 'string') user.bio = bio.trim();
        if (typeof location === 'string') user.location = location.trim();
        if (typeof website === 'string') user.website = normalizeWebsite(website);
        if (typeof phone === 'string') user.phone = phone.trim();

        await user.save();

        const updatedUser = await User.findById(req.user.id)
            .populate('friends', 'username email online avatar')
            .populate('pendingRequests', 'username email');

        return res.json(updatedUser);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        const myId = req.user.id;

        // Get current user to check relations
        const currentUser = await User.findById(myId);

        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: myId }
        }).select('username email avatar name');

        // Add flags
        const updatedUsers = users.map(user => {
            const isPending = currentUser.pendingRequests.some(
                id => id.toString() === user._id.toString()
            );

            const isSent = currentUser.sentRequests.some(
                id => id.toString() === user._id.toString()
            );

            return {
                ...user.toObject(),
                isPending, // they sent you request
                isSent     // you sent them request
            };
        });

        res.json(updatedUsers);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Discover users (suggestions)
router.get('/discover', authMiddleware, async (req, res) => {
    try {
        const myId = req.user.id;

        const currentUser = await User.findById(myId);

        const users = await User.find({
            _id: {
                $nin: [
                    ...currentUser.friends,
                    ...currentUser.sentRequests,
                    ...currentUser.pendingRequests, // ✅ include this
                    myId
                ]
            }
        })
            .select('username email avatar name')
            .limit(10);

        // Add flags (for safety / frontend consistency)
        const updatedUsers = users.map(user => {
            const isPending = currentUser.pendingRequests.some(
                id => id.toString() === user._id.toString()
            );

            const isSent = currentUser.sentRequests.some(
                id => id.toString() === user._id.toString()
            );

            const isFriend = currentUser.friends.some(
                id => id.toString() === user._id.toString()
            );

            return {
                ...user.toObject(),
                isPending,
                isSent,
                isFriend
            };
        });

        res.json(updatedUsers);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Send friend request
router.post('/friend-request', authMiddleware, async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user.id;

        if (requesterId === recipientId) return res.status(400).json({ message: "Cannot add yourself" });

        const recipient = await User.findById(recipientId);
        const requester = await User.findById(requesterId);

        if (recipient.pendingRequests.includes(requesterId) || recipient.friends.includes(requesterId)) {
            return res.status(400).json({ message: "Already requested or friends" });
        }

        recipient.pendingRequests.push(requesterId);
        requester.sentRequests.push(recipientId);

        await recipient.save();
        await requester.save();

        res.json({ message: "Friend request sent", success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Accept friend request
router.post('/accept-request', authMiddleware, async (req, res) => {
    try {
        const { requesterId } = req.body;
        const recipientId = req.user.id;

        const recipient = await User.findById(recipientId);
        const requester = await User.findById(requesterId);

        recipient.pendingRequests = recipient.pendingRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== recipientId);

        recipient.friends.push(requesterId);
        requester.friends.push(recipientId);

        await recipient.save();
        await requester.save();

        res.json({ success: true, message: "Friend request accepted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post("/remove-friend-request", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body; // the other person (sender or receiver)
        const myId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const me = await User.findById(myId);
        const otherUser = await User.findById(userId);

        if (!me || !otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Case 1: I sent request → cancel it
        if (me.sentRequests.includes(userId)) {
            me.sentRequests = me.sentRequests.filter(
                id => id.toString() !== userId
            );

            otherUser.pendingRequests = otherUser.pendingRequests.filter(
                id => id.toString() !== myId
            );
        }

        // Case 2: I received request → decline it
        if (me.pendingRequests.includes(userId)) {
            me.pendingRequests = me.pendingRequests.filter(
                id => id.toString() !== userId
            );

            otherUser.sentRequests = otherUser.sentRequests.filter(
                id => id.toString() !== myId
            );
        }

        await me.save();
        await otherUser.save();

        return res.status(200).json({
            success: true,
            message: "Friend request removed",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});
// Get single user info
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username email avatar online name bio location website phone createdAt friends');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post("/get-friend-request", authMiddleware, async (req, res) => {
    try {
        // console.log(req)
        const myId = req.user.id;

        const user = await User.findById(myId).populate({
            path: "pendingRequests",
            select: "username email name avatar", // only required fields
        });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        return res.status(200).json({
            success: true,
            requests: user.pendingRequests,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/get-sented-friend-request", authMiddleware, async (req, res) => {
    try {
        const myId = req.user.id;

        const user = await User.findById(myId).populate({
            path: "sentRequests",
            select: "username email name avatar"
        })

        return res.status(200).json({
            success: true,
            requests: user.sentRequests,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
})
module.exports = router;
