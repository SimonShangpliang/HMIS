import React, { useState, useEffect } from 'react';
import { 
  TextField, Box, Typography,
  Snackbar, Alert, Fade, InputAdornment, Chip,
  Paper, CircularProgress, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, Button,
  useTheme, useMediaQuery, Divider, Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import FilterListIcon from '@mui/icons-material/FilterList';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const NotificationManagement = () => {
  const { axiosInstance, user } = useAuth();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  // const isAdmin = user?.role === 'admin';
  const isAdmin = role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // States
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    future: true,
    recurring: true
  });
  const [alert, setAlert] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications when search query or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, notifications, filters]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // For regular users, get only their notifications
      // For admins, get all notifications
      let endpoint = '/notifications';
      if (!isAdmin) {
        const cleanEmail = email.replace(/^"|"$/g, '');
        endpoint += `?email=${encodeURIComponent(cleanEmail)}`;
      }
      
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}${endpoint}`);
      
      setNotifications(response.data.notifications);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showAlert('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply all filters (search and type filters)
  const applyFilters = () => {
    // First filter by search query
    let filtered = notifications;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.receiverEmail?.toLowerCase().includes(query) ||
        notification.content?.toLowerCase().includes(query) ||
        notification._id?.includes(query) ||
        notification.senderEmail?.toLowerCase().includes(query)
      );
    }
    
    // Then apply type filters
    filtered = filtered.filter(notification => {
      // If both filters are false, show nothing
      if (!filters.future && !filters.recurring) return false;
      
      // If both filters are true, check if notification is either future or recurring
      if (filters.future && filters.recurring) {
        return notification.future || notification.recurring;
      }
      
      // Otherwise check individual filters
      if (filters.future && notification.future) return true;
      if (filters.recurring && notification.recurring) return true;
      
      return false;
    });
    
    setFilteredNotifications(filtered);
  };

  // Toggle filter state
  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  // Delete notification after confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedNotification) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/notifications/${selectedNotification._id}`);
      
      // Remove the deleted notification from the list
      setNotifications(prev => prev.filter(n => n._id !== selectedNotification._id));
      
      showAlert('success', 'Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showAlert('error', 'Failed to delete notification');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  // Close delete dialog
  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedNotification(null);
  };
  
  // Show alert message
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  // Close alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };
  
  // Format notification ID to show only last 6 chars
  const formatNotificationId = (id) => {
    return id.slice(-6);
  };
  
  // Get first few words of a message
  const getMessagePreview = (content, wordCount = 5) => {
    if (!content) return '';
    const words = content.split(' ');
    const preview = words.slice(0, wordCount).join(' ');
    return words.length > wordCount ? `${preview}...` : preview;
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchNotifications();
  };

  // Generate avatar background color based on email
  const generateAvatarColor = (email) => {
    if (!email) return '#9c27b0';
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', // Blues
      '#009688', '#4caf50', '#8bc34a', // Greens
      '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', // Yellows/Oranges
      '#ff5722', '#f44336', '#e91e63', '#9c27b0', // Reds/Pinks/Purples
      '#673ab7', '#3f51b5', '#607d8b' // Purples/Blues/Grey
    ];
    return colors[hash % colors.length];
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ 
        p: { xs: 2.5, md: 3 }, 
        background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 50%, #5e35b1 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Box>
          <Typography 
            variant="h5" 
            component="h1" 
            fontWeight="600" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            <NotificationsActiveIcon fontSize="large" />
            Manage Notifications
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            View and manage your scheduled and recurring notifications
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
            },
            backdropFilter: 'blur(4px)',
            fontWeight: 500
          }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      {/* Search bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by recipient email, content, or notification ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s',
              '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(156, 39, 176, 0.2)',
              }
            }
          }}
        />
      </Box>
      
      {/* Status bar with filter chips */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        mb: { xs: 2, md: 3 },
        flexWrap: 'wrap',
        gap: 1.5,
        px: 0.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title={`${filters.future ? 'Hide' : 'Show'} future notifications`} arrow>
            <Chip 
              icon={<AccessTimeIcon />} 
              label="Future" 
              size="small" 
              color={filters.future ? "info" : "default"} 
              variant={filters.future ? "filled" : "outlined"} 
              sx={{ 
                borderWidth: 1.5,
                cursor: 'pointer',
                opacity: filters.future ? 1 : 0.7,
                fontWeight: filters.future ? 600 : 400
              }}
              onClick={() => toggleFilter('future')}
            />
          </Tooltip>
          <Tooltip title={`${filters.recurring ? 'Hide' : 'Show'} recurring notifications`} arrow>
            <Chip 
              icon={<RepeatIcon />} 
              label="Recurring" 
              size="small" 
              color={filters.recurring ? "secondary" : "default"} 
              variant={filters.recurring ? "filled" : "outlined"}
              sx={{ 
                borderWidth: 1.5,
                cursor: 'pointer',
                opacity: filters.recurring ? 1 : 0.7,
                fontWeight: filters.recurring ? 600 : 400
              }}
              onClick={() => toggleFilter('recurring')}
            />
          </Tooltip>
        </Box>
      </Box>
      
      {/* Main content area */}
      {loading ? (
        <Paper
          elevation={0}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            bgcolor: 'rgba(0,0,0,0.01)',
            borderRadius: 3,
            border: '1px dashed rgba(0,0,0,0.1)',
          }}
        >
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading notifications
          </Typography>
        </Paper>
      ) : filteredNotifications.length === 0 ? (
        /* Empty state */
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            bgcolor: 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            border: '1px dashed rgba(0,0,0,0.15)',
            transition: 'all 0.3s',
          }}
        >
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(103, 58, 183, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5
          }}>
            <NotificationsOffIcon sx={{ fontSize: 40, color: '#673ab7', opacity: 0.8 }} />
          </Box>
          <Typography variant="h6" color="text.primary" fontWeight={500} gutterBottom>
            No Notifications Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            {!filters.future && !filters.recurring
              ? 'Enable at least one filter type to view notifications'
              : searchQuery 
                ? 'Try adjusting your search criteria or clear the search field' 
                : 'You have not created any notifications matching the current filters'}
          </Typography>
          {searchQuery && (
            <Button 
              variant="outlined" 
              size="small"
              sx={{ mt: 2 }}
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          )}
          {!filters.future && !filters.recurring && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="info"
                size="small"
                onClick={() => toggleFilter('future')}
                startIcon={<AccessTimeIcon />}
              >
                Show Future
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                size="small"
                onClick={() => toggleFilter('recurring')}
                startIcon={<RepeatIcon />}
              >
                Show Recurring
              </Button>
            </Box>
          )}
        </Paper>
      ) : (
        /* Notifications table */
        <Box sx={{ width: '100%', overflow: 'auto' }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3, 
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 3px, rgba(0, 0, 0, 0.1) 0px 1px 2px',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '10px',
                height: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#bdbdbd',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              // Ensure table fits without horizontal overflow on smaller screens
              minWidth: isAdmin ? '900px' : '750px',
              maxWidth: '100%',
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(103, 58, 183, 0.05)'
              }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, minWidth: 150 }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>Scheduled</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>Type</TableCell>
                  {isAdmin && (
                    <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>Created By</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600, py: 2, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow 
                    key={notification._id} 
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(103, 58, 183, 0.03)'
                      }
                    }}
                  >
                    <TableCell>
                      <Tooltip title={`Full ID: ${notification._id}`} arrow placement="top">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 600,
                            bgcolor: 'rgba(103, 58, 183, 0.1)',
                            borderRadius: '4px',
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            color: '#673ab7'
                          }}
                        >
                          {formatNotificationId(notification._id)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={notification.content} arrow placement="top">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'default',
                            '&:hover': {
                              color: '#673ab7',
                            }
                          }}
                        >
                          {getMessagePreview(notification.content)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: generateAvatarColor(notification.receiverEmail),
                            fontSize: '0.8rem',
                          }}
                        >
                          {notification.receiverEmail?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {notification.receiverEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(notification.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                        {notification.recurring && (
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={notification.frequency} 
                              size="small" 
                              color="secondary" 
                              sx={{ 
                                maxWidth: 'fit-content',
                                height: '20px', 
                                '& .MuiChip-label': { px: 1, py: 0, fontSize: '0.7rem', fontWeight: 500 } 
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {notification.future && (
                          <Chip 
                            label="Future" 
                            size="small" 
                            color="info" 
                            sx={{ height: '22px', '& .MuiChip-label': { px: 1 } }}
                          />
                        )}
                        {notification.recurring && (
                          <Chip 
                            label="Recurring" 
                            size="small" 
                            color="secondary" 
                            sx={{ height: '22px', '& .MuiChip-label': { px: 1 } }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              bgcolor: generateAvatarColor(notification.senderEmail),
                              fontSize: '0.8rem',
                            }}
                          >
                            {notification.senderEmail?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notification.senderEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell>
                      <Tooltip title="Delete notification" arrow placement="top">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(notification)}
                          aria-label="delete notification"
                          sx={{ 
                            border: '1px solid rgba(211, 47, 47, 0.5)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              border: '1px solid rgba(211, 47, 47, 0.8)',
                            },
                            // Ensure delete button is always visible
                            minWidth: 32,
                            minHeight: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px',
            maxWidth: '450px',
            width: '100%'
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <WarningAmberIcon />
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <DialogContentText sx={{ color: 'text.primary', fontWeight: 500 }}>
            Are you sure you want to delete this notification?
            {selectedNotification?.recurring && (
              <Box component="span" fontWeight="bold" sx={{ color: 'error.main' }}> This will also cancel all future recurrences.</Box>
            )}
          </DialogContentText>
          {selectedNotification && (
            <Paper
              elevation={0}
              sx={{ 
                mt: 3, 
                p: 2.5, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notification details:
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    <PersonIcon fontSize="small" />
                  </Box>
                  <Typography variant="body2">
                    <strong>ID:</strong> {selectedNotification._id ? formatNotificationId(selectedNotification._id) : ''}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    <EmailIcon fontSize="small" />
                  </Box>
                  <Typography variant="body2" sx={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                    <strong>To:</strong> {selectedNotification.receiverEmail}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 0.5 }} />
                
                <Typography variant="body2" sx={{ pl: 1.5, borderLeft: '3px solid #673ab7', py: 1 }}>
                  {getMessagePreview(selectedNotification.content, 15)}
                </Typography>
                
                {selectedNotification.recurring && (
                  <Typography variant="body2" color="error.main" fontWeight={500} sx={{ mt: 1 }}>
                    This is a recurring notification set to repeat every {selectedNotification.frequency}.
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button 
            onClick={handleDialogClose} 
            color="inherit"
            disabled={deleting}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
              }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity}
          variant="filled"
          elevation={6}
          sx={{ 
            borderRadius: 2, 
            fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationManagement;