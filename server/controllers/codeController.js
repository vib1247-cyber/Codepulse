import ErrorResponse from '../utils/errorResponse.js';
import { executeWithJudge0 } from '../utils/judge0.js';

// Execute code
export const executeCode = async (req, res, next) => {
  const { language, code, input } = req.body;
  
  console.log('🔍 Received code execution request:', {
    language,
    codeLength: code?.length,
    inputLength: input?.length
  });
  
  // Validate input
  if (!language || !code) {
    const error = new ErrorResponse('Language and code are required', 400);
    console.error('❌ Validation error:', error);
    return next(error);
  }
  
  // Validate code length (public instance has limits)
  if (code.length > 65536) {
    const error = new ErrorResponse('Code is too long. Maximum 65536 characters allowed.', 400);
    console.error('❌ Validation error:', error);
    return next(error);
  }
  
  try {
    // Execute the code using Judge0
    console.log('🚀 Executing code with Judge0...');
    const result = await executeWithJudge0(code, language, input || '');
    
    console.log('✅ Code execution successful:', {
      executionTime: result.executionTime,
      memory: result.memory,
      status: result.status
    });
    
    // Format the output for better readability
    const formatOutput = (output) => {
      if (!output) return '';
      // Remove any null characters that might cause issues
      return output.replace(/\x00/g, '').trim();
    };
    
    // Send the response
    res.status(200).json({
      success: true,
      data: {
        output: formatOutput(result.output),
        error: formatOutput(result.error),
        executionTime: result.executionTime || 0,
        memory: result.memory || 0,
        status: result.status || 'Completed',
        exitCode: result.exitCode || 0
      }
    });
  } catch (error) {
    console.error('❌ Code execution error:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && {
        response: {
          status: error.response.status,
          data: error.response.data
        }
      })
    });
    
    // Provide a more user-friendly error message
    let errorMessage = error.message;
    if (errorMessage.includes('429')) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (errorMessage.includes('timed out')) {
      errorMessage = 'Execution timed out. Your code took too long to run.';
    }
    
    next(new ErrorResponse(`Execution failed: ${errorMessage}`, 500));
  }
};
