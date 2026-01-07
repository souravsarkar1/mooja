const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username email online avatar').populate('pendingRequests', 'username email');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: req.user.id }
        }).select('username email avatar');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Discover users (suggestions)
router.get('/discover', authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const users = await User.find({
            _id: { $nin: [...currentUser.friends, ...currentUser.sentRequests, req.user.id] }
        })
            .select('username email avatar')
            .limit(10);
        res.json(users);
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

        res.json({ message: "Friend request sent" });
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

        res.json({ message: "Friend request accepted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single user info
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username email avatar online');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
