const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    internshipDomain: {
      type: String,
      required: [true, 'Internship domain is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure endDate is after startDate
studentSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

studentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.startDate && update.endDate && new Date(update.endDate) <= new Date(update.startDate)) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
