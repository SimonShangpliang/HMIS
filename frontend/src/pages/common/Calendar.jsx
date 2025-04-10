import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

async function fetchEvents() {
  console.log("FETCHING EVENTS FOR CALENDAR");
  return [
    {
      title: 'Team Meeting',
      start: new Date(2025, 3, 7, 10, 30), // April 7, 2025, 10:30 AM
      end: new Date(2025, 3, 7, 11, 30),
    },
    {
      title: 'Lunch Break',
      start: new Date(2025, 3, 8, 12, 0),
      end: new Date(2025, 3, 8, 13, 0),
      allDay: false,
    },
    {
      title: 'Conference',
      start: new Date(2025, 3, 9),
      end: new Date(2025, 3, 11),
      allDay: true,
    },
  ];
}

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [showPrompt, setShowPrompt] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
      .then((events) => {
        setEvents(events);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  // Reusable function to add an event
  const addEvent = (title, start, end) => {
    const newEvent = { title, start, end };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    console.log("Event added:", newEvent);
    setShowPrompt(false);
    clearForm();
    setErrorMessage('');
  };

  // Handle event addition via prompt
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      setErrorMessage("Event title cannot be empty or whitespace.");
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      setErrorMessage("Invalid date format.");
      return;
    }

    if (start >= end) {
      setErrorMessage("Start date and time must be before the end date and time.");
      return;
    }


    addEvent(eventTitle.trim(), start, end);
  };

  // Clear form fields
  const clearForm = () => {
    setEventTitle('');
    setStartDate('');
    setEndDate('');
    setErrorMessage('');
  };

  // Handle "Add Event" button click
  const handleAddEvent = () => {
    clearForm();
    setShowPrompt(true);
  };

  // Close the prompt modal
  const closePrompt = () => {
    clearForm();
    setShowPrompt(false);
  };

  return (
    <div>
      {showPrompt && (
        <EventPrompt
          eventTitle={eventTitle}
          startDate={startDate}
          endDate={endDate}
          onTitleChange={setEventTitle}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onCancel={closePrompt}
          onSave={handleSaveEvent}
          errorMessage={errorMessage}
        />
      )}

      <div className='p-16 flex flex-col gap-2'>
        <div className='text-2xl font-bold ml-[3rem]'>Calendar</div>

        {loading ? (
          <div className="text-center mt-4">Loading events...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '500px', margin: '3rem' }}
            views={['month', 'week', 'day']}
            view={view}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            selectable
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: '#4C7E75',
                color: 'white',
              },
            })}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddEvent}
          style={{ marginLeft: '3rem', marginRight: '3rem', backgroundColor: '#4C7E75' }}
        >
          Add Event
        </Button>

        {!loading && events.length === 0 && (
          <div className="text-center mt-4 text-gray-500">No events available.</div>
        )}
      </div>
    </div>
  );
};

const EventPrompt = ({
  eventTitle,
  startDate,
  endDate,
  onTitleChange,
  onStartChange,
  onEndChange,
  onCancel,
  onSave,
  errorMessage
}) => {

  return (
    <div className="flex flex-col gap-4 p-4 border border-4 border-black rounded shadow-md bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-[20rem]">
      <h2 className="text-lg font-bold mx-auto">Add Event</h2>
      <TextField
        label="Event Title"
        placeholder="Enter event title"
        style={{ width: '100%' }}
        value={eventTitle}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <TextField
        label="Start Date & Time"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        style={{ width: '100%' }}
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
      />
      <TextField
        label="End Date & Time"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        style={{ width: '100%' }}
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
      />
      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}
      <div className="flex justify-between">
        <Button variant="outlined" onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onSave}>Add</Button>
      </div>
    </div>
  );
};

export default MyCalendar;
