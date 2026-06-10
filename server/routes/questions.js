const express  = require('express');
const router   = express.Router();
const Question = require('../models/Question');
const FAQ      = require('../models/FAQ');
const { requireAuth } = require('../middleware/auth');

const SPAM_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// GET /api/questions  — list with status/category/search filters
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (search && search.trim()) {
      const rx = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: rx }, { description: rx }, { name: rx }];
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions/similar?q=  — duplicate / similar detection
router.get('/similar', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 4) return res.json({ faqs: [], questions: [] });

    // Build OR from meaningful words (>3 chars)
    const words = q.trim().split(/\s+/).filter(w => w.length > 3);
    if (!words.length) return res.json({ faqs: [], questions: [] });

    const rx = { $regex: words.join('|'), $options: 'i' };

    const [faqs, questions] = await Promise.all([
      FAQ.find({ $or: [{ question: rx }, { keywords: rx }, { tags: rx }], status: 'approved' }).limit(4),
      Question.find({ title: rx, status: { $in: ['pending', 'approved'] } }).limit(3),
    ]);

    res.json({ faqs, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions  — requires auth; spam prevention by email
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const name = req.user.name;
    const email = req.user.email;

    if (!title || !description)
      return res.status(400).json({ error: 'Title and description are required.' });

    // Spam check — same email within 1 hour
    const oneHourAgo = new Date(Date.now() - SPAM_WINDOW_MS);
    const recent = await Question.findOne({ email: email.toLowerCase(), createdAt: { $gte: oneHourAgo } });
    if (recent) {
      const waitMin = Math.ceil((recent.createdAt.getTime() + SPAM_WINDOW_MS - Date.now()) / 60000);
      return res.status(429).json({
        error: `You already submitted a question recently. Please wait ${waitMin} more minute(s).`,
      });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []);

    const question = new Question({
      name, email: email.toLowerCase(), title, description,
      category: category || 'General', tags: parsedTags, status: 'pending',
    });
    const saved = await question.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/questions/:id/status  — approve | reject | pending
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status.' });

    const q = await Question.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!q) return res.status(404).json({ error: 'Question not found' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
