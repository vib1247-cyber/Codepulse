import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed'],
    default: 'waiting'
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

// Create a unique index on roomId
interviewSchema.index({ roomId: 1 }, { unique: true });

// Method to check if a user is a participant in this interview
interviewSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant._id.toString() === userId.toString() ||
    (typeof participant === 'string' && participant === userId.toString())
  );
};

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
