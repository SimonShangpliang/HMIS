import {Consultation,Feedback} from '../models/consultation.js';
import {Room,DailyOccupancy} from '../models/facility.js';
// import mongoose from 'mongoose';

// const insertSampleConsultation = async () => {
//     await mongoose.connect('mongodb+srv://devikareddi1203:LMMNXQqC4s7KL25j@cluster0.xtsrwwj.mongodb.net/', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });

//     const newConsultation = new Consultation({
//         patient_id: '60c72b2f9b1d8b0012345678',
//         doctor_id: '60c72b2f9b1d8b0012345679',
//         dept_id:   '60c72b2f9b1d8b0012367890',
//         appointment_date: new Date('2025-04-01'),
//         start_time: '10:00 AM',
//         status: 'scheduled',
//         reason: 'Routine check-up',
//         created_by: '60c72b2f9b1d8b0012345680',
//         diagnosis: ['Cold'],
//         feedback: {
//             rating: 5,
//             comments: 'Great service!'
//         }
//     });

//     await newConsultation.save();
//     console.log('Sample consultation added successfully');
//     mongoose.connection.close();
// };

// insertSampleConsultation();


// Function to add rating and review
export const addRatingAndReview = async (req, res) => {
    const { consultationId } = req.params; // ID of the consultation
    const { dept_id, rating, comments } = req.body; // Rating and review from the user

    try {
        // Find the consultation by ID
        const consultation = await Consultation.findById(consultationId);

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Add feedback to the consultation
        consultation.feedback = {
            rating,
            comments,
            created_at: new Date()
        };

        // Save the updated consultation
        await consultation.save();

        // Also add feedback to the Feedback schema
        const newFeedback = new Feedback({
            dept_id,
            rating,
            comments,
            created_at: new Date()
        });

        await newFeedback.save(); // Save feedback in Feedback collection

        res.status(200).json({
            message: 'Feedback added successfully',
            consultationFeedback: consultation.feedback,
            feedbackSchemaEntry: newFeedback
        });
    } catch (error) {
        console.error('Error adding feedback:', error);
        res.status(500).json({ message: 'Error adding feedback', error });
    }
};

// Function to calculate department-wise rating
export const calculateDepartmentRating = async (req, res) => {
    const { departmentId } = req.params; // ID of the department
    try {
        const consultations = await Consultation.find({ 
            dept_id: departmentId, 
            "feedback.rating": { $exists: true } 
        });

        if (consultations.length === 0) {
            return res.status(200).json({ departmentRating: 0 , consultationlen : 0 });
        }

        const totalRating = consultations.reduce((sum, consultation) => sum + consultation.feedback.rating, 0);
        const departmentRating = totalRating / consultations.length;

        res.status(200).json({ departmentRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating department rating', error });
    }
};

export const getAllFeedbacks = async (req, res) => {
    try {
        // Find all feedback documents
        const feedbacks = await Feedback.find({}, { rating: 1, comments: 1, _id: 0 }); // Retrieve only rating and comments fields

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(200).json({ message: 'No feedbacks found', feedbacks: [] });
        }

        res.status(200).json({
            totalFeedbacks: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        console.error('Error in getAllFeedbacks:', error);
        res.status(500).json({ message: 'Error retrieving feedbacks', error });
    }
};
export const calculateOverallRating = async (req, res) => {
    try {
        // Find all feedback documents with ratings
        const feedbacks = await Feedback.find({ rating: { $exists: true } }, { rating: 1, _id: 0 }); // Retrieve only ratings

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(200).json({ overallRating: 0, totalFeedbacks: 0 });
        }

        // Calculate the total rating and overall average rating
        const totalFeedbacks = feedbacks.length;
        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const overallRating = totalRating / totalFeedbacks;

        res.status(200).json({
            overallRating,
            totalFeedbacks
        });
    } catch (error) {
        console.error('Error in getOverallRating:', error);
        res.status(500).json({ message: 'Error calculating overall rating', error });
    }
};

// Function to perform feedback analysis
export const analyzeFeedback = async () => {
    const feedbacks = await Feedback.find();

    const totalFeedbacks = feedbacks.length;
    const { overallRating } = await calculateOverallRating();

    return {
        totalFeedbacks,
        overallRating
    };
};

// Function to calculate rating distribution
export const getRatingDistribution = async () => {
    const consultations = await Feedback.find({ "feedback.rating": { $exists: true } });

    const distribution = consultations.reduce((acc, consultation) => {
        const rating = consultation.feedback.rating;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {});

    return { ratingDistribution: distribution };
};


// // Function to get bed occupancy trends
// export const getBedOccupancyTrends = async (req, res) => {
//     const { period } = req.params; // e.g., daily, weekly, monthly, yearly
//     const inputStartDate = req.query.startDate; // Optional start date from user input
//     const { startDate, endDate } = calculateDateRange(period, inputStartDate);

//     try {
//         const rooms = await Room.find({}); // Fetch all rooms

//         let occupiedBeds = [];
//         rooms.forEach((room) => {
//             room.beds.forEach((bed) => {
//                 // Include beds occupied within the specified date range
//                 if (bed.status === 'occupied' && bed.recordedAt >= startDate && bed.recordedAt <= endDate) {
//                     occupiedBeds.push(bed);
//                 }
//             });
//         });

//         res.json({
//             period,
//             startDate,
//             endDate,
//             occupiedBedCount: occupiedBeds.length // Total count of occupied beds
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error calculating bed occupancy trends', error });
//     }
// };

export const getBedOccupancyTrends = async (req, res) => {
    const { period } = req.params; // e.g., daily, weekly, monthly, yearly

    try {
        // Parse and normalize dates from query parameters
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        startDate.setHours(0, 0, 0, 0); // Set startDate to start of the day
        endDate.setHours(23, 59, 59, 999); // Set endDate to end of the day

        // Validate input dates
        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Invalid date format. Please provide valid startDate and endDate.' });
        }
        if (startDate > endDate) {
            return res.status(400).json({ message: 'startDate cannot be later than endDate.' });
        }

        // Fetch all DailyOccupancy entries within the given date range
        const occupancyEntries = await DailyOccupancy.find({
            date: { $gte: startDate, $lte: endDate }
        });

        let trends = []; // Placeholder for results
        if (period === 'daily') {
            // Return the count of occupied beds for each day
            trends = occupancyEntries.map(entry => ({
                date: entry.date,
                occupiedBedCount: entry.occupiedBeds.length
            }));
        } else if (period === 'weekly') {
            // Aggregate occupied bed counts by week (Monday-Sunday)
            const weekTrends = {};
            occupancyEntries.forEach(entry => {
                const weekStart = getStartOfWeek(entry.date); // Calculate the start of the week
                if (!weekTrends[weekStart]) {
                    weekTrends[weekStart] = { weekStart, occupiedBedCount: 0 };
                }
                weekTrends[weekStart].occupiedBedCount += entry.occupiedBeds.length;
            });
            trends = Object.values(weekTrends);
        } else if (period === 'monthly') {
            // Aggregate occupied bed counts by month
            const monthTrends = {};
            occupancyEntries.forEach(entry => {
                const monthStart = getStartOfMonth(entry.date); // Calculate the start of the month
                if (!monthTrends[monthStart]) {
                    monthTrends[monthStart] = { monthStart, occupiedBedCount: 0 };
                }
                monthTrends[monthStart].occupiedBedCount += entry.occupiedBeds.length;
            });
            trends = Object.values(monthTrends);
        } else if (period === 'yearly') {
            // Aggregate occupied bed counts by year
            const yearTrends = {};
            occupancyEntries.forEach(entry => {
                const yearStart = getStartOfYear(entry.date); // Calculate the start of the year
                if (!yearTrends[yearStart]) {
                    yearTrends[yearStart] = { yearStart, occupiedBedCount: 0 };
                }
                yearTrends[yearStart].occupiedBedCount += entry.occupiedBeds.length;
            });
            trends = Object.values(yearTrends);
        } else {
            // Handle invalid period input
            return res.status(400).json({ message: 'Invalid period. Please provide one of daily, weekly, monthly, or yearly.' });
        }

        // Send successful response
        res.status(200).json({
            occupancyEntries,
            period,
            startDate,
            endDate,
            trends
        });
    } catch (error) {
        console.error('Error calculating bed occupancy trends:', error);
        res.status(500).json({ message: 'Error calculating bed occupancy trends', error });
    }
};

// Helper Functions
const getStartOfWeek = date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
    return new Date(d.setDate(diff)).toISOString().split('T')[0]; // Return as YYYY-MM-DD
};

const getStartOfMonth = date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]; // YYYY-MM-DD
};

const getStartOfYear = date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]; // YYYY-MM-DD
};
// Function to return overall statistics (total beds, total rooms)
export const getFacilityStatistics = async (req, res) => {
    try {
        const rooms = await Room.find({});
        const totalRooms = rooms.length;
        let totalBeds = 0;
        rooms.forEach(room => {
            totalBeds += room.beds.length;
        });

        res.json({ totalRooms, totalBeds,rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching facility statistics', error });
    }
};

export const updateDailyOccupancy = async () => {
    try {
        const today = new Date();
        const todayDate = new Date(today.setHours(0, 0, 0, 0)); // Normalize to midnight

        // Find all beds with 'occupied' status
        const rooms = await Room.find({
            "beds.status": "occupied",
            "occupancy_start_date": { $lt: today } // Filter for occupancy_start_date before today
        });
        
        const occupiedBedIds = [];
        rooms.forEach(room => {
            room.beds.forEach(bed => {
                if (bed.status === "occupied") {
                    occupiedBedIds.push(bed._id); // Collect all occupied bed IDs
                }
            });
        });

        // Insert or update today's entry in DailyOccupancy schema
        const existingEntry = await DailyOccupancy.findOne({ date: todayDate });

        if (existingEntry) {
            // Update the entry if it exists
            existingEntry.occupiedBeds = occupiedBedIds;
            await existingEntry.save();
            console.log('Daily occupancy updated for:', todayDate);
        } else {
            // Create a new entry for the day
            const newEntry = new DailyOccupancy({
                date: todayDate,
                occupiedBeds: occupiedBedIds
            });
            await newEntry.save();
            console.log('Daily occupancy created for:', todayDate);
        }
    } catch (error) {
        console.error('Error updating daily occupancy:', error);
    }
};