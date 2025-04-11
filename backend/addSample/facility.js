import express from 'express';
import { Ambulance, Room, Bed, DailyOccupancy } from '../models/facility.js';
import { faker } from '@faker-js/faker';
import { Nurse } from '../models/staff.js';
import Patient from '../models/patient.js';

const router = express.Router();

// ----- AMBULANCE ROUTES -----

// GET all ambulances
router.get('/ambulances', async (req, res) => {
  try {
    const ambulances = await Ambulance.find({}).populate('driver');
    res.status(200).json(ambulances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ambulance by ID
router.get('/ambulances/:id', async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id).populate('driver');
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance not found' });
    }
    res.status(200).json(ambulance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add a new ambulance
router.post('/ambulances', async (req, res) => {
  try {
    const ambulance = new Ambulance(req.body);
    const savedAmbulance = await ambulance.save();
    res.status(201).json(savedAmbulance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update an ambulance
router.put('/ambulances/:id', async (req, res) => {
  try {
    const updatedAmbulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAmbulance) {
      return res.status(404).json({ message: 'Ambulance not found' });
    }
    res.status(200).json(updatedAmbulance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an ambulance
router.delete('/ambulances/:id', async (req, res) => {
  try {
    const deletedAmbulance = await Ambulance.findByIdAndDelete(req.params.id);
    if (!deletedAmbulance) {
      return res.status(404).json({ message: 'Ambulance not found' });
    }
    res.status(200).json({ message: 'Ambulance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate a random ambulance
function generateAmbulance() {
  return {
    vehicle_number: `AMB-${faker.string.alphanumeric(5).toUpperCase()}`,
    status: faker.helpers.arrayElement(['active', 'inactive']),
    nurse_id: faker.number.int({ min: 1000, max: 9999 })
    // Note: driver reference would need to be added after driver creation
  };
}

// POST generate dummy ambulances
router.post('/ambulances/generate/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const ambulances = [];
    
    for (let i = 0; i < count; i++) {
      const ambulanceData = generateAmbulance();
      const ambulance = new Ambulance(ambulanceData);
      const savedAmbulance = await ambulance.save();
      ambulances.push(savedAmbulance);
    }

    res.status(201).json({
      message: `Successfully generated ${ambulances.length} ambulances`,
      count: ambulances.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ----- ROOM ROUTES -----

// GET all rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET room by ID
router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add a new room
router.post('/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a room
router.put('/rooms/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a room
router.delete('/rooms/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate a random room with beds
function generateRoom() {
  const roomType = faker.helpers.arrayElement(['general', 'private', 'semi_private']);
  
  // Determine bed count based on room type
  let bedCount;
  switch (roomType) {
    case 'private':
      bedCount = 1;
      break;
    case 'semi_private':
      bedCount = 2;
      break;
    case 'general':
      bedCount = faker.number.int({ min: 4, max: 8 });
      break;
  }
  
  // Generate beds for the room
  const beds = [];
  for (let i = 1; i <= bedCount; i++) {
    beds.push({
      bed_number: i,
      nurse_id: faker.number.int({ min: 1000, max: 9999 }),
      status: faker.helpers.arrayElement(['occupied', 'vacant'])
    });
  }
  
  return {
    room_number: faker.number.int({ min: 100, max: 999 }),
    room_type: roomType,
    bed_count: bedCount,
    dept_id: `DEPT-${faker.string.alphanumeric(3).toUpperCase()}`,
    beds: beds
  };
}

// POST generate dummy rooms with beds
router.post('/rooms/generate/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const rooms = [];
    
    for (let i = 0; i < count; i++) {
      const roomData = generateRoom();
      const room = new Room(roomData);
      const savedRoom = await room.save();
      rooms.push(savedRoom);
    }

    res.status(201).json({
      message: `Successfully generated ${rooms.length} rooms with beds`,
      count: rooms.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ----- BED ROUTES -----

// GET all beds
router.get('/beds', async (req, res) => {
  try {
    const beds = await Bed.find({});
    res.status(200).json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET bed by ID
router.get('/beds/:id', async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    res.status(200).json(bed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add a new bed
router.post('/beds', async (req, res) => {
  try {
    const bed = new Bed(req.body);
    const savedBed = await bed.save();
    res.status(201).json(savedBed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//POST generate a bed
router.post('/beds/generate/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const beds = [];

    var nurses = await Nurse.find({});
    var patients = await Patient.find({});

    for (let i = 0; i < count; i++) {
      const status = faker.helpers.arrayElement(['occupied', 'vacant']);
      const nurse = nurses.length > 0 ? faker.helpers.arrayElement(nurses) : null;
      const patient = status === 'occupied' && patients.length > 0 ? faker.helpers.arrayElement(patients) : null;

      const bed = new Bed({
      bed_number: faker.number.int({ min: 1, max: 1000 }),
      nurse_id: nurse ? nurse._id : null,
      status: status,
      patient_id: patient ? patient._id : null
      });

      const savedBed = await bed.save();
      beds.push(savedBed);
    }

    res.status(201).json({
      message: `Successfully generated ${beds.length} beds`,
      count: beds.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a bed
router.put('/beds/:id', async (req, res) => {
  try {
    const updatedBed = await Bed.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    res.status(200).json(updatedBed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a bed
router.delete('/beds/:id', async (req, res) => {
  try {
    const deletedBed = await Bed.findByIdAndDelete(req.params.id);
    if (!deletedBed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    res.status(200).json({ message: 'Bed deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST update bed status
router.post('/beds/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['occupied', 'vacant'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    
    bed.status = status;
    if (status === 'vacant') {
      bed.patient_id = null;
    }
    
    const updatedBed = await bed.save();
    res.status(200).json(updatedBed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ----- DAILY OCCUPANCY ROUTES -----

// GET all daily occupancy records
router.get('/occupancy', async (req, res) => {
  try {
    const occupancyRecords = await DailyOccupancy.find({}).populate('occupiedBeds');
    res.status(200).json(occupancyRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET occupancy by date
router.get('/occupancy/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Set time to 00:00:00 for date comparison
    date.setHours(0, 0, 0, 0);
    
    const occupancy = await DailyOccupancy.findOne({
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('occupiedBeds');
    
    if (!occupancy) {
      return res.status(404).json({ message: 'No occupancy record found for this date' });
    }
    
    res.status(200).json(occupancy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create or update daily occupancy
router.post('/occupancy', async (req, res) => {
  try {
    const { date, occupiedBeds } = req.body;
    
    if (!date || !occupiedBeds) {
      return res.status(400).json({ message: 'Date and occupiedBeds are required' });
    }
    
    // Convert string date to Date object
    const occupancyDate = new Date(date);
    occupancyDate.setHours(0, 0, 0, 0);
    
    // Try to find existing record for the date
    let occupancy = await DailyOccupancy.findOne({
      date: {
        $gte: occupancyDate,
        $lt: new Date(occupancyDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (occupancy) {
      // Update existing record
      occupancy.occupiedBeds = occupiedBeds;
      await occupancy.save();
    } else {
      // Create new record
      occupancy = new DailyOccupancy({
        date: occupancyDate,
        occupiedBeds: occupiedBeds
      });
      await occupancy.save();
    }
    
    res.status(201).json(occupancy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST generate today's occupancy based on current bed status
router.post('/occupancy/generate', async (req, res) => {
  try {
    // Get all beds with status 'occupied'
    const occupiedBeds = await Bed.find({ status: 'occupied' });
    
    if (!occupiedBeds.length) {
      return res.status(404).json({ message: 'No occupied beds found' });
    }
    
    // Create today's date with time set to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's already a record for today
    let occupancy = await DailyOccupancy.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (occupancy) {
      // Update existing record
      occupancy.occupiedBeds = occupiedBeds.map(bed => bed._id);
      await occupancy.save();
    } else {
      // Create new record
      occupancy = new DailyOccupancy({
        date: today,
        occupiedBeds: occupiedBeds.map(bed => bed._id)
      });
      await occupancy.save();
    }
    
    res.status(201).json({
      message: `Successfully generated occupancy record for ${today.toISOString().split('T')[0]}`,
      occupiedBedsCount: occupiedBeds.length,
      occupancy: occupancy
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET occupancy statistics for a date range
router.get('/occupancy/stats/:startDate/:endDate', async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Set time to 00:00:00 for startDate and 23:59:59 for endDate
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const occupancyRecords = await DailyOccupancy.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('occupiedBeds');
    
    // Calculate average occupancy for the period
    const totalBeds = await Bed.countDocuments();
    let totalOccupiedBedDays = 0;
    
    occupancyRecords.forEach(record => {
      totalOccupiedBedDays += record.occupiedBeds.length;
    });
    
    const daysInPeriod = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    const averageOccupancy = totalOccupiedBedDays / daysInPeriod;
    const occupancyRate = (averageOccupancy / totalBeds * 100).toFixed(2);
    
    res.status(200).json({
      startDate: startDate,
      endDate: endDate,
      daysInPeriod: daysInPeriod,
      totalBeds: totalBeds,
      averageOccupiedBeds: averageOccupancy.toFixed(2),
      occupancyRate: `${occupancyRate}%`,
      dailyOccupancy: occupancyRecords.map(record => ({
        date: record.date,
        occupiedBeds: record.occupiedBeds.length,
        occupancyRate: ((record.occupiedBeds.length / totalBeds) * 100).toFixed(2) + '%'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;