const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    body:        { type: String, required: true, trim: true },
    author:      { type: String, default: 'Anonymous', trim: true },
    authorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    upvotes:     { type: Number, default: 0 },
    upvotedBy:   [{ type: String }], // user emails — prevents double-voting
    confidence:  { type: Number, default: null }, // 0–100 AI-derived confidence score
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', answerSchema);
