const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTeam,
  joinTeam,
  getMyTeams,
  getTeam,
  shareSnippet,
  addComment
} = require('../controllers/teamController');

router.post('/', auth, createTeam);
router.post('/join', auth, joinTeam);
router.get('/', auth, getMyTeams);
router.get('/:id', auth, getTeam);
router.post('/:id/snippets', auth, shareSnippet);
router.post('/:id/snippets/:snippetId/comments', auth, addComment);

module.exports = router;