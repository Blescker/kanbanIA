import express from 'express';
import { guardarMensaje, obtenerMensajesPorProyecto } from '../controllers/message.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, guardarMensaje);
router.get('/:proyectoId', protect, obtenerMensajesPorProyecto);

export default router;
