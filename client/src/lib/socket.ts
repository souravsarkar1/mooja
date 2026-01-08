/// <reference types="vite/client" />
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://mooja-server.onrender.com/';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});
