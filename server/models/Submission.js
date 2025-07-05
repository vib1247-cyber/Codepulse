import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp'],
    default: 'javascript'
  },
  verdict: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
    default: 'Accepted'
  },
  executionTime: {
    type: Number,
    required: true,
    default: 0
  },
  memory: {
    type: Number,
    required: true,
    default: 0
  },
  output: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexes for better query performance
submissionSchema.index({ user: 1, question: 1 });
submissionSchema.index({ createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
