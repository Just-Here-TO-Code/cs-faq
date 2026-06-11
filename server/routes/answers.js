const express  = require('express');
const router   = express.Router();
const Answer   = require('../models/Answer');
const Question = require('../models/Question');
const FAQ      = require('../models/FAQ');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// ── Points config ─────────────────────────────────────────────────────────────
const PTS = {
  ANSWER_SUBMITTED: 5,
  ANSWER_APPROVED:  15,
  UPVOTE_RECEIVED:  10,
};

async function awardPoints(userId, delta, statField) {
  if (!userId) return;
  try {
    const inc = { points: delta };
    if (statField) inc[`stats.${statField}`] = 1;
    const user = await User.findByIdAndUpdate(userId, { $inc: inc }, { new: true });
    if (user) {
      user.recalcLevel();
      await user.save();
    }
  } catch { /* silent — reputation is non-critical */ }
}

/**
 * Compute a confidence score (0–100) for an answer body against the parent question.
 * Uses keyword overlap between the answer and approved FAQs — same logic as /api/suggest.
 */
async function computeConfidence(questionTitle, questionDesc, answerBody) {
  try {
    const STOP = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'how', 'why',
      'this', 'that', 'these', 'those', 'with', 'from', 'have', 'will',
      'they', 'them', 'their', 'there', 'been', 'would', 'could', 'should',
      'does', 'just', 'some', 'than', 'then', 'also', 'into', 'about',
      'more', 'very', 'much', 'many', 'such', 'your', 'please',
    ]);

    const questionWords = new Set(
      `${questionTitle} ${questionDesc}`.toLowerCase()
        .split(/\W+/).filter(w => w.length > 3 && !STOP.has(w))
    );
    const answerWords = new Set(
      answerBody.toLowerCase()
        .split(/\W+/).filter(w => w.length > 3 && !STOP.has(w))
    );

    if (!questionWords.size || !answerWords.size) return null;

    // Find related FAQs to cross-check answer relevance
    const faqs = await FAQ.find({ status: 'approved' }).limit(100);
    if (!faqs.length) return null;

    // Score: what % of question keywords does the answer address?
    const coverageWords = [...questionWords].filter(w => answerWords.has(w));
    const coverage = coverageWords.length / questionWords.size;

    // Also check how well the answer aligns with FAQ content
    let bestFaqOverlap = 0;
    for (const faq of faqs) {
      const corpus = [faq.question, faq.answer, ...(faq.tags || []), ...(faq.keywords || [])]
        .join(' ').toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const faqWords = new Set(corpus);
      const overlap = [...answerWords].filter(w => faqWords.has(w)).length / Math.max(answerWords.size, 1);
      if (overlap > bestFaqOverlap) bestFaqOverlap = overlap;
    }

    // Blend: 60% answer coverage of question + 40% FAQ knowledge alignment
    const score = (coverage * 0.6 + bestFaqOverlap * 0.4);
    return Math.min(100, Math.round(score * 100));
  } catch {
    return null;
  }
}

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

// POST /api/answers  — requires auth; awards points on submit; computes confidence
router.post('/', requireAuth, async (req, res) => {
  try {
    const { questionId, body } = req.body;
    if (!questionId || !body)
      return res.status(400).json({ error: 'questionId and body are required.' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Compute confidence score
    const confidence = await computeConfidence(question.title, question.description, body);

    const answer = new Answer({
      questionId,
      body,
      author:   req.user.name,
      authorId: req.user._id,
      status:   'pending',
      confidence,
    });
    const saved = await answer.save();

    await Question.findByIdAndUpdate(questionId, { $inc: { answerCount: 1 } });

    // Award points for submitting
    await awardPoints(req.user._id, PTS.ANSWER_SUBMITTED, 'answersGiven');

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

    const prev   = await Answer.findById(req.params.id);
    if (!prev) return res.status(404).json({ error: 'Answer not found' });

    const answer = await Answer.findByIdAndUpdate(req.params.id, { status }, { new: true });

    // Award approval bonus (only when transitioning to approved)
    if (status === 'approved' && prev.status !== 'approved' && prev.authorId) {
      await awardPoints(prev.authorId, PTS.ANSWER_APPROVED, 'answersApproved');
    }
    // Reverse approval points if moving away from approved
    if (prev.status === 'approved' && status !== 'approved' && prev.authorId) {
      await awardPoints(prev.authorId, -PTS.ANSWER_APPROVED, null);
      await User.findByIdAndUpdate(prev.authorId, { $inc: { 'stats.answersApproved': -1 } });
    }

    res.json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/answers/:id/upvote  — toggle upvote (requires auth)
router.post('/:id/upvote', requireAuth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const voterEmail = req.user.email;
    const alreadyVoted = answer.upvotedBy.includes(voterEmail);

    if (alreadyVoted) {
      answer.upvotes   = Math.max(0, answer.upvotes - 1);
      answer.upvotedBy = answer.upvotedBy.filter(e => e !== voterEmail);
      await answer.save();
      if (answer.authorId) {
        await awardPoints(answer.authorId, -PTS.UPVOTE_RECEIVED, null);
        await User.findByIdAndUpdate(answer.authorId, { $inc: { 'stats.upvotesReceived': -1 } });
      }
    } else {
      answer.upvotes += 1;
      answer.upvotedBy.push(voterEmail);
      await answer.save();
      if (answer.authorId) await awardPoints(answer.authorId, PTS.UPVOTE_RECEIVED, 'upvotesReceived');
    }

    res.json({ upvotes: answer.upvotes, voted: !alreadyVoted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
