import express from 'express';
import { crearProyecto, 
    obtenerProyectos,
    obtenerProyectoPorId,
    editarProyecto,
    eliminarProyecto,
    agregarMiembro,
    obtenerMiembros,
    eliminarMiembro, invitarMiembro  } from '../controllers/project.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, crearProyecto);
router.get('/', protect, obtenerProyectos);
router.get('/:id', protect, obtenerProyectoPorId);
router.put('/:id', protect, editarProyecto);
router.delete('/:id', protect, eliminarProyecto);
router.post('/:id/members', protect, agregarMiembro);
router.get('/:id/members', protect, obtenerMiembros);
router.delete('/:id/members/:userId', protect, eliminarMiembro);
router.post('/:id/invitaciones', protect, invitarMiembro);
export default router;
