import express from 'express';
import { addRatingAndReview,calculateOverallRating, calculateDepartmentRating,getAllFeedbacks,analyzeFeedback,getBedOccupancyTrends, getFacilityStatistics } from '../controllers/analytics.controller.js';

const router = express.Router();

// Route to add rating and review
router.post('/feedback/add/:consultationId', addRatingAndReview);

// Route to get department-wise rating
router.get('/feedback/department-rating/:departmentId', calculateDepartmentRating);

// Route to get all feedbacks
router.get('/feedback/all', getAllFeedbacks);

// Route to get overall rating
router.get('/feedback/overall',calculateOverallRating);


router.get('/feedback/analysis', async (req, res) => {
    const data = await analyzeFeedback();
    res.json(data);
});
// router.get('/feedback/dept/:departmentId', async (req, res) => {
//     const { departmentId } = req.params;

//     try {
//         const rating = await calculateDepartmentRating(departmentId);
//         res.json(rating);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error calculating department rating', error });
//     }
// });


// Route to get occupied bed trends
router.get('/occupied-beds/:period', getBedOccupancyTrends);

// Route to get facility statistics
router.get('/facility-stats', getFacilityStatistics);

export default router;