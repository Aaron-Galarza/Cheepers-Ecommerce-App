import express from 'express';
import { getSchedule, updateSchedule, updateDaySchedule  } from '../controllers/scheduleController';
import { protect, admin, owner } from '../middleware/authMiddleware'; // Aseg\u00FArate que estas rutas est\u00E1n correctas


const router = express.Router();

router.route('/')
    .get(getSchedule) 
    .put(protect, admin, updateSchedule);

router.route('/day')
    .patch(protect, admin, updateDaySchedule);

export default router;