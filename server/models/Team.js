const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const snippetSchema = new mongoose.Schema({
  code: String,
  language: String,
  sharedBy: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiReview: {
    score: Number,
    summary: String,
    issues: Array
  },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  }],
  inviteCode: { type: String, unique: true },
  snippets: [snippetSchema]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);