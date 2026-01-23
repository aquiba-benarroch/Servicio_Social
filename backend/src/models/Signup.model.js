// ========================================
// SIGNUP MODEL
// ========================================

const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  },
  hoursCompleted: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
signupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent duplicate signups
signupSchema.index({ opportunityId: 1, volunteerId: 1 }, { unique: true });

signupSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Signup', signupSchema);
