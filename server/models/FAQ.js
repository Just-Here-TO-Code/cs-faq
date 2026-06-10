const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    tags:     [{ type: String, trim: true }],
    keywords: [{ type: String, trim: true }],
    status:   { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    helpfulYes: { type: Number, default: 0 },
    helpfulNo:  { type: Number, default: 0 },
    views:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FAQ', faqSchema);
