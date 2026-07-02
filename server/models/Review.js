const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  line: { type: Number, default: null },
  lineEnd: { type: Number, default: null },
  type: { type: String, enum: ['bug', 'security', 'performance', 'style'] },
  severity: { type: String, enum: ['critical', 'warning', 'suggestion'] },
  message: { type: String },
  before: { type: String },
  after: { type: String },
  complexityImpact: {
    timeBefore: { type: String, default: null },
    timeAfter: { type: String, default: null },
    spaceBefore: { type: String, default: null },
    spaceAfter: { type: String, default: null }
  }
});

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  score: { type: Number, required: true },
  summary: { type: String },
  complexity: {
    time: {
      current: String,
      optimized: String,
      explanation: String
    },
    space: {
      current: String,
      optimized: String,
      explanation: String
    }
  },
  issues: [issueSchema]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);