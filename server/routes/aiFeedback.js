import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { auth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/ai/feedback
// @desc    Get AI feedback on code
// @access  Private
router.post('/feedback', auth, async (req, res) => {
  console.log('=== New AI Feedback Request ===');
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Authenticated User:', req.user ? req.user._id : 'No user');
  
  // Log environment info for debugging
  console.log('Environment Info:', {
    node_env: process.env.NODE_ENV,
    openai_key_exists: !!process.env.OPENAI_API_KEY,
    openai_key_prefix: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 5)}...` : 'not set',
    timestamp: new Date().toISOString()
  });
  // Log environment info for debugging
  console.log('Environment Info:', {
    node_env: process.env.NODE_ENV,
    openai_key_exists: !!process.env.OPENAI_API_KEY,
    openai_key_prefix: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 5)}...` : 'not set',
    timestamp: new Date().toISOString()
  });
  console.log('Environment Variables:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'none',
    nodeEnv: process.env.NODE_ENV
  });
  console.log('AI Feedback Request Received:', {
    user: req.user ? req.user._id : 'no user',
    hasSourceCode: !!req.body.source_code,
    language: req.body.language,
    hasInput: !!req.body.input,
    hasOutput: !!req.body.output
  });

  try {
    console.log('Request body:', JSON.stringify({
      language: req.body.language,
      source_code_length: req.body.source_code?.length,
      input: req.body.input,
      output: req.body.output
    }, null, 2));

    const { source_code: sourceCode, language, input, output } = req.body;

    // Input validation
    if (!sourceCode || !language) {
      console.error('Validation failed - missing required fields:', { sourceCode: !!sourceCode, language: !!language });
      return res.status(400).json({
        success: false,
        message: 'Source code and language are required',
        received: {
          source_code: !!sourceCode,
          language: !!language,
          input: !!input,
          output: !!output
        }
      });
      console.error('Missing required fields:', { sourceCode: !!sourceCode, language: !!language });
      return res.status(400).json({ 
        success: false,
        msg: 'Source code and language are required',
        received: {
          sourceCode: !!sourceCode,
          language: !!language,
          input: !!input,
          output: !!output
        }
      });
    }

    // Prepare the prompt based on the language and available context
    const languageName = {
      'cpp': 'C++',
      'python': 'Python',
      'java': 'Java',
      'javascript': 'JavaScript'
    }[language] || language;

    let prompt = `You are an expert ${languageName} developer. Please provide detailed feedback on the following code.\n\n`;
    prompt += `Language: ${languageName}\n`;
    prompt += `\n--- CODE ---\n${sourceCode}\n--- END CODE ---\n\n`;

    if (input) {
      prompt += `\n--- INPUT ---\n${input}\n--- END INPUT ---\n`;
    }

    if (output) {
      prompt += `\n--- OUTPUT ---\n${output}\n--- END OUTPUT ---\n`;
    }

    prompt += `\nPlease provide feedback on the following aspects:\n`;
    prompt += `1. Code correctness and logic\n`;
    prompt += `2. Time and space complexity analysis\n`;
    prompt += `3. Code style and best practices\n`;
    prompt += `4. Potential bugs or edge cases\n`;
    prompt += `5. Suggestions for improvement\n`;
    prompt += `6. Score the solution out of 10\n`;
    prompt += `Format your response in clear, well-structured markdown.`;

    console.log('Calling OpenAI API with prompt length:', prompt.length);
    
    console.log('Sending request to OpenAI API...');
    console.log('Sending request to OpenAI API...');
    console.log('Prompt length:', prompt.length, 'characters');
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert programming assistant. Provide detailed, constructive feedback on the code.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      console.log('Received response from OpenAI API');
      return completion;
    } catch (openaiError) {
      console.error('OpenAI API Error:', {
        status: openaiError.status,
        message: openaiError.message,
        code: openaiError.code,
        type: openaiError.type,
        response: openaiError.response?.data,
        headers: openaiError.response?.headers,
        statusCode: openaiError.response?.status
      });
      
      // If it's a rate limit error, provide more details
      if (openaiError.status === 429) {
        console.error('Rate limit exceeded. Headers:', openaiError.response?.headers);
      }
      
      throw openaiError;
    }

    const feedback = completion.choices[0]?.message?.content || 'No feedback generated.';
    console.log('Successfully received feedback from OpenAI');

    res.json({ 
      success: true,
      feedback 
    });
  } catch (err) {
    console.error('=== ERROR IN AI FEEDBACK ROUTE ===');
    console.error('Error Type:', err.constructor.name);
    console.error('Error Stack:', err.stack);
    
    // Log the full error object
    console.error('Full Error Object:', JSON.stringify({
      name: err.name,
      message: err.message,
      code: err.code,
      status: err.status || err.response?.status,
      response: {
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
        data: err.response?.data
      },
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
        data: err.config?.data
      }
    }, null, 2));
    
    // Default error response
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorDetails = {};
    
    // Handle different types of errors
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      statusCode = err.response.status || 500;
      errorMessage = err.response.data?.message || 'Error from external service';
      errorDetails = err.response.data;
      
      console.error(`External API Error (${statusCode}):`, errorMessage);
      
    } else if (err.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from AI service';
      console.error('No response from AI service:', err.message);
      
    } else if (err.name === 'ValidationError') {
      // Mongoose validation error
      statusCode = 400;
      errorMessage = 'Validation Error';
      errorDetails = Object.values(err.errors).map(e => e.message);
      
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorMessage = 'Invalid token';
      
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      errorMessage = 'Token expired';
      
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Unexpected error:', err);
      errorMessage = err.message || 'An unexpected error occurred';
    }
    
    // Log the final error that will be sent to the client
    console.error(`Sending error response (${statusCode}):`, errorMessage);
    
    // Send error response
    return res.status(statusCode).json({
      success: false,
      msg: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        error: {
          name: err.name,
          message: err.message,
          ...errorDetails
        }
      })
    });
    console.error('AI Feedback Error:', JSON.stringify(errorDetails, null, 2));
    
    // Use existing error message and status code from above
    
    if (err.response) {
      // Handle HTTP errors
      statusCode = err.response.status;
      if (statusCode === 400) errorMessage = 'Invalid request';
      else if (statusCode === 401) errorMessage = 'Authentication failed';
      else if (statusCode === 429) errorMessage = 'Rate limit exceeded';
      else if (statusCode === 500) errorMessage = 'Server error';
    } else if (err.request) {
      // Request was made but no response
      errorMessage = 'No response from AI service';
    } else {
      // Other errors
      errorMessage = err.message || errorMessage;
    }
    console.error('Error in AI feedback:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      response: err.response?.data
    });
    
    // Handle specific OpenAI API errors
    if (err.response) {
      return res.status(err.response.status).json({
        success: false,
        msg: 'OpenAI API Error',
        error: err.response.data
      });
    }

    res.status(500).json({ 
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
