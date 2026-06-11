const express = require('express');
const router  = express.Router();
const FAQ     = require('../models/FAQ');

// GET /api/faqs  — search, category filter, sort
router.get('/', async (req, res) => {
  try {
    const { search, category, sort = 'latest' } = req.query;

    let query = { status: 'approved' };

    if (category && category !== 'All') query.category = category;

    if (search && search.trim()) {
      const rx = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { question: rx }, { answer: rx },
        { tags: rx },     { keywords: rx }, { category: rx },
      ];
    }

    const sortMap = { helpful: { helpfulYes: -1 }, views: { views: -1 }, latest: { createdAt: -1 } };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const faqs = await FAQ.find(query).sort(sortOption);
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faqs/categories  — distinct approved categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await FAQ.distinct('category', { status: 'approved' });
    res.json(cats.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/faqs/related?category=<cat>&tags=<tag1,tag2>&exclude=<id>
 * "People like you also asked" — finds FAQs in the same category / sharing tags.
 * Returns up to 4 results, excluding the specified FAQ id.
 */
router.get('/related', async (req, res) => {
  try {
    const { category, tags, exclude } = req.query;
    const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const query = { status: 'approved' };
    if (exclude) query._id = { $ne: exclude };

    // Build OR: same category OR any matching tag
    const orClauses = [];
    if (category && category !== 'General') orClauses.push({ category });
    if (tagList.length) orClauses.push({ tags: { $in: tagList } });

    if (orClauses.length) query.$or = orClauses;

    const related = await FAQ.find(query)
      .sort({ helpfulYes: -1, views: -1 })
      .limit(4)
      .select('question category tags helpfulYes views');

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faqs/:id  — single FAQ + increment views
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faqs/:id/vote  — { vote: 'yes' | 'no' }
router.post('/:id/vote', async (req, res) => {
  try {
    const { vote } = req.body;
    if (!['yes', 'no'].includes(vote))
      return res.status(400).json({ error: 'vote must be "yes" or "no"' });

    const inc = vote === 'yes' ? { helpfulYes: 1 } : { helpfulNo: 1 };
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $inc: inc }, { new: true });
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });

    res.json({ helpfulYes: faq.helpfulYes, helpfulNo: faq.helpfulNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
