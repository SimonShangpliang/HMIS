import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Initialize environment variables
dotenv.config();

// Constants for API access
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = process.env.GEMINI_API_URL;

/**
 * Make a call to the Gemini API with the provided message for admins
 * @param {string} message - User prompt for the AI
 * @returns {Promise<string>} - AI generated response
 */
export const callGeminiAdminAPI = async (message) => {
  console.log('Making admin API call with message:', message);

  // Check if API key is available
  if (!API_KEY) {
    console.error('API key is not defined in environment variables');
    throw new Error('API key is missing');
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are a helpful assistant for a Hospital Management System administrator. 
                  You have access to employee data, department information, and other administrative details.
                  Respond to the following question with helpful, detailed information for the hospital administrator:
                  ${message}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2, // Lower temperature for more precise admin responses
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response format:', data);
      return null;
    }
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

/**
 * Determine if a function call is needed based on the user's message
 * @param {string} message - User's query
 * @param {Array} availableFunctions - List of available functions
 * @returns {Object} Decision about function call
 */
export const determineFunctionCall = async (message, availableFunctions) => {
  try {
    // More structured and explicit prompt to guide the model
    const functionDecisionPrompt = `
You are a hospital management system assistant specializing in function calling decisions.
Your task is to analyze the user's query and determine if it requires calling a database function.

User query: "${message}"

Available functions and their descriptions:
${availableFunctions.map(fn => `
Function: ${fn.name}
Description: ${fn.description}
Parameters: ${Object.entries(fn.parameters).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
`).join('\n\n')}

Rules for function selection:
1. Select getEmployeesByRole when users ask about employees with specific roles (doctors, nurses, etc.)
2. Select getEmployeesByDepartment when queries mention department-specific staff
3. Select getEmployeeById when user asks about a specific employee by ID
4. Select getEmployees with appropriate filters when user asks for filtered lists

Examples:
- "Show me all doctors" → getEmployeesByRole with role="doctor"
- "List employees in cardiology department" → getEmployeesByDepartment with deptId="cardiology"
- "Find employee with ID 12345" → getEmployeeById with id=12345
- "Show nurses with salary above 50000" → getEmployees with role="nurse" and minSalary=50000

Function call decision (respond ONLY with valid JSON):
{
  "shouldCallFunction": true/false,
  "functionName": "name of the function to call",
  "parameters": {
    // parameters with appropriate values based on the user query
  },
  "reasoning": "brief explanation of your decision"
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: functionDecisionPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,  // Very low temperature for precise function decisions
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // More robust JSON extraction
    let jsonText = responseText.trim();
    
    // Try to extract JSON if wrapped in code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                     responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch && jsonMatch[0]) {
      jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
    }
    
    // Parse the JSON response with error handling
    try {
      // Make sure we're parsing valid JSON
      if (!jsonText.startsWith('{')) {
        jsonText = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}')+1);
      }
      
      const parsedResponse = JSON.parse(jsonText);
      console.log('Function call decision:', parsedResponse);
      
      // Validation to ensure required fields exist
      if (parsedResponse.shouldCallFunction === true && !parsedResponse.functionName) {
        console.warn('Missing functionName in decision that should call function');
        parsedResponse.functionName = inferFunctionName(message, availableFunctions);
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      // More sophisticated fallback - try to infer function call from message
      return inferFunctionCallFromMessage(message, availableFunctions);
    }
  } catch (error) {
    console.error('Error in function call decision:', error);
    return { shouldCallFunction: false, reasoning: "API error: " + error.message };
  }
};

/**
 * Attempt to infer which function to call based on message keywords
 * @param {string} message - User's query
 * @param {Array} availableFunctions - Available functions
 * @returns {Object} Inferred function call decision
 */
function inferFunctionCallFromMessage(message, availableFunctions) {
  const lowerMessage = message.toLowerCase();
  
  // Simple keyword-based inference as fallback
  if (lowerMessage.includes('role') || 
      lowerMessage.includes('doctor') || 
      lowerMessage.includes('nurse') ||
      lowerMessage.includes('pharmacist')) {
    return {
      shouldCallFunction: true,
      functionName: "getEmployeesByRole",
      parameters: {
        role: extractRole(lowerMessage)
      },
      reasoning: "Inferred role-based query from keywords"
    };
  } else if (lowerMessage.includes('department') || lowerMessage.includes('dept')) {
    return {
      shouldCallFunction: true,
      functionName: "getEmployeesByDepartment",
      parameters: {
        deptId: extractDepartment(lowerMessage)
      },
      reasoning: "Inferred department-based query from keywords"
    };
  } else if (lowerMessage.includes('id') && /\d+/.test(lowerMessage)) {
    return {
      shouldCallFunction: true,
      functionName: "getEmployeeById",
      parameters: {
        id: extractId(lowerMessage)
      },
      reasoning: "Inferred ID-based query from keywords and numbers"
    };
  }
  
  // Default to getEmployees with no parameters if we detect employee-related query
  if (lowerMessage.includes('employee') || lowerMessage.includes('staff') || 
      lowerMessage.includes('list') || lowerMessage.includes('show')) {
    return {
      shouldCallFunction: true,
      functionName: "getEmployees",
      parameters: {},
      reasoning: "Inferred general employee query"
    };
  }
  
  return { 
    shouldCallFunction: false, 
    reasoning: "Could not confidently infer function from query" 
  };
}

// Helper functions to extract parameters from message text
function extractRole(message) {
  // Extract role from message
  const roleKeywords = ['doctor', 'nurse', 'pharmacist', 'technician', 'administrator', 'therapist'];
  for (const role of roleKeywords) {
    if (message.includes(role)) {
      return role;
    }
  }
  return ""; // Default empty string if no role found
}

function extractDepartment(message) {
  // Extract department ID from message
  const deptMatch = message.match(/department\s+(\w+)/i) || 
                   message.match(/dept\s+(\w+)/i) ||
                   message.match(/(\w+)\s+department/i);
  return deptMatch ? deptMatch[1] : "";
}

function extractId(message) {
  // Extract numeric ID from message
  const idMatch = message.match(/id\s+(\d+)/i) || message.match(/(\d+)/);
  return idMatch ? idMatch[1] : "";
}

function inferFunctionName(message, availableFunctions) {
  // Simple inference based on keywords
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('role')) return "getEmployeesByRole";
  if (lowerMessage.includes('department')) return "getEmployeesByDepartment";
  if (lowerMessage.includes('id')) return "getEmployeeById";
  return "getEmployees"; // Default function
}

/**
 * Call the appropriate function and get data with improved error handling and parameter validation
 * @param {string} functionName - Name of function to call
 * @param {Object} parameters - Parameters for the function
 * @returns {Promise<Object>} - Data from the function
 */
export const callFunction = async (functionName, parameters = {}) => {
  // Define function endpoints and parameter handling
  const functionEndpoints = {
    // Get all employees with optional filtering
    getEmployees: {
      url: 'http://localhost:5000/api/employees',
      method: 'GET',
      // Enhanced parameter handler with validation
      paramHandler: (params) => {
        const queryParams = new URLSearchParams();
        
        // Validate and normalize parameters
        const validParams = {
          id: params.id?.toString().trim(),
          name: params.name?.toString().trim(),
          role: normalizeRole(params.role),
          dept_id: params.dept_id?.toString().trim() || params.deptId?.toString().trim(),
          email: params.email?.toString().trim(),
          gender: params.gender?.toString().trim(),
          bloodGrp: params.bloodGrp?.toString().trim(),
          minSalary: isNaN(Number(params.minSalary)) ? null : Number(params.minSalary),
          maxSalary: isNaN(Number(params.maxSalary)) ? null : Number(params.maxSalary),
          joinedAfter: isValidDate(params.joinedAfter) ? params.joinedAfter : null,
          joinedBefore: isValidDate(params.joinedBefore) ? params.joinedBefore : null,
          limit: isNaN(Number(params.limit)) ? 100 : Number(params.limit),
          sort: ['_id', 'name', 'role', 'salary', 'date_of_joining'].includes(params.sort) ? params.sort : '_id',
          order: ['asc', 'desc'].includes(params.order?.toLowerCase()) ? params.order.toLowerCase() : 'asc'
        };
        
        // Add all valid parameters to query string
        Object.entries(validParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value);
          }
        });
        
        console.log('Query parameters:', Object.fromEntries(queryParams.entries()));
        return queryParams.toString();
      }
    },
    
    // Get employee by specific ID
    getEmployeeById: {
      url: 'http://localhost:5000/api/employees/by-id/',
      method: 'GET',
      paramHandler: (params) => {
        // Enhanced validation
        const id = params.id?.toString().trim();
        if (!id) throw new Error('Employee ID is required');
        if (isNaN(Number(id))) throw new Error('Employee ID must be a number');
        return id;
      }
    },
    
    // Get employees by department ID
    getEmployeesByDepartment: {
      url: 'http://localhost:5000/api/employees/by-dept/',
      method: 'GET',
      paramHandler: (params) => {
        // Enhanced validation with helpful error message
        const deptId = params.deptId?.toString().trim() || params.dept_id?.toString().trim();
        if (!deptId) throw new Error('Department ID is required');
        return deptId;
      }
    },
    
    // Get employees by role
    getEmployeesByRole: {
      url: 'http://localhost:5000/api/employees/by-role/',
      method: 'GET',
      paramHandler: (params) => {
        // Enhanced validation with role normalization
        const role = normalizeRole(params.role);
        if (!role) throw new Error('Role is required');
        return role;
      }
    }
  };
  
  // Check if function exists
  const functionConfig = functionEndpoints[functionName];
  if (!functionConfig) {
    throw new Error(`Unknown function: ${functionName}`);
  }
  
  console.log(`Calling function ${functionName} with parameters:`, parameters);
  
  try {
    let url = functionConfig.url;
    let fetchOptions = {
      method: functionConfig.method,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    // Handle parameters based on the function type
    if (functionConfig.paramHandler) {
      try {
        const paramResult = functionConfig.paramHandler(parameters);
        
        // For GET with query params
        if (functionConfig.method === 'GET') {
          // Check if paramResult is a path parameter or query string
          if (paramResult && !paramResult.includes('=')) {
            // It's a path parameter
            url = `${url}${paramResult}`;
          } else if (paramResult) {
            // It's a query string
            url = `${url}?${paramResult}`;
          }
        }
      } catch (paramError) {
        console.error('Parameter handling error:', paramError);
        throw paramError;
      }
    }
    
    console.log(`Making request to: ${url}`);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      fetchOptions.signal = controller.signal;
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Function API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
};

/**
 * Helper function to normalize role strings
 * @param {string} role 
 * @returns {string}
 */
function normalizeRole(role) {
  if (!role) return '';
  
  // Convert the role to lowercase
  const normalizedRole = role.toString().trim().toLowerCase();
  
  // Map common role variations to standard forms
  const roleMap = {
    'doc': 'doctor',
    'physician': 'doctor',
    'md': 'doctor',
    'rn': 'nurse',
    'nursing': 'nurse',
    'pharm': 'pharmacist',
    'rx': 'pharmacist',
    'tech': 'technician',
    'admin': 'administrator',
    'therapist': 'therapist',
    'pt': 'physical therapist'
  };
  
  return roleMap[normalizedRole] || normalizedRole;
}

/**
 * Helper function to validate date strings
 * @param {string} dateStr 
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;
  
  // Try to create a date object
  const date = new Date(dateStr);
  
  // Check if the date is valid
  return !isNaN(date.getTime());
}

/**
 * Generate a response with function data - Improved with data processing
 * @param {string} message - Original user query
 * @param {string} functionName - Name of function that was called
 * @param {Object} functionData - Data returned from function
 * @returns {Promise<string>} - AI generated response
 */
export const generateResponseWithFunctionData = async (message, functionName, functionData) => {
  try {
    // Process the data to make it more presentable
    const processedData = processDataForResponse(functionData, functionName);
    
    // Create a more detailed and structured prompt for better responses
    const prompt = `
You are a helpful hospital management system assistant for administrators. 
The user asked: "${message}"

I called the "${functionName}" function and got the following data:
${JSON.stringify(processedData, null, 2)}

IMPORTANT RESPONSE GUIDELINES:
1. Provide a direct, clear answer that addresses the user's specific question
2. Format numbers appropriately (add commas for thousands, format currency values)
3. If listing employees, use a clear, concise format
4. If data shows no results, explicitly state that no matching records were found
5. If there are many results, summarize the key information
6. Include any actionable insights relevant to a hospital administrator

Based on this data, please provide a helpful, informative response to the user's question.
Remember you're speaking to a hospital administrator, so provide relevant administrative context.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response with function data:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.";
  }
};

/**
 * Process function data for better response generation
 * @param {Object|Array} data - Data returned from function
 * @param {string} functionName - Name of function that was called
 * @returns {Object} - Processed data ready for response generation
 */
function processDataForResponse(data, functionName) {
  // Handle empty data gracefully
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { message: "No matching records found" };
  }
  
  // For arrays (like employee lists), add summary information
  if (Array.isArray(data)) {
    // Create a summary object with useful information
    const summary = {
      total_count: data.length,
      data: data.slice(0, 10),  // Only include first 10 records to avoid token limits
      has_more: data.length > 10
    };
    
    // Add function-specific summaries
    if (functionName === 'getEmployees' || functionName === 'getEmployeesByDepartment' || functionName === 'getEmployeesByRole') {
      // Add department/role counts
      const deptCounts = {};
      const roleCounts = {};
      let totalSalary = 0;
      
      data.forEach(emp => {
        // Count by department
        deptCounts[emp.dept_id] = (deptCounts[emp.dept_id] || 0) + 1;
        
        // Count by role
        roleCounts[emp.role] = (roleCounts[emp.role] || 0) + 1;
        
        // Sum salaries
        totalSalary += emp.salary || 0;
      });
      
      // Add summaries to the result
      summary.department_distribution = deptCounts;
      summary.role_distribution = roleCounts;
      summary.average_salary = data.length > 0 ? totalSalary / data.length : 0;
    }
    
    return summary;
  }
  
  // Single object (like a specific employee) - just return as is
  return data;
}

/**
 * Get AI response from Gemini with improved function calling capabilities for admins
 * @param {Object} req - Request object
 * @param {Object} res - Response object 
 */
export const getAdminGeminiResponse = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required in request body' 
      });
    }

    console.log('Processing admin query:', message);

    // Define available functions with improved descriptions
    const availableFunctions = [
      {
        name: "getEmployees",
        description: "Get a filtered list of employees based on various criteria like name, role, department, salary range, etc.",
        parameters: {
          id: "Employee ID (exact match)",
          name: "Employee name (case-insensitive partial match)",
          role: "Employee role (exact match, e.g., doctor, nurse, technician)",
          dept_id: "Department ID (exact match)",
          email: "Email address (case-insensitive partial match)",
          gender: "Gender (exact match, e.g., male, female)",
          bloodGrp: "Blood group (exact match, e.g., A+, B-, O+)",
          minSalary: "Minimum salary threshold (numeric)",
          maxSalary: "Maximum salary threshold (numeric)",
          joinedAfter: "Joined after this date (ISO format, YYYY-MM-DD)",
          joinedBefore: "Joined before this date (ISO format, YYYY-MM-DD)",
          limit: "Maximum number of results to return (default: 100)",
          sort: "Field to sort by (default: _id)",
          order: "Sort order (asc or desc, default: asc)"
        }
      },
      {
        name: "getEmployeeById",
        description: "Get detailed information about a specific employee by their unique ID",
        parameters: {
          id: "Employee ID (required, numeric)"
        }
      },
      {
        name: "getEmployeesByDepartment",
        description: "Get all employees working in a specific department",
        parameters: {
          deptId: "Department ID (required)"
        }
      },
      {
        name: "getEmployeesByRole",
        description: "Get all employees with a specific role (e.g., all doctors, all nurses)",
        parameters: {
          role: "Employee role (required, e.g., doctor, nurse, technician)"
        }
      }
    ];

    // Step 1: Determine if a function call is needed with improved decision making
    let functionCallDecision;
    try {
      functionCallDecision = await determineFunctionCall(message, availableFunctions);
      console.log('Function call decision:', functionCallDecision);
    } catch (decisionError) {
      console.error('Error in function call decision:', decisionError);
      // Fall back to standard response
      const fallbackResponse = await callGeminiAdminAPI(message);
      return res.status(200).json({
        success: true,
        data: fallbackResponse,
        note: "Used standard response due to function decision error"
      });
    }
    
    // Step 2: If needed, call the function and get data with improved error handling
    if (functionCallDecision && functionCallDecision.shouldCallFunction) {
      try {
        console.log(`Calling function ${functionCallDecision.functionName} with parameters:`, 
          functionCallDecision.parameters || {});
        
        const functionData = await callFunction(
          functionCallDecision.functionName, 
          functionCallDecision.parameters || {}
        );
        
        console.log(`Function ${functionCallDecision.functionName} returned data:`, 
          Array.isArray(functionData) ? `Array with ${functionData.length} items` : 'Object');
        
        // Step 3: Generate improved response with the function data
        const aiResponse = await generateResponseWithFunctionData(
          message, 
          functionCallDecision.functionName, 
          functionData
        );
        
        return res.status(200).json({
          success: true,
          data: aiResponse,
          functionCalled: functionCallDecision.functionName,
          parameters: functionCallDecision.parameters || {}
        });
      } catch (functionError) {
        console.error('Function call error:', functionError);
        
        // Generate an error-specific response
        const errorResponse = await generateErrorResponse(
          message, 
          functionCallDecision.functionName,
          functionError.message
        );
        
        return res.status(200).json({
          success: true,
          data: errorResponse,
          functionError: functionError.message
        });
      }
    } else {
      // No function call needed, use standard response with improved prompt
      console.log('No function call needed, using standard response');
      const standardResponse = await callGeminiAdminAPI(message);
      
      return res.status(200).json({
        success: true,
        data: standardResponse
      });
    }
  } catch (error) {
    console.error('Admin Gemini API endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing your request',
      error: error.message
    });
  }
};

/**
 * Generate a response for function call errors
 * @param {string} message - Original user query
 * @param {string} functionName - Name of function that was called
 * @param {string} errorMessage - Error message
 * @returns {Promise<string>} - AI generated error response
 */
async function generateErrorResponse(message, functionName, errorMessage) {
  try {
    const prompt = `
You are a helpful hospital management system assistant for administrators.
The user asked: "${message}"

I tried to call the "${functionName}" function but encountered an error: "${errorMessage}"

Please provide a helpful response that:
1. Acknowledges the error in a user-friendly way
2. Explains what might have gone wrong in non-technical terms
3. Suggests alternative approaches or questions the user could try
4. Is concise, respectful, and helpful

Note: Do not mention specific API or technical details. Just provide a helpful response as if you're answering the user directly.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating error response:', error);
    return "I'm sorry, I couldn't process your request. Please try again with a different query or check the information you provided.";
  }
}