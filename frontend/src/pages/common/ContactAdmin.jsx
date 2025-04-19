import React, { useState } from 'react';
import { Button, TextField, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:5000/api/employees/send', {
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

  return (
    <Box className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Paper elevation={3} className="p-8 rounded-lg">
          {/* Header Section */}
          <Box className="text-center mb-8">
            <Typography variant="h4" component="h1" className="text-gray-800 font-bold mb-2">
              Contact Administration
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Have a question or need assistance? Send us a message and we'll get back to you as soon as possible.
            </Typography>
          </Box>

          {/* Response Message */}
          {responseMessage && (
            <Box
              className={`mb-6 p-4 rounded-lg text-white text-center transition-all duration-300 ${
                isError ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {responseMessage}
            </Box>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Subject"
              variant="outlined"
              fullWidth
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-4"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4C7E75',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4C7E75',
                  },
                },
              }}
            />

            <TextField
              label="Message"
              multiline
              rows={6}
              variant="outlined"
              fullWidth
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-6"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4C7E75',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4C7E75',
                  },
                },
              }}
            />

            <Box className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
                className="bg-[#4C7E75] hover:bg-[#3d655d] text-white px-8 py-3 rounded-lg transition-colors duration-200"
                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              >
                {actionLoading ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </form>
        </Paper>
      </div>
    </Box>
  );
};

export default ContactAdmin;
