const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createReview,
  getMyReviews,
  getReviewById,
  deleteReview,
  executeCode
} = require('../controllers/reviewController');

router.post('/', auth, createReview);
router.get('/', auth, getMyReviews);
router.get('/:id', auth, getReviewById);
router.delete('/:id', auth, deleteReview);
router.post('/run', auth, executeCode);

module.exports = router;