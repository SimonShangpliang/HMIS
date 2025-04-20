// controllers/geminiController.js
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = process.env.GEMINI_API_URL;

/**
 * Make a call to the Gemini API with the provided message
 * @param {string} message - User prompt for the AI
 * @returns {Promise<string>} - AI generated response
 */
const callGeminiAPI = async (message) => {
  console.log('Making API call with message:', message);

  if (!API_KEY) {
    console.error('API key is not defined in environment variables');
    throw new Error('API key is missing');
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are a helpful assistant for a Hospital Management System. 
            Respond to the following question with helpful information:
            System Features:
            1. Profile Management
            - View personal patient information
            - Update personal details
            - See basic health metrics (age, blood group, height, weight)
            - Bed and room assignment

            2. Appointments Management
            - View scheduled appointments
            - See appointment status (Scheduled/Completed)
            - Appointments with different doctors (Dr. Smith, Dr. Johnson, Dr. Lee)

            3. Consultations
            - Book a new consultation
            - View previous consultations
            - View booked consultations
            - Access daily progress and consultation history

            4. Billing
            - Access and manage medical bills

            5. Feedback System
            - Provide ratings and comments about consultations
            - Select specific consultations for feedback
            - Rate experience with star system

            6. Help and Support
            - Access customer support information

            Contact Information:
            - Email: patient@hospital.com
            - Phone: +1 (555) 123-4567

            Guidelines:
            - Be patient-centric and empathetic
            - Provide clear, concise instructions
            - Help users navigate system features
            - If query is complex, suggest contacting customer support 
            ${message}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
 * Get AI response from Gemini
 * @route POST /api/gemini
 * @access Public (consider adding auth middleware for production)
 */
export const getGeminiResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required in request body',
      });
    }

    const aiResponse = await callGeminiAPI(message);

    if (aiResponse) {
      return res.status(200).json({
        success: true,
        data: aiResponse,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to get response from AI',
      });
    }
  } catch (error) {
    console.error('Gemini API endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while communicating with Gemini API',
      error: error.message,
    });
  }
};
