const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://ai-code-reviewer-flax-sigma.vercel.app'],
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-code-reviewer-flax-sigma.vercel.app']
}));
app.use(express.json());

// Attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/review', require('./routes/review'));
app.use('/api/team', require('./routes/team'));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join team room
  socket.on('join-team', (teamId) => {
    socket.join(`team-${teamId}`);
    console.log(`User joined team room: team-${teamId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));