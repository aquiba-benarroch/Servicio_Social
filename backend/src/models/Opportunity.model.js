// ========================================
// OPPORTUNITY MODEL
// ========================================

const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  category: {
    type: String,
    enum: ['educacion', 'salud', 'medio_ambiente', 'asistencia_social', 'cultura', 'otro'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  dateStart: {
    type: Date,
    required: true
  },
  dateEnd: {
    type: Date,
    required: true
  },
  timeStart: {
    type: String,
    trim: true
  },
  timeEnd: {
    type: String,
    trim: true
  },
  totalSlots: {
    type: Number,
    required: true,
    min: 1
  },
  remainingSlots: {
    type: Number,
    required: true,
    min: 0
  },
  requirements: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'cancelled', 'completed'],
    default: 'draft'
  },
  image: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
opportunitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

opportunitySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
