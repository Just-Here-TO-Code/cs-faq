const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category:    { type: String, default: 'General', trim: true },
    tags:        [{ type: String, trim: true }],
    status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    answerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
