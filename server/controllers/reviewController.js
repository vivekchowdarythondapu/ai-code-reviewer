const Review = require('../models/Review');
const User = require('../models/User');
const { reviewCode } = require('../services/aiService');
const { runCode } = require('../services/compilerService');

// Submit code for review
exports.createReview = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const aiResult = await reviewCode(code, language);

    const review = await Review.create({
      userId: req.user.id,
      code,
      optimizedCode: aiResult.optimizedCode,
      language,
      score: aiResult.score,
      summary: aiResult.summary,
      complexity: aiResult.complexity,
      issues: aiResult.issues
    });

    const user = await User.findById(req.user.id);
    user.totalReviews += 1;

    const allReviews = await Review.find({ userId: req.user.id });
    const totalScore = allReviews.reduce((sum, r) => sum + r.score, 0);
    user.avgScore = Math.round(totalScore / allReviews.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.streak.lastActive
      ? new Date(user.streak.lastActive)
      : null;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak.current += 1;
      } else if (diffDays > 1) {
        user.streak.current = 1;
      }
    } else {
      user.streak.current = 1;
    }

    user.streak.lastActive = new Date();
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    await user.save();

    res.status(201).json({
      review: {
        _id: review._id,
        language: review.language,
        detectedLanguage: aiResult.detectedLanguage,
        languageMismatch: aiResult.languageMismatch,
        score: review.score,
        summary: review.summary,
        complexity: review.complexity,
        optimizedCode: review.optimizedCode,
        issues: review.issues,
        createdAt: review.createdAt
      },
      userStats: {
        totalReviews: user.totalReviews,
        avgScore: user.avgScore,
        streak: user.streak
      }
    });

  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ message: 'Failed to review code', error: err.message });
  }
};

// Get all reviews for logged in user
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-code');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Execute code using Piston
exports.executeCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    const result = await runCode(code, language, stdin || '');
    res.json(result);
  } catch (err) {
    console.error('Execution error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to run code' });
  }
};