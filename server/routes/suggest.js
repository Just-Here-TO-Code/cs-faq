const express = require('express');
const router  = express.Router();
const FAQ     = require('../models/FAQ');

/**
 * GET /api/suggest?q=<question text>
 *
 * AI-Powered Suggested Answer (no external API key required).
 * Finds approved FAQs that closely match the question text using word-overlap
 * scoring, then synthesises a suggestion from the best match.
 *
 * Response:
 *   { suggestion: string | null, basedOn: FAQ | null, confidence: number }
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 4) {
      return res.json({ suggestion: null, basedOn: null, confidence: 0 });
    }

    const queryText = q.trim().toLowerCase();

    // Tokenise — words > 3 chars, strip common stop words
    const STOP = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'how', 'why',
      'this', 'that', 'these', 'those', 'with', 'from', 'have', 'will',
      'they', 'them', 'their', 'there', 'been', 'would', 'could', 'should',
      'does', 'just', 'some', 'than', 'then', 'also', 'into', 'about',
      'more', 'very', 'much', 'many', 'such', 'your', 'your', 'please',
    ]);

    const keywords = [...new Set(
      queryText.split(/\W+/).filter(w => w.length > 3 && !STOP.has(w))
    )];

    if (!keywords.length) {
      return res.json({ suggestion: null, basedOn: null, confidence: 0 });
    }

    // Pull all approved FAQs (capped to keep it fast)
    const faqs = await FAQ.find({ status: 'approved' }).limit(200);

    // Score each FAQ by word-overlap across question + answer + tags + keywords
    const scored = faqs.map(faq => {
      const corpus = [
        faq.question,
        faq.answer,
        ...(faq.tags     || []),
        ...(faq.keywords || []),
      ].join(' ').toLowerCase();

      const hits = keywords.filter(w => corpus.includes(w)).length;
      // Normalised score: hits / total keywords
      const score = hits / keywords.length;
      return { faq, score, hits };
    }).filter(x => x.score > 0);

    if (!scored.length) {
      return res.json({ suggestion: null, basedOn: null, confidence: 0 });
    }

    // Pick best match
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    // Compose a suggestion from the matching FAQ answer
    const CONFIDENCE_THRESHOLD = 0.25; // at least 25 % keyword overlap
    if (best.score < CONFIDENCE_THRESHOLD) {
      return res.json({ suggestion: null, basedOn: null, confidence: best.score });
    }

    const suggestion =
      `Based on existing FAQs: "${best.faq.answer}"` +
      ` (Source: "${best.faq.question}")`;

    res.json({
      suggestion,
      basedOn:    best.faq,
      confidence: parseFloat(best.score.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
