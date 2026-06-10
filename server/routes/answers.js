const express  = require('express');
const router   = express.Router();
const Answer   = require('../models/Answer');
const Question = require('../models/Question');
const { requireAuth } = require('../middleware/auth');

// GET /api/answers/:questionId  — optional ?status= filter
router.get('/:questionId', async (req, res) => {
  try {
    const query = { questionId: req.params.questionId };
    if (req.query.status) query.status = req.query.status;
    const answers = await Answer.find(query).sort({ createdAt: 1 });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/answers  — requires auth
router.post('/', requireAuth, async (req, res) => {
  try {
    const { questionId, body } = req.body;
    if (!questionId || !body)
      return res.status(400).json({ error: 'questionId and body are required.' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const answer = new Answer({ questionId, body, author: req.user.name, status: 'pending' });
    const saved  = await answer.save();

    await Question.findByIdAndUpdate(questionId, { $inc: { answerCount: 1 } });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/answers/:id/status  — approve | reject | pending
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status.' });

    const answer = await Answer.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
