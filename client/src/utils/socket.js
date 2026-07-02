import { io } from 'socket.io-client';

const socket = io('https://ai-code-reviewer-backend-kkgt.onrender.com');

export default socket;