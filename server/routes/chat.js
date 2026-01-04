const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get messages between two users
router.get('/:otherUserId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.otherUserId },
                { sender: req.params.otherUserId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
