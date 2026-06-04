import express from 'express';
import { actualizarAvatar,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword, } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  aceptarInvitacion,
  rechazarInvitacion,
  buscarUsuarioPorCorreo,
  obtenerInvitacionesPendientes
} from '../controllers/user.controller.js'
const router = express.Router();

router.get('/me', protect, obtenerPerfil);
router.patch('/avatar', protect, actualizarAvatar);
router.patch('/profile', protect, actualizarPerfil);
router.patch('/password', protect, cambiarPassword);
router.get('/buscar', buscarUsuarioPorCorreo);
router.get('/invitaciones', protect, obtenerInvitacionesPendientes);
router.post('/invitaciones/:id/aceptar', protect, aceptarInvitacion);
router.post('/invitaciones/:id/rechazar', protect, rechazarInvitacion);

export default router;
