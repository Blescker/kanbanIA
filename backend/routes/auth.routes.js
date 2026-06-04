import express from 'express';
import {loginUser, registerUser } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/', (req, res) => {
    res.send('Auth route OK');
  });
// Ruta prueba
router.get('/protegido', protect, (req, res) => {
    res.json({ msg: `Hola ${req.user.nombre}, estás autenticado` });
  });

export default router;