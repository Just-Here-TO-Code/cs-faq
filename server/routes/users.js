const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Answer   = require('../models/Answer');
const Question = require('../models/Question');
const { requireAuth } = require('../middleware/auth');

// GET /api/users/leaderboard  — top contributors by points
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const users = await User
      .find({ points: { $gt: 0 } })
      .select('name points level stats createdAt')
      .sort({ points: -1 })
      .limit(limit);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me/profile — authenticated detailed profile
router.get('/me/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedFAQs');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch recent questions and answers by this user
    const [questions, answers] = await Promise.all([
      Question.find({ email: user.email }).sort({ createdAt: -1 }).limit(10),
      Answer.find({ authorId: user._id }).sort({ createdAt: -1 }).limit(10).populate('questionId', 'title'),
    ]);

    res.json({
      id:        user._id,
      name:      user.name,
      email:     user.email,
      points:    user.points   || 0,
      level:     user.level    || 'Beginner',
      stats:     user.stats    || {},
      savedFAQs: user.savedFAQs || [],
      createdAt: user.createdAt,
      questions,
      answers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id/profile  — public profile
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User
      .findById(req.params.id)
      .select('name points level stats createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
