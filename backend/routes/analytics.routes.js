import express from 'express';
import { addRatingAndReview,calculateOverallRating, calculateDepartmentRating,getAllFeedbacks,
    getMedicineInventoryTrends,getMedicinePrescriptionTrends,addMedicine,addInventoryLog,createPrescription,createBill,addItemToBill,
    addPrescriptionEntry,getBedOccupancyTrends, getFacilityStatistics,getDoctorRatingDistribution,
    getAllConsultations ,getFeedbacksByRating ,getDoctorQuadrantData, getDepartmentQuadrantData,
    getAllDoctorsData, getDoctorWorkingTrends, /*getAllEmployees, addNewDoctor, addConsultation, printAllDoctors,*/
    getFinanceTrends, getTopKDiseases, getDiseaseTrends, getDashboardKPIs, getRatingDistribution, getMedicines, getAllDiagnoses} from '../controllers/analytics.controller.js';


    
const router = express.Router();

// Route to add rating and review
router.post('/feedback/add/:consultationId', addRatingAndReview);
// Route to get department-wise rating
router.get('/feedback/department-rating/:departmentId', calculateDepartmentRating);
// Route to get all feedbacks
router.get('/feedback/all', getAllConsultations);
// Route to get overall rating
router.get('/feedback/overall',calculateOverallRating);
router.get('/feedback/doctor',getDoctorRatingDistribution);
router.get('/feedbacks/rating/:rating',getFeedbacksByRating);

router.post('/medicine-add', addMedicine);
router.post('/medicineinventory-add', addInventoryLog);
router.post('/prescription-add', createPrescription);
router.post('/prescription/additem', addPrescriptionEntry);
router.post('/bill/create', createBill);
router.post('/bill/additem/:billId',addItemToBill);
// Route to get medicine trends
router.post('/medicine-trends',getMedicineInventoryTrends);
// Route to get medicine prescription trends
router.post('/medicine-prescription-trends',getMedicinePrescriptionTrends);
router.get('/medicines', getMedicines);

// Route to get occupied bed trends
router.post('/occupied-beds/:period', getBedOccupancyTrends);
// Route to get facility statistics
router.get('/facility-stats', getFacilityStatistics);

router.post('/doc-performance', getDoctorQuadrantData);
router.post('/dept-performance',getDepartmentQuadrantData);
router.get('/doctors/all',getAllDoctorsData);

//
//doctor-working trends
router.get('/doctor-working', getDoctorWorkingTrends);
//financial-trends
router.post('/finance-trends', getFinanceTrends);
//illness-trends
router.post('/illness-trends/topk', getTopKDiseases);
router.post('/illness-trends/disease-trends', getDiseaseTrends);

router.get('/dashboard/kpis', getDashboardKPIs);

// Doctor Rating Distribution for Feedback Rating Metrics
router.get('/feedback-rating-metrics', getRatingDistribution);

/*
//FOR TESTING
router.get('/employees-all', getAllEmployees);
router.post('/add-doctor', addNewDoctor);
router.post('/add-consultation', addConsultation);

router.get('/print-all-doctors', printAllDoctors);
*/
router.get('/diagnosis-all', getAllDiagnoses);

export default router;