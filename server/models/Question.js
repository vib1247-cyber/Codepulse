import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    },
    required: [true, 'Difficulty is required']
  },
  sampleInput: {
    type: String,
    required: [true, 'Sample input is required']
  },
  sampleOutput: {
    type: String,
    required: [true, 'Sample output is required']
  },
  testCases: [testCaseSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add text index for search functionality
questionSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Question', questionSchema);
