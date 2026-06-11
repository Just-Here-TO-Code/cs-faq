const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    // Reputation
    points:   { type: Number, default: 0 },
    level:    { type: String, enum: ['Beginner', 'Contributor', 'Expert'], default: 'Beginner' },
    stats: {
      answersGiven:    { type: Number, default: 0 },
      answersApproved: { type: Number, default: 0 },
      questionsAsked:  { type: Number, default: 0 },
      upvotesReceived: { type: Number, default: 0 },
    },
    // Saved FAQs
    savedFAQs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FAQ' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** Recompute level based on current points */
userSchema.methods.recalcLevel = function () {
  if (this.points >= 200) this.level = 'Expert';
  else if (this.points >= 50) this.level = 'Contributor';
  else this.level = 'Beginner';
};

module.exports = mongoose.model('User', userSchema);
