import express from 'express';
import {
  crearTarjeta,
  obtenerTarjeta,
  asignarMiembros,
  agregarChecklistItem,
  actualizarChecklistItem,
  eliminarChecklistItem,
  agregarAdjunto,
  eliminarAdjunto,
  agregarEtiqueta,
  eliminarEtiqueta,
  reordenarTarjetas,
  obtenerTarjetasPorLista,
  moverCard,
  actualizarEstadoCompletada,
  obtenerChecklist,
  obtenerEtiquetasCard,
  actualizarTarjeta,
  eliminarCard,
} from '../controllers/card.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/listas/:id/tarjetas', protect, crearTarjeta);
router.get('/cards/:id', protect, obtenerTarjeta);
router.put('/cards/:id', protect, actualizarTarjeta);
router.put('/cards/:id/assign', protect, asignarMiembros);
router.patch('/cards/:id/checklist', protect, agregarChecklistItem);
router.patch('/cards/:cardId/checklist/:itemId', protect, actualizarChecklistItem);
router.delete('/cards/:cardId/checklist/:itemId', protect, eliminarChecklistItem);
router.patch('/cards/:id/adjuntos', protect, agregarAdjunto);
router.delete('/cards/:id/adjuntos/:itemId', protect, eliminarAdjunto);
router.patch('/cards/:id/etiquetas', protect, agregarEtiqueta);
router.delete('/cards/:id/etiquetas/:itemId', protect, eliminarEtiqueta);
router.patch('/listas/:id/tarjetas/reordenar', protect, reordenarTarjetas);
router.get('/listas/:id/tarjetas', protect, obtenerTarjetasPorLista);
router.patch('/tarjetas/:id/mover', protect, moverCard);
router.patch('/tarjetas/:id/completada', protect, actualizarEstadoCompletada);
router.get('/cards/:id/checklist', protect, obtenerChecklist);
router.get('/cards/:id/etiquetas', protect, obtenerEtiquetasCard);
router.patch('/tarjetas/:id', protect, actualizarTarjeta);
router.delete('/cards/:id', protect, eliminarCard);

export default router;
