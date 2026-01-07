const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.send('Chat API is running...'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

const Message = require('./models/Message');
const User = require('./models/User');

// Track online users: Map<userId, socketId>
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId) => {
        if (!userId) return;
        const uid = userId.toString();
        socket.join(uid);
        userSockets.set(uid, socket.id);

        try {
            await User.findByIdAndUpdate(uid, { online: true });
            io.emit('user-status-change', { userId: uid, online: true });
            console.log(`User ${uid} is now online and joined room`);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('send-message', async (data) => {
        const { sender, receiver, content, type } = data;
        try {
            const newMessage = new Message({ sender, receiver, content, type });
            await newMessage.save();
            io.to(receiver).emit('receive-message', newMessage);
            io.to(sender).emit('receive-message', newMessage);
        } catch (err) {
            console.error(err);
        }
    });

    // Typing Indicators
    socket.on('typing', (data) => {
        // data: { senderId, receiverId }
        io.to(data.receiverId).emit('user-typing', { senderId: data.senderId });
    });

    socket.on('stop-typing', (data) => {
        io.to(data.receiverId).emit('user-stop-typing', { senderId: data.senderId });
    });

    // Signaling for Video/Audio Calls
    socket.on('call-user', (data) => {
        const { userToCall, signalData, from, name } = data;
        if (!userToCall) return;
        console.log(`[CALL] Initiated: from ${from} to ${userToCall}`);
        io.to(userToCall.toString()).emit('incoming-call', {
            signal: signalData,
            from: from.toString(),
            name
        });
    });

    socket.on('answer-call', (data) => {
        if (data.to) {
            console.log(`[CALL] Answered by ${socket.id} to ${data.to}`);
            io.to(data.to.toString()).emit('call-accepted', data.signal);
        }
    });

    socket.on('end-call', (data) => {
        if (data.to) {
            console.log(`[CALL] Ended by ${socket.id} to ${data.to}`);
            io.to(data.to.toString()).emit('call-ended');
        }
    });


    socket.on('disconnect', async () => {
        let disconnectedUserId = null;
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            userSockets.delete(disconnectedUserId);
            try {
                await User.findByIdAndUpdate(disconnectedUserId, { online: false });
                io.emit('user-status-change', { userId: disconnectedUserId, online: false });
                console.log(`User ${disconnectedUserId} is now offline`);
            } catch (err) {
                console.error(err);
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

