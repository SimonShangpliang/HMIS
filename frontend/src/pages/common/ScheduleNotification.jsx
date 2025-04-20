import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Box, Typography, FormControlLabel, 
  Switch, FormControl, InputLabel, Select, MenuItem, 
  Snackbar, Alert, Grid, Divider, IconButton,
  Tooltip, Card, CardContent, Chip, InputAdornment, 
  Fade, Skeleton, Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import axios from 'axios';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useAuth } from '../../context/AuthContext'; // Add this import at the top

const ScheduleNotification = () => {
  // Add auth context to access the authenticated axios instance
  const { axiosInstance } = useAuth();
  
  // Add a loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    receiverEmail: '',
    content: '',
    future: false,
    scheduledDateTime: new Date(Date.now() + 3600000),
    recurring: false,
    frequencyNumber: 1,
    frequencyUnit: 'days'
  });
  
  // Recipient selection states
  const [recipientType, setRecipientType] = useState('manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  
  // Feedback states
  const [alert, setAlert] = useState({
    open: false,
    severity: 'success',
    message: ''
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    data: null
  });

  // Filter contacts whenever search query changes
  useEffect(() => {
    if (recipientType !== 'manual' && recipientType !== 'patient') {
      filterContacts();
    }
  }, [searchQuery, allContacts]);
  
  // Filter the contacts based on search query
  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(allContacts);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allContacts.filter(contact => 
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
    
    setFilteredContacts(filtered);
  };

  // Fetch all contacts for the selected role
  const fetchContactsByRole = async (role) => {
    setIsLoading(true);
    setAllContacts([]);
    setFilteredContacts([]);
    setLookupError('');
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/employees/by-role/${role}`);
      
      // Filter employees to only include those with emails
      const contactsWithEmail = response.data.filter(emp => emp.email);
      
      setAllContacts(contactsWithEmail);
      setFilteredContacts(contactsWithEmail);
      
      if (contactsWithEmail.length === 0) {
        setLookupError(`No ${role}s found with email addresses`);
      }
    } catch (error) {
      console.error(`Error fetching ${role}s:`, error);
      setLookupError(`Failed to fetch ${role}s. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Form field handlers
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDateChange = (newValue) => {
    setFormData({
      ...formData,
      scheduledDateTime: newValue
    });
  };
  
  // Alert handlers
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Form validation
  const validateForm = () => {
    if (!formData.receiverEmail) {
      showAlert('error', 'Recipient email is required');
      return false;
    }
    
    // Email validation (basic)
    if (!/\S+@\S+\.\S+/.test(formData.receiverEmail)) {
      showAlert('error', 'Please enter a valid email address');
      return false;
    }
    
    if (!formData.content) {
      showAlert('error', 'Message content is required');
      return false;
    }
    
    if (formData.future && formData.scheduledDateTime <= new Date()) {
      showAlert('error', 'Scheduled date must be in the future');
      return false;
    }
    
    if (formData.recurring && (!formData.frequencyNumber || formData.frequencyNumber < 1)) {
      showAlert('error', 'Please enter a valid frequency (minimum 1)');
      return false;
    }
    
    return true;
  };
  
  // Form submission handlers
  const openConfirmDialog = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const payload = {
      receiverEmail: formData.receiverEmail,
      content: formData.content,
      future: formData.future,
      recurring: formData.recurring
    };
    
    if (formData.future) {
      payload.date = format(formData.scheduledDateTime, 'yyyy-MM-dd');
      payload.time = format(formData.scheduledDateTime, 'HH:mm:ss');
    }
    
    if (formData.recurring) {
      payload.frequency = `${formData.frequencyNumber} ${formData.frequencyUnit}`;
    }
    
    setConfirmDialog({
      open: true,
      data: payload
    });
  };
  
  const handleCloseConfirm = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true); // Start loading state
      
      // Use axiosInstance instead of axios to include auth token
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/notifications/create`, confirmDialog.data);
      
      showAlert('success', 'Notification scheduled successfully');
      handleCloseConfirm();
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error scheduling notification:', error);
      showAlert('error', error.response?.data?.message || error.response?.data?.error || 'Failed to schedule notification');
      handleCloseConfirm();
    } finally {
      setIsSubmitting(false); // End loading state regardless of outcome
    }
  };
  
  const resetForm = () => {
    setFormData({
      receiverEmail: '',
      content: '',
      future: false,
      scheduledDateTime: new Date(Date.now() + 3600000),
      recurring: false,
      frequencyNumber: 1,
      frequencyUnit: 'days'
    });
    setRecipientType('manual');
    setSearchQuery('');
    setAllContacts([]);
    setFilteredContacts([]);
    setSelectedRecipient(null);
    setPatientIdInput('');
    setMaskedEmail('');
    setLookupError('');
  };

  // Helper text formatter
  const getFrequencyText = () => {
    if (!formData.recurring) return 'Not recurring';
    return `Every ${formData.frequencyNumber} ${formData.frequencyUnit}`;
  };
  
  // Email masking for privacy
  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email; // Don't mask very short usernames
    
    const firstChar = username.charAt(0);
    const lastChar = username.charAt(username.length - 1);
    const maskedUsername = `${firstChar}${'*'.repeat(Math.min(username.length - 2, 5))}${lastChar}`;
    
    return `${maskedUsername}@${domain}`;
  };
  
  // Patient lookup by ID
  const lookupPatientById = async (patientId) => {
    setIsLoading(true);
    setMaskedEmail('');
    setLookupError('');
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`);
      
      if (response.data && response.data.email) {
        const email = response.data.email;
        setFormData({
          ...formData,
          receiverEmail: email
        });
        setMaskedEmail(maskEmail(email));
      } else {
        setLookupError('Patient found but no email address is available');
      }
    } catch (error) {
      console.error('Error looking up patient:', error);
      setLookupError('Patient not found with this ID. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Recipient selection handlers
  const handleRecipientTypeChange = (event) => {
    const newType = event.target.value;
    setRecipientType(newType);
    
    // Reset states
    setSearchQuery('');
    setSelectedRecipient(null);
    setPatientIdInput('');
    setMaskedEmail('');
    setLookupError('');
    setFormData({
      ...formData,
      receiverEmail: ''
    });
    
    // If staff type is selected, fetch all staff of that role
    if (newType !== 'manual' && newType !== 'patient') {
      fetchContactsByRole(newType);
    } else {
      // Clear contacts for manual or patient selection
      setAllContacts([]);
      setFilteredContacts([]);
    }
  };
  
  // Search and filter handlers
  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSelectRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setFormData({
      ...formData,
      receiverEmail: recipient.email
    });
    setMaskedEmail(maskEmail(recipient.email));
  };
  
  // Patient ID handlers
  const handlePatientIdChange = (event) => {
    setPatientIdInput(event.target.value);
  };
  
  const handlePatientLookup = () => {
    if (!patientIdInput.trim()) return;
    lookupPatientById(patientIdInput);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Card 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': { boxShadow: 6 }
        }}
      >
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(120deg, #2196f3 0%, #0d47a1 100%)',
          color: 'white'
        }}>
          <Typography variant="h5" component="h1" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SendIcon fontSize="large" />
            Schedule Notification
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Send one-time or recurring notifications to staff and patients
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={openConfirmDialog}>
            {/* Recipient Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                pb: 1.5,
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <PeopleAltIcon color="primary" /> 
                <span>Select Recipient</span>
              </Typography>
              
              {/* Recipient Type Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="recipient-type-label">Recipient Type</InputLabel>
                <Select
                  labelId="recipient-type-label"
                  value={recipientType}
                  onChange={handleRecipientTypeChange}
                  label="Recipient Type"
                >
                  <MenuItem value="manual">Enter Email Manually</MenuItem>
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  <MenuItem value="pathologist">Pathologist</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              
              {/* Manual Email Entry */}
              {recipientType === 'manual' && (
                <Fade in={recipientType === 'manual'}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Email Address"
                    name="receiverEmail"
                    value={formData.receiverEmail}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter complete email address"
                  />
                </Fade>
              )}
              
              {/* Patient Lookup by ID */}
              {recipientType === 'patient' && (
                <Fade in={recipientType === 'patient'}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(0,0,0,0.02)', 
                      borderRadius: 2,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Patient ID"
                        value={patientIdInput}
                        onChange={handlePatientIdChange}
                        placeholder="Enter patient ID number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handlePatientLookup}
                        disabled={isLoading || !patientIdInput.trim()}
                        sx={{ 
                          minWidth: '120px',
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Lookup'}
                      </Button>
                    </Box>
                    
                    {maskedEmail && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2.5, 
                        bgcolor: 'success.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'success.200'
                      }}>
                        <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                          <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Patient found with email: <strong>{maskedEmail}</strong>
                        </Typography>
                      </Box>
                    )}
                    
                    {lookupError && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2.5, 
                        bgcolor: 'error.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'error.200'
                      }}>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                          {lookupError}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Fade>
              )}
              
              {/* Staff Search */}
              {recipientType !== 'manual' && recipientType !== 'patient' && (
                <Fade in={recipientType !== 'manual' && recipientType !== 'patient'}>
                  <Box>
                    <Box sx={{ mb: 2.5 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label={`Filter ${recipientType}s by name`}
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                        placeholder={`Type to filter ${recipientType}s`}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={isLoading}
                      />
                    </Box>
                    
                    {/* Loading State */}
                    {isLoading && (
                      <Box sx={{ my: 2 }}>
                        <Skeleton animation="wave" height={60} />
                        <Skeleton animation="wave" height={60} />
                        <Skeleton animation="wave" height={60} />
                      </Box>
                    )}
                    
                    {/* Error State */}
                    {lookupError && !isLoading && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 3, 
                        bgcolor: 'error.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.200',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body1" color="error.main" sx={{ fontWeight: 500 }}>
                          {lookupError}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Results Count */}
                    {filteredContacts.length > 0 && !isLoading && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {searchQuery ? `${filteredContacts.length} results for "${searchQuery}"` : `${filteredContacts.length} ${recipientType}s found`}
                        </Typography>
                        
                        {selectedRecipient && (
                          <Chip 
                            color="primary" 
                            variant="outlined"
                            label={`Selected: ${selectedRecipient.name}`}
                            onDelete={() => setSelectedRecipient(null)}
                            size="small"
                          />
                        )}
                      </Box>
                    )}
                    
                    {/* Search Results */}
                    {filteredContacts.length > 0 && !isLoading ? (
                      <Paper 
                        elevation={1}
                        sx={{ 
                          maxHeight: '250px', 
                          overflowY: 'auto', 
                          mb: 2, 
                          borderRadius: 2,
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <List dense>
                          {filteredContacts.map((contact) => (
                            <ListItem 
                              key={contact._id}
                              button
                              selected={selectedRecipient && selectedRecipient._id === contact._id}
                              onClick={() => handleSelectRecipient(contact)}
                              sx={{
                                transition: 'all 0.2s ease',
                                borderLeft: '4px solid transparent',
                                '&.Mui-selected': {
                                  bgcolor: 'primary.50',
                                  borderLeftColor: 'primary.main'
                                },
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.04)'
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  src={contact.profile_pic || undefined}
                                  sx={{ 
                                    bgcolor: selectedRecipient?.name === contact.name ? 'primary.main' : 'grey.400',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {contact.name?.charAt(0) || 'U'}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={
                                  <Typography variant="subtitle2">
                                    {contact.name || 'Unknown Name'}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {maskEmail(contact.email)}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    ) : (
                      // Empty State when no results and not loading
                      !isLoading && !lookupError && (
                        <Box sx={{ 
                          p: 4, 
                          textAlign: 'center', 
                          bgcolor: 'rgba(0,0,0,0.02)', 
                          borderRadius: 2,
                          border: '1px dashed rgba(0,0,0,0.2)',
                        }}>
                          <Typography color="text.secondary">
                            No matching {recipientType}s found
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Fade>
              )}
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            {/* Message Content Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                pb: 1.5,
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <MessageIcon color="primary" /> 
                <span>Message Content</span>
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                label="Message"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                multiline
                rows={4}
                placeholder="Type your notification message here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            {/* Scheduling Options */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                pb: 1.5,
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <AccessTimeIcon color="primary" /> 
                <span>Scheduling Options</span>
              </Typography>
              
              <Paper
                elevation={0}
                sx={{ 
                  mb: 2, 
                  p: 2.5, 
                  bgcolor: 'rgba(0,0,0,0.02)', 
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.future}
                      onChange={handleChange}
                      name="future"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={500}>Schedule for Future</Typography>
                      <Tooltip title="Toggle to schedule the notification for a future date and time">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                  }
                />
              </Paper>
              
              {formData.future && (
                <Fade in={formData.future}>
                  <Paper 
                    elevation={1}
                    sx={{ 
                      mt: 3, 
                      p: 3, 
                      borderRadius: 2, 
                      border: '1px solid rgba(25, 118, 210, 0.2)',
                      bgcolor: 'rgba(25, 118, 210, 0.02)'
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Schedule Date & Time"
                        value={formData.scheduledDateTime}
                        onChange={handleDateChange}
                        minDateTime={new Date()}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                    
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.recurring}
                            onChange={handleChange}
                            name="recurring"
                            color="secondary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={500} display="flex" alignItems="center">
                              <RepeatIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                              Make Recurring
                            </Typography>
                            <Tooltip title="Enable to send this notification repeatedly based on frequency">
                              <HelpOutlineIcon fontSize="small" color="action" />
                            </Tooltip>
                          </Box>
                        }
                      />
                    </Box>
                    
                    {formData.recurring && (
                      <Fade in={formData.recurring}>
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                            Set how often this notification should repeat:
                          </Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Frequency"
                                name="frequencyNumber"
                                value={formData.frequencyNumber}
                                onChange={handleChange}
                                inputProps={{ min: 1 }}
                                required={formData.recurring}
                              />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                              <FormControl fullWidth>
                                <InputLabel>Unit</InputLabel>
                                <Select
                                  name="frequencyUnit"
                                  value={formData.frequencyUnit}
                                  onChange={handleChange}
                                  label="Unit"
                                >
                                  <MenuItem value="days">Days</MenuItem>
                                  <MenuItem value="weeks">Weeks</MenuItem>
                                  <MenuItem value="months">Months</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Box>
                      </Fade>
                    )}
                  </Paper>
                </Fade>
              )}
            </Box>
            
            {/* Submit Button */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={isLoading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                sx={{ 
                  py: 1.5, 
                  px: 5, 
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(25, 118, 210, 0.5)',
                  }
                }}
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? 'Submitting...' : 'Schedule Notification'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          variant="filled"
          elevation={6}
          sx={{ borderRadius: 2, fontWeight: 500 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={handleCloseConfirm}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Confirm Notification Schedule
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText component="div">
            {confirmDialog.data && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Please review the notification details:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Recipient:</Typography>
                  <Typography variant="body2" fontWeight={500}>{confirmDialog.data.receiverEmail}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Message:</Typography>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, mt: 0.5 }}>
                    <Typography variant="body2">{confirmDialog.data.content}</Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Schedule:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {confirmDialog.data.future ? 
                      `${confirmDialog.data.date} at ${confirmDialog.data.time}` : 
                      'Immediate'}
                  </Typography>
                </Box>
                
                {confirmDialog.data.recurring && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Recurring:</Typography>
                    <Chip 
                      icon={<RepeatIcon />} 
                      label={getFrequencyText()}
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseConfirm} 
            color="inherit"
            disabled={isSubmitting} // Disable cancel during submission
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained" 
            autoFocus
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            disabled={isSubmitting} // Disable during submission
          >
            {isSubmitting ? 'Sending...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleNotification;