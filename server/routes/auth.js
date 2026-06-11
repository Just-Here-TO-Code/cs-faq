const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FAQ  = require('../models/FAQ');
const { signToken, requireAuth } = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id:        user._id,
    name:      user.name,
    email:     user.email,
    points:    user.points   || 0,
    level:     user.level    || 'Beginner',
    stats:     user.stats    || {},
    savedFAQs: user.savedFAQs || [],
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ name: name.trim(), email: email.trim(), password });
    const token = signToken(user._id);

    res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — full profile with resolved saved FAQs
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedFAQs');
    res.json({ user: { ...publicUser(user), savedFAQs: user.savedFAQs || [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/save-faq/:faqId — toggle save/unsave
router.post('/save-faq/:faqId', requireAuth, async (req, res) => {
  try {
    const { faqId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const idx = user.savedFAQs.findIndex(id => id.toString() === faqId);
    let saved;
    if (idx === -1) {
      // Verify FAQ exists
      const faq = await FAQ.findById(faqId);
      if (!faq) return res.status(404).json({ error: 'FAQ not found' });
      user.savedFAQs.push(faqId);
      saved = true;
    } else {
      user.savedFAQs.splice(idx, 1);
      saved = false;
    }
    await user.save();
    res.json({ saved, savedFAQs: user.savedFAQs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
