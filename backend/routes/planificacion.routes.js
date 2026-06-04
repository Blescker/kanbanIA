// routes/planificacion.routes.js
import express from 'express';
import { generarPlan } from '../controllers/planificacion.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/planificar', protect, generarPlan);

export default router;
