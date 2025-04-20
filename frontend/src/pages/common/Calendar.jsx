import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Search } from 'lucide-react';


async function fetchConsultations(doctorId = null,role) {
  try {
    // Skip fetch if doctorId is invalid
    if (!doctorId || parseInt(doctorId) < 10000) {
      return [];
    }

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/common/calendar/doctor`, {
      params: {
        doctorId,
        startDate: moment().startOf('month').toISOString(),
        endDate: moment().endOf('month').toISOString(),
        role:role?"doctor":"receptionist",
        
      }
    });

    return response.data.map(event => ({
      id: event.id,
      title: event.title, // "Consultation with [patient name]"
      start: new Date(event.start),
      end: new Date(event.end),
      status: event.status,
      reason: event.reason,
      patientId: event.patientId,
      patientPhone: event.patientPhone,
      patientEmail: event.patientEmail,
      appointment_type: event.appointment_type || 'regular'
    }));
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return [];
  }
}

async function updateConsultation(consultationId, updateData) {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/consultations/update/${consultationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
}



const localizer = momentLocalizer(moment);

// Add custom formats
const formats = {
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM D',
  dayRangeHeaderFormat: ({ start, end }) =>
    `${moment(start).format('MMM D')} - ${moment(end).format('MMM D, YYYY')}`,
  agendaHeaderFormat: ({ start, end }) =>
    `${moment(start).format('MMM D')} - ${moment(end).format('MMM D, YYYY')}`,
};

// Define status color mapping
const statusColors = {
  scheduled: '#10b981', // emerald-500
  ongoing: '#3b82f6', // blue-500
  completed: '#6366f1', // indigo-500
  cancelled: '#ef4444'  // red-500
};

const MyCalendar = () => {
  // Replace useAuth with localStorage
  const userId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("role");

  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_type: 'regular',
    reason: '',
    booked_date_time: moment().format('YYYY-MM-DDTHH:mm'),
  });
  const [updateFormData, setUpdateFormData] = useState({
    id: '',
    patient_id: '',
    doctor_id: '',
    appointment_type: 'regular',
    reason: '',
    booked_date_time: '',
    status: 'scheduled'
  });

  // Fetch events based on role and selected doctor
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const doctorId = currentUserRole === 'doctor' ? userId : selectedDoctor;
      if (doctorId && parseInt(doctorId) >= 10000) {
        const events = await fetchConsultations(doctorId, currentUserRole === 'doctor');
        setEvents(events);
      } else {
        setEvents([]);
      }
      setLoading(false);
    };
    loadEvents();
  }, [userId, currentUserRole, selectedDoctor]);

  const handleSaveEvent = async () => {
    try {
      setActionLoading(true);

      // Add validation
      if (!formData.doctor_id || !formData.patient_id || !formData.reason) {
        setErrorMessage('Doctor ID, Patient ID and Reason are required fields');
        setActionLoading(false);
        return;
      }

      const consultationData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        booked_date_time: formData.booked_date_time,
        reason: formData.reason,
        created_by: Number(userId),
        appointment_type: formData.appointment_type,
        status: 'scheduled' // Default status for new appointments
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/consultations/book`, consultationData);

      // Refresh the calendar after booking
      const doctorId = currentUserRole === 'doctor' ? userId : selectedDoctor;
      const updatedEvents = await fetchConsultations(doctorId, currentUserRole === 'doctor');
      setEvents(updatedEvents);

      setShowPrompt(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_type: 'regular',
        reason: '',
        booked_date_time: moment().format('YYYY-MM-DDTHH:mm')
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error creating appointment');
    }
    finally {
      setActionLoading(false);
    }

  };

  const handleEventSelect = async (event) => {
    try {
      setLoading(true);

      console.log(event)
      console.log(event.id)
      setUpdateFormData({
        id: event.id,
        patient_id: event.patientId,
        doctor_id: '',
        appointment_type: event.appointment_type,
        reason: event.reason,
        booked_date_time: moment(event.start).format('YYYY-MM-DDTHH:mm'),
        status: event.status || 'scheduled'
      });

      setSelectedEvent(event);
      setShowUpdatePrompt(true);
      setLoading(false);
    } catch (error) {
      console.error("Error selecting event:", error);
      setErrorMessage('Could not load consultation details');
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      setActionLoading(true);
      // Add validation
      if (!updateFormData.doctor_id || !updateFormData.patient_id || !updateFormData.reason) {
        setErrorMessage('Doctor ID, Patient ID and Reason are required fields');
        setActionLoading(false);
        return;
      }

      const updatedConsultationData = {
        patient_id: updateFormData.patient_id,
        doctor_id: updateFormData.doctor_id,
        booked_date_time: updateFormData.booked_date_time,
        reason: updateFormData.reason,
        updated_by: Number(userId),
        appointment_type: updateFormData.appointment_type,
        status: updateFormData.status
      };

      await updateConsultation(updateFormData.id, updatedConsultationData);

      // Refresh the calendar after update
      const doctorId = currentUserRole === 'doctor' ? userId : selectedDoctor;
      const updatedEvents = await fetchConsultations(doctorId, currentUserRole === 'doctor');
      setEvents(updatedEvents);

      setShowUpdatePrompt(false);
      setSelectedEvent(null);
      setUpdateFormData({
        id: '',
        patient_id: '',
        doctor_id: '',
        appointment_type: 'regular',
        reason: '',
        booked_date_time: '',
        status: 'scheduled'
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating appointment');
    }
    finally {
      setActionLoading(false);
    }
    
  };


  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
          <p className="text-gray-600">Manage appointments and consultations</p>
        </div>
        {/* Only show Add Appointment button for receptionists */}
        {currentUserRole === 'receptionist' && (
          <button
            onClick={() => setShowPrompt(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Add Appointment
          </button>
        )}
      </div>

      {/* Allow doctor search only for admin and receptionist */}
      {['admin', 'receptionist'].includes(currentUserRole) && (
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex items-center gap-2">
            <Search className="text-gray-400" size={20} />
            <input
              type="number"
              placeholder="Enter Doctor ID"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Status legend */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.scheduled }}></div>
          <span className="text-sm text-gray-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.ongoing }}></div>
          <span className="text-sm text-gray-600">Ongoing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.completed }}></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.cancelled }}></div>
          <span className="text-sm text-gray-600">Cancelled</span>
        </div>
      </div>

      {/* Calendar view - read only for doctors and admin */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            className="h-[600px] rbc-calendar-custom"
            style={{ margin: '1rem' }}
            views={['month', 'week', 'day']}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            selectable={currentUserRole === 'receptionist'} // Only receptionist can select dates
            onSelectSlot={currentUserRole === 'receptionist' ? () => setShowPrompt(true) : undefined}
            onSelectEvent={currentUserRole === 'receptionist' ? handleEventSelect : undefined} // Allow clicking on events to edit
            formats={formats}
            defaultDate={new Date()}
            eventPropGetter={(event) => {
              const backgroundColor = statusColors[event.status] || statusColors.scheduled;
              return {
                style: {
                  backgroundColor,
                  borderRadius: '4px',
                  color: 'white',
                  padding: '2px 4px',
                  opacity: event.status === 'cancelled' ? 0.7 : 1
                },
                className: `cursor-${currentUserRole === 'receptionist' ? 'pointer' : 'default'}`
              };
            }}
            dayPropGetter={date => ({
              className: 'rbc-day-slot',
              style: {
                backgroundColor: moment(date).isSame(new Date(), 'day') ? '#f3f4f6' : 'transparent',
              }
            })}
          />
        </div>
      )}

      {/* Add New Appointment Modal */}
      {showPrompt && currentUserRole === 'receptionist' && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-40"
            onClick={() => setShowPrompt(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">New Appointment</h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Doctor ID"
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Patient ID"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                  />
                </div>

                <select
                  value={formData.appointment_type}
                  onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="regular">Regular</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="consultation">Consultation</option>
                </select>

                <textarea
                  placeholder="Reason*"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  required
                />

                <input
                  type="datetime-local"
                  value={formData.booked_date_time}
                  onChange={(e) => setFormData({ ...formData, booked_date_time: e.target.value })}
                  className="w-full p-2 border rounded"
                />

                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
  onClick={handleSaveEvent}
  disabled={actionLoading}
  className={`w-full py-2 rounded text-white ${
    actionLoading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
  }`}
>
  {actionLoading ? (
    <div className="flex items-center justify-center">
      <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-2"></div>
      Saving...
    </div>
  ) : (
    'Save'
  )}
</button>


                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Update Existing Appointment Modal */}
      {showUpdatePrompt && currentUserRole === 'receptionist' && selectedEvent && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-40"
            onClick={() => setShowUpdatePrompt(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-2">Update Appointment</h3>
              <p className="text-gray-500 mb-4 text-sm">
                Appointment #{updateFormData.id}
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Doctor ID"
                    value={updateFormData.doctor_id}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, doctor_id: e.target.value })}
                    className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Patient ID"
                    value={updateFormData.patient_id}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, patient_id: e.target.value })}
                    className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                    readOnly // Patient ID shouldn't change for existing appointment
                  />
                </div>

                <select
                  value={updateFormData.appointment_type}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, appointment_type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="regular">Regular</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="consultation">Consultation</option>
                </select>

                <select
                  value={updateFormData.status}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <textarea
                  placeholder="Reason*"
                  value={updateFormData.reason}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, reason: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Time
                  </label>
                  <input
                    type="datetime-local"
                    value={updateFormData.booked_date_time}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, booked_date_time: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}

                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => setShowUpdatePrompt(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-2">

                  <button
  onClick={handleUpdateEvent}
  disabled={actionLoading}
  className={`min-w-[120px] w-full py-2 px-4 rounded text-white ${
    actionLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  }`}
>
  {actionLoading ? (
    <div className="flex items-center justify-center">
      <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-2"></div>
      Updating...
    </div>
  ) : (
    'Update'
  )}
</button>



                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Add these styles at the top of your file
const styles = `
  .rbc-calendar-custom {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
  }
  .rbc-calendar-custom .rbc-header {
    padding: 8px;
    font-weight: 500;
    font-size: 0.875rem;
  }
  .rbc-calendar-custom .rbc-date-cell {
    padding: 4px;
    font-size: 0.875rem;
  }
  .rbc-calendar-custom .rbc-month-view {
    border-radius: 0.5rem;
  }
  .rbc-calendar-custom .rbc-month-row {
    min-height: 100px;
  }
  .rbc-calendar-custom .rbc-today {
    background-color: #f3f4f6;
  }
`;

// Add style tag to document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default MyCalendar;