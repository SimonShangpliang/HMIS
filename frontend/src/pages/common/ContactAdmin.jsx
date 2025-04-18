import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import TextArea from '@mui/material/TextareaAutosize';
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
    <div className="p-20 relative">
      {/* Top Response Message */}
      {responseMessage && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-md text-white font-medium transition-all duration-300 ${
            isError ? 'bg-red-500' : ''
          }`}
          style={{ backgroundColor: isError ? '#EF4444' : '#4C7E75' }}
        >
          {responseMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Contact Admin</h1>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-4">
        <TextField
          label="Subject"
          variant="outlined"
          fullWidth
          margin="normal"
          className="mb-4"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <TextArea
          placeholder="Message"
          className="m-1 w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          minRows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="w-full flex justify-end">
          <Button
            type="submit"
            variant="contained"
            disabled={actionLoading}
            style={{ backgroundColor: '#4C7E75', color: 'white' }}
            className="mx-4"
          >
            {actionLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactAdmin;
