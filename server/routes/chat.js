const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get messages between two users
router.get('/:otherUserId', authMiddleware, async (req, res) => {
    try {
        const { limit } = req.query;
        let query = Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.otherUserId },
                { sender: req.params.otherUserId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const messages = await query;
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark messages as read
router.patch('/:otherUserId/read', authMiddleware, async (req, res) => {
    try {
        await Message.updateMany(
            { sender: req.params.otherUserId, receiver: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: "Messages marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
