import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import TextArea from '@mui/material/TextareaAutosize';
import axios from 'axios';
import { Send, Mail, AlertCircle, CheckCircle, X } from 'lucide-react';

const ContactAdmin = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('email');
    setActionLoading(true);
    setResponseMessage('');
    setIsError(false);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/employees/send`, {
        subject,
        message,
        email
      });

      setResponseMessage(response.data.message || 'Message sent successfully!');
      setIsError(false);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      setResponseMessage('Failed to send email. Please try again later.');
      setIsError(true);
    } finally {
      setActionLoading(false);
      setTimeout(() => setResponseMessage(''), 5000);
    }
  };

  const closeNotification = () => {
    setResponseMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Mail size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Contact Admin</h1>
                <p className="text-indigo-100 mt-1">Send a message to the hospital administration</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {/* Notification */}
            {responseMessage && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
                  isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
                }`}
              >
                <div className="flex items-center">
                  {isError ? (
                    <AlertCircle size={20} className="mr-2 text-red-500" />
                  ) : (
                    <CheckCircle size={20} className="mr-2 text-green-500" />
                  )}
                  <span className="font-medium">{responseMessage}</span>
                </div>
                <button 
                  onClick={closeNotification}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <TextField
                  id="subject"
                  placeholder="Enter the subject of your message"
                  variant="outlined"
                  fullWidth
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.75rem',
                      '&:hover fieldset': {
                        borderColor: 'rgba(79, 70, 229, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(79, 70, 229, 0.8)',
                      },
                    },
                  }}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <TextArea
                  id="message"
                  placeholder="Type your message here..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  minRows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={actionLoading}
                  className="rounded-xl px-6 py-2.5 shadow-sm transition-all"
                  sx={{
                    backgroundColor: '#4F46E5',
                    '&:hover': {
                      backgroundColor: '#4338CA',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#E5E7EB',
                    },
                  }}
                >
                  <div className="flex items-center">
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions, concerns, or need assistance with hospital services, 
            please use this form to contact the administration. We typically respond within 24 hours.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <Mail size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <p>For general inquiries and support</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <AlertCircle size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Emergency Contact</p>
                <p>For urgent matters, please call the hospital directly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
