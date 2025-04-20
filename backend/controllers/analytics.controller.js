import {Consultation,Feedback} from '../models/consultation.js';
import {Room} from '../models/facility.js';
import LogModels from '../models/logs.js';
import Medicine from '../models/inventory.js';
import BillModels  from '../models/bill.js';
import {Doctor} from '../models/staff.js';
import Department from '../models/department.js';

import {PrescriptionEntry,Prescription} from '../models/consultation.js'; 
import Employee from '../models/employee.js';
import Patient from '../models/patient.js';
import {Receptionist} from '../models/staff.js';  

import Diagnosis from '../models/diagnosis.js';
import mongoose from 'mongoose';
import moment from 'moment';



const {Bill,BillItem} = BillModels;
const {MedicineInventoryLog, BedLog} = LogModels;

export const addMedicine = async (req, res) => {
  try {
    const {
      med_name,
      effectiveness,
      dosage_form,
      manufacturer,
      available,
      inventory
    } = req.body;

    const newMedicine = new Medicine({
      med_name,
      effectiveness,
      dosage_form,
      manufacturer,
      available,
      inventory
    });

    const savedMedicine = await newMedicine.save();
    res.status(201).json({ message: 'Medicine added successfully', data: savedMedicine });

  } catch (error) {
    res.status(500).json({ error: 'Failed to add medicine', details: error.message });
  }
};

export const addInventoryLog = async (req, res) => {
  try {
    const {
      med_id,
      quantity,
      total_cost,
      order_date,
      supplier,
      status
    } = req.body;

    const newLog = new MedicineInventoryLog({
      med_id,
      quantity,
      total_cost,
      order_date,
      supplier,
      status
    });

    const savedLog = await newLog.save();
    res.status(201).json({ message: 'Inventory log added successfully', data: savedLog });

  } catch (error) {
    res.status(500).json({ error: 'Failed to add inventory log', details: error.message });
  }
};

export const addItemToBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const itemData = req.body;

    // Step 1: Find the bill
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Step 2: Create a new BillItem document in the collection
    const newBillItem = new BillItem(itemData);
    await newBillItem.save();

    // Step 3: Push the saved BillItem into the Bill's embedded items array
    bill.items.push(newBillItem);
    await bill.save();

    res.status(200).json({ message: 'Item added to bill', bill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  export const createBill = async (req, res) => {
    try {
      const billData = req.body;
  
      const newBill = new Bill(billData);
      await newBill.save();
  
      res.status(201).json({ message: 'Bill created successfully', bill: newBill });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  export const createPrescription = async (req, res) => {
    try {
      const prescriptionData = req.body;
  
      const newPrescription = new Prescription(prescriptionData);
      await newPrescription.save();
  
      res.status(201).json({ message: 'Prescription created successfully', prescription: newPrescription });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

export const addPrescriptionEntry = async (req, res) => {
  try {
    const {
      prescription_id,
      medicine_id,
      dosage,
      frequency,
      duration,
      quantity,
      dispensed_qty = 0
    } = req.body;

    const newEntry = new PrescriptionEntry({
      prescription_id,
      medicine_id,
      dosage,
      frequency,
      duration,
      quantity,
      dispensed_qty
    });

    await newEntry.save();
    res.status(201).json({
      message: 'Prescription entry added successfully',
      data: newEntry
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
        res.status(500).json({ message: 'Error calculating department rating', error });
    }
};

export const getAllFeedbacks = async (req, res) => {
    try {
        // Find all feedback documents
        const feedbacks = await Feedback.find({}); // Retrieve only rating and comments fields

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(200).json({ message: 'No feedbacks found', feedbacks: [] });
        }

        res.status(200).json({
            totalFeedbacks: feedbacks.length,
            feedbacks
        });
    } catch (error) {
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
        res.status(500).json({ message: 'Error calculating overall rating', error });
    }
};

// Function to calculate rating distribution
export const getRatingDistribution = async (req, res) => {
  try {
    const distribution = await Consultation.aggregate([
      // Filter documents that have a feedback rating
      { $match: { 'feedback.rating': { $exists: true, $ne: null } } },
      
      // Group by rating and count occurrences
      { $group: {
          _id: '$feedback.rating',
          count: { $sum: 1 }
        }
      },
      
      // Sort by rating (optional)
      { $sort: { _id: 1 } },
      
      // Reshape to match the expected output format
      { $group: {
          _id: null,
          distribution: { 
            $push: { 
              k: { $toString: '$_id' }, 
              v: '$count' 
            } 
          }
        }
      },
      
      // Convert array to object with rating as key and count as value
      { $replaceRoot: { 
          newRoot: { 
            $arrayToObject: { 
              $map: { 
                input: '$distribution', 
                as: 'item', 
                in: ['$$item.k', '$$item.v'] 
              } 
            } 
          } 
        }
      }
    ]);

    return res.json({ 
      ratingDistribution: distribution.length > 0 ? distribution[0] : {} 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch rating distribution' });
  }
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
        res.status(500).json({ message: 'Error fetching facility statistics', error });
    }
};

async function initializeDailyOccupancy() {
  try {
    // Get today's date at midnight.
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Determine yesterday's date.
    const yesterday = new Date(todayMidnight);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Fetch yesterday's document, if it exists.
    const yesterdayDoc = await DailyBedOccupancy.findOne({ date: yesterday });
    const previousOccupancy = yesterdayDoc ? yesterdayDoc.occupancyCount : 0;
    
    // Create today's document if it doesn't already exist.
    const existingToday = await DailyBedOccupancy.findOne({ date: todayMidnight });
    if (!existingToday) {
      await DailyBedOccupancy.create({
        date: todayMidnight,
        assignments: 0,
        discharges: 0,
        occupancyCount: previousOccupancy
      });
      console.log(`Daily occupancy initialized for ${todayMidnight.toISOString().split('T')[0]} with count ${previousOccupancy}`);
    }
  } catch (error) {
  }
}

export default initializeDailyOccupancy;

export const getBedOccupancyTrends = async (req, res) => {
  try {
    const { period } = req.params;
    const { startDate, endDate, bedType } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format provided.' });
    }

    // Build query filter
    const filter = {
      time: { $gte: start, $lte: end }
    };

    // Add bed type filter if specified
    if (bedType && bedType !== 'all') {
      filter.bed_type = bedType;
    }

    // Get all bed logs within the date range
    const bedLogs = await BedLog.find(filter).sort({ time: 1 });

    // Process data based on period
    let trends = [];
    
    if (period === 'weekly') {
      const weeklyMap = {};
      
      // Process each log entry
      bedLogs.forEach(log => {
        const m = moment(log.time);
        const key = `${m.isoWeekYear()}-W${m.isoWeek()}`;
        
        if (!weeklyMap[key]) {
          weeklyMap[key] = { 
            week: key, 
            occupied: 0,
            vacated: 0,
            totalCount: 0
          };
        }
        
        // Update counts based on status
        if (log.status === 'occupied') {
          weeklyMap[key].occupied++;
        } else if (log.status === 'vacated') {
          weeklyMap[key].vacated++;
        }
        
        weeklyMap[key].totalCount++;
      });
      
      trends = Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));
      
    } else if (period === 'monthly') {
      const monthlyMap = {};
      
      // Process each log entry
      bedLogs.forEach(log => {
        const m = moment(log.time);
        const key = m.format("YYYY-MM");
        
        if (!monthlyMap[key]) {
          monthlyMap[key] = { 
            month: key, 
            occupied: 0,
            vacated: 0,
            totalCount: 0
          };
        }
        
        // Update counts based on status
        if (log.status === 'occupied') {
          monthlyMap[key].occupied++;
        } else if (log.status === 'vacated') {
          monthlyMap[key].vacated++;
        }
        
        monthlyMap[key].totalCount++;
      });
      
      trends = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
      
    } else {
      return res.status(400).json({ message: 'Invalid period. Valid options are weekly or monthly.' });
    }

    // Calculate net occupancy (occupied - vacated) for each period
    trends.forEach(item => {
      item.netOccupancy = item.occupied - item.vacated;
    });

    res.status(200).json({
      period,
      bedType: bedType || 'all',
      startDate: moment(start).format("YYYY-MM-DD"),
      endDate: moment(end).format("YYYY-MM-DD"),
      trends
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getMedicines = async (req, res) => {
  try {
    // Find all medicines, returning only id and name fields for efficiency
    const medicines = await Medicine.find({}, '_id med_name');
    
    // Format the data for frontend consumption
    const formattedMedicines = medicines.filter(medicine => {
      return medicine._id;
    }).map(medicine => ({
      id: medicine._id.toString(),
      name: medicine.med_name
    }));
    
    // Return the formatted data
    res.json(formattedMedicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMedicineInventoryTrends = async (req, res) => {
  try {
    const { medicineId, startDate, endDate } = req.body;
    const medId = parseInt(medicineId);

    if (isNaN(medId)) {
    return res.status(400).json({ message: 'Invalid medicineId' });
    }
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
 
    // Query MedicineInventoryLog for the specified medicine and date range
    const inventoryLogs = await MedicineInventoryLog.aggregate([
      {
        $match: {
          med_id: medId,
          order_date: { $gte: start, $lte: end },
          status: "received"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$order_date" },
            month: { $month: "$order_date" }
          },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);
 
    // Format monthly data
    const monthLabels = [];
    const monthValues = [];
 
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    inventoryLogs.forEach(item => {
      const monthName = monthNames[item._id.month - 1];
      monthLabels.push(`${monthName} ${item._id.year}`);
      monthValues.push(item.totalQuantity);
    });
 
    // Get weekly data for each month
    const weeklyDataByMonth = {};
 
    for (const monthLabel of monthLabels) {
      const [month, year] = monthLabel.split(' ');
      const monthIndex = monthNames.indexOf(month);
 
      // Find first and last day of the month
      const firstDay = new Date(parseInt(year), monthIndex, 1);
      const lastDay = new Date(parseInt(year), monthIndex + 1, 0);
 
      // Group by week within month
      const weeklyData = await MedicineInventoryLog.aggregate([
        {
          $match: {
            med_id: parseInt(medicineId),
            order_date: { $gte: firstDay, $lte: lastDay },
            status: "received"
          }
        },
        {
          $project: {
            week: { $ceil: { $divide: [{ $dayOfMonth: "$order_date" }, 7] } },
            quantity: 1
          }
        },
        {
          $group: {
            _id: "$week",
            totalQuantity: { $sum: "$quantity" }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);
 
      // Format weekly data
      const weekLabels = [];
      const weekValues = [];
 
      weeklyData.forEach((item) => {
        weekLabels.push(`Week ${item._id}`);
        weekValues.push(item.totalQuantity);
      });
 
      weeklyDataByMonth[monthLabel] = {
        labels: weekLabels,
        values: weekValues
      };
    }
 
    // Get medicine details
    const medicine = await Medicine.findOne({ _id: medId });
 
    if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
    }

    // Calculate total orders
    const totalOrders = monthValues.reduce((sum, val) => sum + val, 0);

    // Return formatted data
    res.json({
      medicine: {
        id: medicine._id.toString(),
        name: medicine.med_name
          
      },
      monthlyData: {
        labels: monthLabels,
        values: monthValues
      },
      weeklyDataByMonth,
      totalOrders
    });
 
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get prescription trends for a specific medicine
 * @param {Object} req - Request with medicineId, startDate, and endDate
 * @param {Object} res - Response object
 */
export const getMedicinePrescriptionTrends = async (req, res) => {
  try {
    const { medicineId, startDate, endDate } = req.body;
    
    if (!medicineId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    // Convert to proper types
    const medicine_id = parseInt(medicineId);
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Fetch medicine details
    const medicine = await Medicine.findOne({ _id: medicine_id });
    
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    
    // Fetch prescriptions with the specified medicine in the date range
    const prescriptions = await Prescription.find({
      prescriptionDate: { $gte: startDateTime, $lte: endDateTime },
      "entries.medicine_id": medicine_id
    });
    
    // Generate all months in the date range
    const allMonths = [];
    let currentDate = new Date(startDateTime);
    currentDate.setDate(1); // Start from the first day of the month
    
    while (currentDate <= endDateTime) {
      const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      allMonths.push(monthLabel);
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Initialize data structures
    const monthlyData = {
      labels: allMonths,
      values: new Array(allMonths.length).fill(0)
    };
    
    const weeklyDataByMonth = {};
    let totalPrescriptionsQuantity = 0;
    
    // Initialize weekly data for all months
    for (const month of allMonths) {
      // Get year and month from label
      const [monthName, yearStr] = month.split(' ');
      const year = parseInt(yearStr);
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthName);
      
      // Get number of weeks in the month
      const lastDay = new Date(year, monthIndex + 1, 0).getDate();
      const weeksInMonth = Math.ceil(lastDay / 7);
      
      const weekLabels = [];
      for (let week = 1; week <= weeksInMonth; week++) {
        weekLabels.push(`Week ${week}`);
      }
      
      weeklyDataByMonth[month] = {
        labels: weekLabels,
        values: new Array(weekLabels.length).fill(0)
      };
    }
    
    // Process each prescription
    for (const prescription of prescriptions) {
      const prescriptionDate = new Date(prescription.prescriptionDate);
      const monthLabel = prescriptionDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      // Find medicine entries in this prescription
      const medicineEntries = prescription.entries.filter(entry => 
        entry.medicine_id === medicine_id
      );
      
      // Sum quantities for this medicine
      const quantity = medicineEntries.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
      
      // Add to total
      totalPrescriptionsQuantity += quantity;
      
      // Add to monthly data
      const monthIndex = allMonths.indexOf(monthLabel);
      if (monthIndex !== -1) {
        monthlyData.values[monthIndex] += quantity;
      }
      
      // Calculate week of month (1-based)
      const date = prescriptionDate.getDate();
      const weekNum = Math.ceil(date / 7);
      const weekLabel = `Week ${weekNum}`;
      
      // Add to weekly data
      if (weeklyDataByMonth[monthLabel]) {
        const weekIndex = weeklyDataByMonth[monthLabel].labels.indexOf(weekLabel);
        if (weekIndex !== -1) {
          weeklyDataByMonth[monthLabel].values[weekIndex] += quantity;
        }
      }
    }
    
    // Prepare the response
    const response = {
      medicine: {
        id: medicine._id,
        name: medicine.name
      },
      monthlyData,
      weeklyDataByMonth,
      totalPrescriptionsQuantity
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to fetch medicine prescription trends", 
      error: error.message 
    });
  }
};

export const getDoctorRatingDistribution = async (req, res) => {
    try {
      // Define the rating ranges
      const ratingRanges = [
        { min: 1.5, max: 2.2, label: '1.5-2.2' },
        { min: 2.2, max: 2.9, label: '2.2-2.9' },
        { min: 2.9, max: 3.6, label: '2.9-3.6' },
        { min: 3.6, max: 4.3, label: '3.6-4.3' },
        { min: 4.3, max: 5.0, label: '4.3-5.0' }
      ];
  
      // Initialize result object
      const distribution = {};
      
      // Populate with initial zero counts
      ratingRanges.forEach(range => {
        distribution[range.label] = 0;
      });
  
      // Get all doctors
      const doctors = await Doctor.find({}, { rating: 1 });
      
      // Count doctors in each range
      doctors.forEach(doctor => {
        for (const range of ratingRanges) {
          if (doctor.rating >= range.min && doctor.rating < range.max) {
            distribution[range.label]++;
            break;
          } else if (range.max === 5.0 && doctor.rating === 5.0) {
            // Special case for exact 5.0 rating
            distribution[range.label]++;
            break;
          }
        }
      });
  
      return res.status(200).json({
        success: true,
        data: distribution
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctor rating distribution',
        error: error.message
      });
    }
  };

  export const getFeedbacksByRating = async (req, res) => {
  try {
    const { rating } = req.params;
    
    // Validate rating parameter
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ 
        message: 'Invalid rating. Rating must be a number between 1 and 5.' 
      });
    }
    
    // Find all consultations with the specified rating
    const consultations = await Consultation.find(
      { 'feedback.rating': ratingValue },
      { 'feedback.comments': 1, _id: 0 , 'createdAt': 1 }
    );
    
    // Extract comments from results
    const comments = consultations.map(consultation => ({
      comments: consultation.feedback.comments,
      created_at: consultation.createdAt
    }));

    res.status(200).json({
      rating: ratingValue,
      totalComments: comments.length,
      comments: comments
    });
  } catch (error) {
   res.status(500).json({ message: 'Error retrieving feedback comments', error: error.message });
  }
};

export const getAllConsultations = async (req, res) => {
    try {
      // Find all consultations
      const consultations = await Consultation.find()
        .populate('patient_id', 'name email phone_number') // Populate basic patient info
        .populate('doctor_id', 'specialization qualification') // Populate basic doctor info
        .sort({ booked_date_time: -1 }); // Sort by booked date in descending order (newest first)
      
      if (!consultations || consultations.length === 0) {
        return res.status(200).json({ 
          message: 'No consultations found', 
          consultations: [] 
        });
      }
      
      res.status(200).json({
        totalConsultations: consultations.length,
        consultations
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving consultations', 
        error: error.message 
      });
    }
  };


  // Function to retrieve data for the scatter plot
export const getDoctorQuadrantData = async(req, res) => {
    try {
      const {ratingThreshold, consultationThreshold} = req.body;
      
      const doctorData = await Consultation.aggregate([
        // Group consultations by doctor_id to count them
        { $group: { 
            _id: "$doctor_id", 
            consultationCount: { $sum: 1 } 
          } 
        },

        // Look up doctor information
        { $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctorInfo"
          }
        },
        { $unwind: "$doctorInfo" },

        // Look up employee information to get the doctor's name
        { $lookup: {
          from: "employees",
          localField: "doctorInfo.employee_id",
          foreignField: "_id",
          as: "employeeInfo"
        }
      },
      { $unwind: { 
          path: "$employeeInfo",
          preserveNullAndEmptyArrays: true 
        }
      },

        // Look up department information directly in the pipeline
        { $lookup: {
            from: "departments",
            localField: "doctorInfo.department_id",
            foreignField: "_id",
            as: "departmentInfo"
          }
        },
        { $unwind: { 
            path: "$departmentInfo",
            preserveNullAndEmptyArrays: true 
          }
        },
        // Project only the fields we need
        { $project: {
            doctorId: "$_id",
            doctorName: { $ifNull: ["$employeeInfo.name", "Unknown"] }, // Get name from employee
            department_id: "$doctorInfo.department_id",
            departmentName: { $ifNull: ["$departmentInfo.dept_name", "Unknown"] },
            rating: "$doctorInfo.rating",
            consultationCount: 1
          }
        }
      ]);
      
      
      // Categorize into quadrants - do this in memory since we already have all the data
      const quadrants = {
        highConsHighRating: [],
        highConsLowRating: [],
        lowConsHighRating: [],
        lowConsLowRating: []
      };
      
      doctorData.forEach(doctor => {
        const isHighRating = doctor.rating >= ratingThreshold;
        const isHighConsultation = doctor.consultationCount >= consultationThreshold;
        
        if (isHighRating && isHighConsultation) {
          quadrants.highConsHighRating.push(doctor);
        } else if (!isHighRating && isHighConsultation) {
          quadrants.highConsLowRating.push(doctor);
        } else if (isHighRating && !isHighConsultation) {
          quadrants.lowConsHighRating.push(doctor);
        } else {
          quadrants.lowConsLowRating.push(doctor);
        }
      });
      
      // Format for response
      const response = {
        highConsHighRating: quadrants.highConsHighRating.map(doc => ({
          DOCTOR: doc.doctorName,
          DEPARTMENT: doc.departmentName,
          RATING: doc.rating.toFixed(2),
          CONSULTATIONS: doc.consultationCount
        })),
        highConsLowRating: quadrants.highConsLowRating.map(doc => ({
          DOCTOR: doc.doctorName,
          DEPARTMENT: doc.departmentName,
          RATING: doc.rating.toFixed(2),
          CONSULTATIONS: doc.consultationCount
        })),
        lowConsHighRating: quadrants.lowConsHighRating.map(doc => ({
          DOCTOR: doc.doctorName,
          DEPARTMENT: doc.departmentName,
          RATING: doc.rating.toFixed(2),
          CONSULTATIONS: doc.consultationCount
        })),
        lowConsLowRating: quadrants.lowConsLowRating.map(doc => ({
          DOCTOR: doc.doctorName,
          DEPARTMENT: doc.departmentName,
          RATING: doc.rating.toFixed(2),
          CONSULTATIONS: doc.consultationCount
        })),
        counts: {
          highConsHighRating: quadrants.highConsHighRating.length,
          highConsLowRating: quadrants.highConsLowRating.length,
          lowConsHighRating: quadrants.lowConsHighRating.length,
          lowConsLowRating: quadrants.lowConsLowRating.length
        },
        graphData: doctorData.map(doc => ({
          doctorId: doc.doctorId,
          doctorName: doc.doctorName,
          department: doc.departmentName,
          rating: doc.rating,
          consultations: doc.consultationCount
        }))
      };
      
      // Send the response
      return res.status(200).json(response);
      
    } catch (error) {
      return res.status(500).json({ error: "Failed to retrieve doctor performance data" });
    }
  };

  // Function to categorize departments into quadrants based on thresholds
export const getDepartmentQuadrantData = async(req, res) => {
    try {
      const {ratingThreshold, consultationThreshold} = req.body;
      
      // Use aggregation pipeline to get department-level statistics
      const departmentData = await Consultation.aggregate([
        // Join with doctors collection to get doctor details
        { $lookup: {
            from: "doctors",
            localField: "doctor_id",
            foreignField: "_id",
            as: "doctorInfo"
          }
        },
        // Unwind the doctorInfo array
        { $unwind: "$doctorInfo" },
        
        // Join with departments collection to get department details
        { $lookup: {
            from: "departments",
            localField: "doctorInfo.department_id",
            foreignField: "_id",
            as: "departmentInfo"
          }
        },
        // Unwind the departmentInfo array
        { $unwind: { 
            path: "$departmentInfo",
            preserveNullAndEmptyArrays: true 
          }
        },
        
        // Group by department to get aggregated metrics
        { $group: {
            _id: "$departmentInfo._id",
            departmentName: { $first: "$departmentInfo.dept_name" },
            totalConsultations: { $sum: 1 },
            doctorIds: { $addToSet: "$doctorInfo._id" },
            // Collect all ratings to calculate average later
            ratings: { $push: "$doctorInfo.rating" }
          }
        },
        
        // Calculate averages and counts
        { $project: {
            _id: 0,
            departmentId: "$_id",
            departmentName: 1,
            totalConsultations: 1,
            doctorCount: { $size: "$doctorIds" },
            // Calculate average rating - using $avg directly might skew results if a doctor
            // has multiple consultations, so we collected unique doctor ratings above
            avgRating: { $avg: "$ratings" }
          }
        }
      ]);
      
      // Categorize into quadrants
      const quadrants = {
        highConsHighRating: [],
        highConsLowRating: [],
        lowConsHighRating: [],
        lowConsLowRating: []
      };
      
      departmentData.forEach(dept => {
        const isHighRating = dept.avgRating >= ratingThreshold;
        const isHighConsultation = dept.totalConsultations >= consultationThreshold;
        
        if (isHighRating && isHighConsultation) {
          quadrants.highConsHighRating.push(dept);
        } else if (!isHighRating && isHighConsultation) {
          quadrants.highConsLowRating.push(dept);
        } else if (isHighRating && !isHighConsultation) {
          quadrants.lowConsHighRating.push(dept);
        } else {
          quadrants.lowConsLowRating.push(dept);
        }
      });
      
      // Format for response - using the format from your second image
      const response = {
        highConsHighRating: {
          items: quadrants.highConsHighRating.map(dept => ({
            DEPARTMENT: dept.departmentName,
            AVG_RATING: dept.avgRating.toFixed(2),
            CONSULTATIONS: dept.totalConsultations,
            DOCTOR_COUNT: dept.doctorCount
          })),
          count: quadrants.highConsHighRating.length
        },
        highConsLowRating: {
          items: quadrants.highConsLowRating.map(dept => ({
            DEPARTMENT: dept.departmentName,
            AVG_RATING: dept.avgRating.toFixed(2),
            CONSULTATIONS: dept.totalConsultations,
            DOCTOR_COUNT: dept.doctorCount
          })),
          count: quadrants.highConsLowRating.length
        },
        lowConsHighRating: {
          items: quadrants.lowConsHighRating.map(dept => ({
            DEPARTMENT: dept.departmentName,
            AVG_RATING: dept.avgRating.toFixed(2),
            CONSULTATIONS: dept.totalConsultations,
            DOCTOR_COUNT: dept.doctorCount
          })),
          count: quadrants.lowConsHighRating.length
        },
        lowConsLowRating: {
          items: quadrants.lowConsLowRating.map(dept => ({
            DEPARTMENT: dept.departmentName,
            AVG_RATING: dept.avgRating.toFixed(2),
            CONSULTATIONS: dept.totalConsultations,
            DOCTOR_COUNT: dept.doctorCount
          })),
          count: quadrants.lowConsLowRating.length
        },
        // Graph data for scatter plot
        graphData: departmentData.map(dept => ({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          avgRating: dept.avgRating,
          consultations: dept.totalConsultations,
          doctorCount: dept.doctorCount
        }))
      };
      
      return res.status(200).json(response);
      
    } catch (error) {
      return res.status(500).json({ error: "Failed to retrieve department performance data" });
    }
  };

  // Function to get and print all doctors data
export const getAllDoctorsData = async (req, res) => {
    try {
      // Find all doctors in the collection
      const doctors = await Doctor.find({});
      
      // Return the doctors data
      return res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Server error while retrieving doctors data"
      });
    }
  };



//Function for finance trends, monthly and weekly patient payment
export const getFinanceTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Common match + unwind
    const baseStages = [
      { $unwind: "$payments" },
      {
        $match: {
          "payments.payment_date": { $gte: start, $lte: end },
          "payments.status": "success"
        }
      }
    ];

    // Monthly aggregation
    const monthlyAggregation = await Bill.aggregate([
      ...baseStages,
      {
        $group: {
          _id: {
            year: { $year: "$payments.payment_date" },
            month: { $month: "$payments.payment_date" }
          },
          totalAmount: { $sum: "$payments.amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = monthlyAggregation.map(r => ({
      label: `${monthNames[r._id.month - 1]} ${r._id.year}`,
      amount: r.totalAmount
    }));

    // Weekly aggregation
    const weeklyAggregation = await Bill.aggregate([
      ...baseStages,
      {
        $group: {
          _id: {
            year: { $year: "$payments.payment_date" },
            week: { $isoWeek: "$payments.payment_date" }
          },
          totalAmount: { $sum: "$payments.amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const weekly = weeklyAggregation.map(r => ({
      label: `Week ${r._id.week} ${r._id.year}`,
      amount: r.totalAmount
    }));

    res.json({ monthly, weekly });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


//Function for doctor working trends, monthly and weekly based on patient count
export const getDoctorWorkingTrends = async (req, res) => {
  try {
    const { doctorName, startDate, endDate } = req.query;

    if (!doctorName || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const employee = await Employee.findOne({ name: doctorName.trim(), role: "doctor" });
    if (!employee) return res.status(404).json({ message: "Doctor not found in employee records" });

    const doctor = await Doctor.findOne({ employee_id: employee._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const matchStage = {
      doctor_id: doctor._id,
      actual_start_datetime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Monthly aggregation
    const monthlyAgg = await Consultation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$actual_start_datetime" },
            month: { $month: "$actual_start_datetime" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthly = monthlyAgg.map(entry => ({
      label: `${getMonthName(entry._id.month)} ${entry._id.year}`,
      count: entry.count
    }));

    // Weekly aggregation
    const weeklyAgg = await Consultation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$actual_start_datetime" },
            week: { $week: "$actual_start_datetime" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const weekly = weeklyAgg.map(entry => ({
      label: `Week ${entry._id.week} of ${entry._id.year}`,
      count: entry.count
    }));

    res.status(200).json({ monthly, weekly });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Helper: convert month number to name
function getMonthName(monthNum) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthNum - 1];
}


//Functions for illness trneds page

//Function to get top K diseases
export const getTopKDiseases = async (req, res) => {
  try {
    const { startDate, endDate, k } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const topK = parseInt(k) || 5;

    // Total consultations with diagnoses in that time
    const totalConsults = await Consultation.countDocuments({
      actual_start_datetime: { $gte: start, $lte: end },
      diagnosis: { $exists: true, $not: { $size: 0 } }
    });

    if (totalConsults === 0) {
      return res.status(200).json({ message: "No diagnosis data found", data: [] });
    }

    const result = await Consultation.aggregate([
      { $match: { actual_start_datetime: { $gte: start, $lte: end } } },
      { $unwind: "$diagnosis" },
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: topK },
      {
        $lookup: {
          from: "diagnoses", // collection name is lowercase plural
          localField: "_id",
          foreignField: "_id",
          as: "diagnosis_info"
        }
      },
      { $unwind: "$diagnosis_info" },
      {
        $project: {
          diagnosisId: "$_id",
          name: "$diagnosis_info.name",
          count: 1
        }
      }
    ]);

    // Add percentage calculation
    const trends = result.map(entry => ({
      name: entry.name,
      count: entry.count,
      percentage: ((entry.count / totalConsults) * 100).toFixed(2)
    }));

    res.status(200).json({ totalConsultations: totalConsults, topDiagnoses: trends });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Function to get diease trends, monthly and weekly
export const getDiseaseTrends = async (req, res) => {
  try {
    const { startDate, endDate, diagnosis_id } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid startDate or endDate" });
    }

    // Step 1: Resolve diagnosis_id
    let diagnosisDoc = null;

    // Check if it's a valid Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(diagnosis_id)) {
      diagnosisDoc = await Diagnosis.findById(diagnosis_id);
    }

    // Check against custom diagnosis_id code
    if (!diagnosisDoc) {
      diagnosisDoc = await Diagnosis.findOne({ diagnosis_id: diagnosis_id.trim() });
    }

    // Check against diagnosis name
    if (!diagnosisDoc) {
      diagnosisDoc = await Diagnosis.findOne({ name: diagnosis_id.trim() });
    }

    if (!diagnosisDoc) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    const resolvedDiagnosisId = diagnosisDoc._id;

    // Match consultations with this diagnosis and in the time range
    const matchStage = {
      actual_start_datetime: { $gte: start, $lte: end },
      diagnosis: resolvedDiagnosisId
    };

    // Total cases
    const totalCases = await Consultation.countDocuments(matchStage);

    if (totalCases === 0) {
      return res.status(200).json({
        message: "No cases found in the given time frame",
        monthly: [],
        weekly: [],
        ageDistribution: {},
        total: 0
      });
    }

    // Monthly trend
    const monthly = await Consultation.aggregate([
      { $match: matchStage },
      { $unwind: "$diagnosis" },
      { $match: { diagnosis: resolvedDiagnosisId } },
      {
        $group: {
          _id: {
            year: { $year: "$actual_start_datetime" },
            month: { $month: "$actual_start_datetime" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = monthly.map(m => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count
    }));

    // Weekly trend
    const weekly = await Consultation.aggregate([
      { $match: matchStage },
      { $unwind: "$diagnosis" },
      { $match: { diagnosis: resolvedDiagnosisId } },
      {
        $group: {
          _id: {
            year: { $year: "$actual_start_datetime" },
            week: { $isoWeek: "$actual_start_datetime" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const weeklyData = weekly.map(w => ({
      label: `Week ${w._id.week} ${w._id.year}`,
      count: w.count
    }));

    // Age distribution
    const ageAgg = await Consultation.aggregate([
      { $match: matchStage },
      { $unwind: "$diagnosis" },
      { $match: { diagnosis: resolvedDiagnosisId } },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient"
        }
      },
      { $unwind: "$patient" },
      {
        $project: {
          age: "$patient.patient_info.age"
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$age", 18] }, then: "0-18" },
                { case: { $and: [{ $gt: ["$age", 18] }, { $lte: ["$age", 35] }] }, then: "19-35" },
                { case: { $and: [{ $gt: ["$age", 35] }, { $lte: ["$age", 50] }] }, then: "36-50" },
                { case: { $and: [{ $gt: ["$age", 50] }, { $lte: ["$age", 65] }] }, then: "51-65" },
                { case: { $gt: ["$age", 65] }, then: "65+" }
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const ageDistribution = {};
    ageAgg.forEach(bucket => {
      const label = typeof bucket._id === "string" ? bucket._id : `${bucket._id}–${bucket._id + 17}`;
      ageDistribution[label] = bucket.count;
    });

    // Final response
    res.status(200).json({
      total: totalCases,
      monthly: monthlyData,
      weekly: weeklyData,
      ageDistribution
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





/*
FOR TESTING
export const getAllEmployees = async (req, res) => {
  try {
    const result = await Employee.find({ role: "doctor" });

    if (!result || result.length === 0) {
      return res.status(200).json({
        message: 'No doctors found',
        doctors: []
      });
    }

    res.status(200).json({
      totalDoctors: result.length,
      doctors: result
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      message: 'Error retrieving doctors',
      error: error.message
    });
  }
};

export const addNewDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      profile_pic, 
      dept_id, 
      phone_number, 
      emergency_contact, 
      bloodGrp, 
      address, 
      date_of_birth, 
      aadhar_number, 
      date_of_joining, 
      gender, 
      salary, 
      bank_details 
    } = req.body;

    // Create a new Employee with role "doctor"
    const newDoctor = new Employee({
      name,
      email,
      password,
      profile_pic,
      role: "doctor",  // Ensures the role is set to doctor
      dept_id,
      phone_number,
      emergency_contact,
      bloodGrp,
      address,
      date_of_birth,
      aadhar_number,
      date_of_joining,
      gender,
      salary,
      bank_details
    });

    // Save the new doctor record
    const savedDoctor = await newDoctor.save();

    res.status(201).json({
      message: 'Doctor added successfully',
      doctor: savedDoctor
    });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({
      message: 'Error adding doctor',
      error: error.message
    });
  }
};

export const addConsultation = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      booked_date_time,
      status,
      reason,
      appointment_type,
      actual_start_datetime,
      diagnosis,
      prescription,
      reports,
      feedback
    } = req.body;

    // Validate and convert dates
    const bookedDate = booked_date_time ? new Date(booked_date_time) : new Date();
    const actualStart = new Date(actual_start_datetime);

    if (isNaN(actualStart.getTime())) {
      return res.status(400).json({ message: "Invalid actual_start_datetime" });
    }

    const consultation = new Consultation({
      patient_id,
      doctor_id,
      booked_date_time: bookedDate,
      actual_start_datetime: actualStart,
      status,
      reason,
      appointment_type,
      diagnosis,
      prescription: prescription || [],
      reports: reports || [],
      feedback
    });

    const saved = await consultation.save();
    res.status(201).json({ message: "Consultation saved successfully", consultation: saved });

  } catch (error) {
    console.error("Error saving consultation:", error);
    res.status(500).json({ message: "Error saving consultation", error: error.message });
  }
};

*/


export const getAllDiagnoses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find(); // Fetch all entries

    if (!diagnoses || diagnoses.length === 0) {
      return res.status(200).json({
        message: 'No diagnoses found',
        diagnoses: []
      });
    }

    res.status(200).json({
      totalDiagnoses: diagnoses.length,
      diagnoses
    });
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    res.status(500).json({
      message: 'Error retrieving diagnoses',
      error: error.message
    });
  }
};


/*
export const printAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('employee_id'); // populate linked Employee info

    if (!doctors.length) {
      return res.status(200).json({ message: 'No doctors found', doctors: [] });
    }
    

    res.status(200).json({
      message: 'Doctors retrieved successfully',
      total: doctors.length,
      doctors
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};*/

//function to get the metrics for dashboard
export const getDashboardKPIs = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    
    // Calculate first day of current month
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Calculate first day of previous month
    const firstDayLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    // Calculate last day of previous month (one day before first day of current month)
    const lastDayLastMonth = new Date(firstDayCurrentMonth);
    lastDayLastMonth.setDate(lastDayLastMonth.getDate() - 1);
    lastDayLastMonth.setHours(23, 59, 59, 999);
    
    // 1. Get Total Patients count for current month (to date)
    const currentMonthPatients = await Consultation.countDocuments({
      booked_date_time: { $gte: firstDayCurrentMonth, $lte: currentDate }
    });
    
    // Get Total Patients count for last month
    const lastMonthPatients = await Consultation.countDocuments({
      booked_date_time: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
    });
    
    // Calculate patient growth percentage comparing current month to last month
    const patientGrowth = lastMonthPatients > 0 
      ? ((currentMonthPatients - lastMonthPatients) / lastMonthPatients) * 100 
      : 0;
    
    // Check if the current month is ongoing
    const isCurrentMonthOngoing = currentDate.getMonth() === new Date().getMonth() && 
                               currentDate.getFullYear() === new Date().getFullYear();
    
    // 2. Get Revenue data
    // Get revenue for current month till date
    const currentMonthRevenue = await Bill.aggregate([
      { $match: { generation_date: { $gte: firstDayCurrentMonth, $lte: currentDate } } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    
    // Get last month's revenue for comparison
    const lastMonthRevenue = await Bill.aggregate([
      { $match: { generation_date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    
    const revenueAmount = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
    const revenuePeriod = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()} (till date)`;
    
    const lastMonthRevenueValue = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
    
    // Calculate revenue growth percentage (comparing current month with previous month)
    const revenueGrowth = lastMonthRevenueValue > 0 
      ? ((revenueAmount - lastMonthRevenueValue) / lastMonthRevenueValue) * 100 
      : 0;
    
    // 3. Get satisfaction rating with fallback logic
    // Get feedbacks for the current month
    let currentPeriodFeedbacks = await Feedback.find({ 
      created_at: { $gte: firstDayCurrentMonth, $lte: currentDate },
      rating: { $exists: true, $ne: null }
    });
    
    let currentPeriodLabel = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()} (till date)`;
    
    // If no feedbacks in current month, fall back to previous month
    if (!currentPeriodFeedbacks || currentPeriodFeedbacks.length === 0) {
      currentPeriodFeedbacks = await Feedback.find({ 
        created_at: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
        rating: { $exists: true, $ne: null }
      });
      currentPeriodLabel = `${firstDayLastMonth.toLocaleString('default', { month: 'long' })} ${firstDayLastMonth.getFullYear()}`;
    }
    
    // Get previous period feedbacks for comparison (last month)
    const previousPeriodFeedbacks = await Feedback.find({ 
      created_at: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
      rating: { $exists: true, $ne: null }
    });

    // Calculate current period rating
    let currentRating = 0;
    if (currentPeriodFeedbacks && currentPeriodFeedbacks.length > 0) {
      const totalRating = currentPeriodFeedbacks.reduce((sum, feedback) => {
        // Ensure rating is treated as a number
        return sum + Number(feedback.rating);
      }, 0);
      currentRating = totalRating / currentPeriodFeedbacks.length;
    }

    // Calculate previous period rating
    let previousRating = 0;
    if (previousPeriodFeedbacks && previousPeriodFeedbacks.length > 0) {
      const totalRating = previousPeriodFeedbacks.reduce((sum, feedback) => {
        return sum + Number(feedback.rating);
      }, 0);
      previousRating = totalRating / previousPeriodFeedbacks.length;
    }

    // Calculate rating change (as a percentage)
    const ratingChange = previousRating > 0 
      ? ((currentRating - previousRating) / previousRating) * 100 
      : 0;
    
    // Return dashboard KPIs
    return res.status(200).json({
      totalPatients: {
        value: currentMonthPatients,
        change: patientGrowth.toFixed(1),
        trend: patientGrowth >= 0 ? 'up' : 'down'
      },
      revenue: {
        value: (revenueAmount / 100000).toFixed(1) + 'L', // Format as lakhs
        period: revenuePeriod,
        change: revenueGrowth.toFixed(1),
        trend: revenueGrowth >= 0 ? 'up' : 'down'
      },
      satisfaction: {
        value: currentRating.toFixed(1) + '/5.0',
        period: currentPeriodLabel,
        change: ratingChange.toFixed(1),
        trend: ratingChange >= 0 ? 'up' : 'down'
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard KPIs', error: error.message });
  }
};

