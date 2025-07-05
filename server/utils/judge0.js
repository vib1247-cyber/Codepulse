import axios from 'axios';

// Judge0 Configuration
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const USE_PUBLIC_INSTANCE = !process.env.JUDGE0_URL;

if (USE_PUBLIC_INSTANCE) {
  console.log('ℹ️ Using public Judge0 instance with limited capabilities');
  console.log('⚠️ For production, please set up your own Judge0 instance');
} else {
  console.log('🔗 Using custom Judge0 instance at:', JUDGE0_URL);
}

// Language IDs for Judge0
const LANGUAGE_IDS = {
  'javascript': 63,  // JavaScript (Node.js 12.14.0) - Public instance uses different IDs
  'python': 71,      // Python 3.8.1
  'cpp': 54,         // C++ (GCC 9.2.0)
  'java': 62,        // Java (OpenJDK 13.0.1)
  'c': 50            // C (GCC 9.2.0)
};

// Create axios instance for Judge0
const judge0 = axios.create({
  baseURL: JUDGE0_URL,
  headers: {
    'content-type': 'application/json',
    ...(USE_PUBLIC_INSTANCE && {
      'X-RapidAPI-Key': 'your-rapidapi-key-here', // Not needed for public instance
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    })
  },
  timeout: 30000, // 30 seconds timeout
  validateStatus: null // Don't throw on HTTP error status codes
});

// Add request interceptor for logging
judge0.interceptors.request.use(
  config => {
    console.log(`🌐 Sending ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
judge0.interceptors.response.use(
  response => {
    console.log(`✅ Received response from ${response.config.url} (${response.status})`);
    return response;
  },
  error => {
    console.error('❌ Response error:', {
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      },
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

/**
 * Execute code using Judge0 API
 * @param {string} sourceCode - The source code to execute
 * @param {string} language - The programming language
 * @param {string} stdin - The input to the program
 * @returns {Promise<Object>} - The execution result
 */
export const executeWithJudge0 = async (sourceCode, language, stdin = '') => {
  try {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    console.log('🚀 Submitting code for execution:', {
      language,
      languageId,
      sourceCodeLength: sourceCode?.length,
      stdinLength: stdin?.length
    });

    // For public instance, we need to use different endpoints and parameters
    const submissionData = {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin || '',
      wait: true, // Wait for execution to complete
      base64_encoded: false
    };

    console.log('📤 Submitting code with data:', {
      language,
      languageId,
      sourceCodeLength: sourceCode?.length,
      stdinLength: stdin?.length,
      usingPublicInstance: USE_PUBLIC_INSTANCE
    });

    const submissionResponse = await judge0.post(
      USE_PUBLIC_INSTANCE ? '/submissions?wait=true' : '/submissions',
      submissionData
    );

    console.log('📥 Submission response:', {
      status: submissionResponse.status,
      data: submissionResponse.data
    });

    if (submissionResponse.status !== 201) {
      throw new Error(`Failed to submit code: ${submissionResponse.data.error || 'Unknown error'}`);
    }

    const { token } = submissionResponse.data;
    
    let resultResponse;
    
    if (USE_PUBLIC_INSTANCE) {
      // For public instance, we already have the result in submissionResponse
      resultResponse = { data: submissionResponse.data };
    } else {
      // For custom instance, we need to fetch the result separately
      console.log('⏳ Fetching execution result for token:', token);
      resultResponse = await judge0.get(`/submissions/${token}?base64_encoded=false`);
      
      if (resultResponse.status !== 200) {
        console.error('❌ Failed to get execution result:', {
          status: resultResponse.status,
          data: resultResponse.data
        });
        throw new Error(`Failed to get execution result: ${resultResponse.data.error || 'Unknown error'}`);
      }
    }

    console.log('📊 Execution result:', {
      status: resultResponse.data.status?.description,
      time: resultResponse.data.time,
      memory: resultResponse.data.memory,
      stderr: resultResponse.data.stderr,
      stdout: resultResponse.data.stdout
    });

    const result = resultResponse.data;
    
    // Format the response
    return {
      output: result.stdout || '',
      error: result.stderr || (result.status?.description || '').includes('Runtime Error') 
        ? 'Runtime Error: ' + (result.message || 'Unknown runtime error') 
        : '',
      executionTime: parseFloat(result.time) || 0,
      memory: result.memory || 0,
      status: result.status?.description || '',
      exitCode: result.exit_code || 0
    };
  } catch (error) {
    console.error('Judge0 execution error:', error);
    return {
      output: '',
      error: `Execution failed: ${error.message}`,
      executionTime: 0,
      memory: 0,
      status: 'error',
      exitCode: 1
    };
  }
};

export default {
  executeWithJudge0,
  supportedLanguages: Object.keys(LANGUAGE_IDS)
};
