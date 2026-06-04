import express from 'express';
import { crearLista,
    obtenerListasPorProyecto, 
    editarLista, 
    eliminarLista  } from '../controllers/list.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/projects/:id/listas', protect, crearLista); // POST /api/projects/:id/listas
router.get('/projects/:id/listas', protect, obtenerListasPorProyecto);
router.put('/listas/:id', protect, editarLista);
router.delete('/listas/:id', protect, eliminarLista);
export default router;
