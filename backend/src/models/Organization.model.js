// ========================================
// ORGANIZATION MODEL
// ========================================

const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['educacion', 'salud', 'medio_ambiente', 'asistencia_social', 'cultura', 'otro'],
    required: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  adminId: {
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
organizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

organizationSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
