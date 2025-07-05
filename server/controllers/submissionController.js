import Submission from '../models/Submission.js';
import Question from '../models/Question.js';
import ErrorResponse from '../utils/errorResponse.js';
import { executeCode } from './codeController.js';

// Create a new submission
export const createSubmission = async (req, res, next) => {
  const { questionId, code, language, executionTime: clientExecutionTime } = req.body;
  const userId = req.user.id;
  
  if (!questionId || !code || !language) {
    return next(new ErrorResponse('Question ID, code, and language are required', 400));
  }
  
  try {
    // Verify the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }
    
    // Execute the code with test cases
    const testCases = question.testCases || [];
    let passed = 0;
    let totalExecutionTime = 0;
    let verdict = 'Accepted';
    let executionOutput = '';
    
    // If we have a client-side execution time, use it as a fallback
    if (clientExecutionTime) {
      totalExecutionTime = parseFloat(clientExecutionTime) * (testCases.length || 1);
    }
    
    // Only run test cases if we don't have a client-side execution
    if (!clientExecutionTime) {
      for (const testCase of testCases) {
        try {
          const { input, expectedOutput } = testCase;
          
          // Execute the code with the test case input
          const { output: actualOutput, executionTime, error } = await executeCode({
            body: { language, code, input },
            user: { id: userId }
          });
          
          totalExecutionTime += parseFloat(executionTime || 0);
          
          // Check for errors
          if (error) {
            verdict = 'Runtime Error';
            executionOutput = `Runtime Error: ${error}`;
            break;
          }
          
          // Compare the actual output with the expected output
          if (actualOutput && actualOutput.trim() !== expectedOutput.trim()) {
            verdict = 'Wrong Answer';
            executionOutput = `Expected: ${expectedOutput}\nGot: ${actualOutput}`;
            break;
          }
          
          passed++;
        } catch (error) {
          verdict = 'Runtime Error';
          executionOutput = `Error: ${error.message}`;
          break;
        }
      }
    }
    
    // Calculate average execution time
    const avgExecutionTime = testCases.length > 0 
      ? (totalExecutionTime / testCases.length).toFixed(2) 
      : parseFloat(clientExecutionTime || 0).toFixed(2);
    
    // Create submission record
    const submission = await Submission.create({
      user: userId,
      question: questionId,
      code,
      language,
      verdict,
      executionTime: parseFloat(avgExecutionTime),
      memory: 0, // This would be calculated by the execution environment
      output: executionOutput
    });
    
    // Update question statistics
    question.totalSubmissions = (question.totalSubmissions || 0) + 1;
    if (verdict === 'Accepted') {
      question.successfulSubmissions = (question.successfulSubmissions || 0) + 1;
    }
    await question.save();
    
    res.status(201).json({
      success: true,
      data: {
        ...submission.toObject(),
        executionTime: parseFloat(avgExecutionTime)
      },
      message: 'Submission created successfully'
    });
    
  } catch (error) {
    console.error('Error in createSubmission:', error);
    next(error);
  }
};

// Get user's submissions for a question
export const getUserSubmissions = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;
    
    const submissions = await Submission.find({
      user: userId,
      question: questionId
    }).sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submissions (Admin only)
 * @route   GET /api/submit
 * @access  Private/Admin
 */
export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({})
      .populate({
        path: 'user',
        select: 'name email',
        model: 'User'
      })
      .populate({
        path: 'question',
        select: 'title',
        model: 'Question'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    next(new ErrorResponse('Failed to fetch submissions', 500));
  }
};
