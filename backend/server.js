import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import listRoutes from './routes/list.routes.js';
import cardRoutes from './routes/card.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';
import planificacionRoutes from './routes/planificacion.routes.js';

import { syncDB, Message, ProjectMember, User } from './models/index.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', listRoutes);
app.use('/api', cardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api', planificacionRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ msg: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173' } });

const usuariosPorProyecto = {};

io.on('connection', (socket) => {
  console.log('📡 Cliente conectado:', socket.id);

  socket.on('joinRoom', ({ proyectoId, userId }) => {
    socket.join(proyectoId);
    socket.userId = userId;
    socket.proyectoId = proyectoId;

    if (!usuariosPorProyecto[proyectoId]) usuariosPorProyecto[proyectoId] = new Set();
    usuariosPorProyecto[proyectoId].add(String(userId));

    io.to(proyectoId).emit('usuarios:conectados', Array.from(usuariosPorProyecto[proyectoId]));
    console.log(`🛋️ Usuario ${userId} unido a sala del proyecto ${proyectoId}`);
  });

  socket.on('chat:mensaje', async ({ proyectoId, contenido, usuarioId }) => {
    try {
      const miembro = await ProjectMember.findOne({ where: { projectId: proyectoId, userId: usuarioId } });
      if (!miembro) return;

      const guardado = await Message.create({ contenido, proyectoId, usuarioId });
      const usuario = await User.findByPk(usuarioId);

      io.to(proyectoId).emit('chat:nuevoMensaje', {
        _id: guardado.id,
        id: guardado.id,
        contenido: guardado.contenido,
        createdAt: guardado.createdAt,
        usuario: {
          _id: usuario.id,
          id: usuario.id,
          nombre: usuario.nombre,
          avatar: usuario.avatar || '',
        },
      });
    } catch (error) {
      console.error('❌ Error al guardar mensaje por socket:', error);
    }
  });

  socket.on('typing', ({ proyectoId, userId }) => {
    if (proyectoId) socket.to(proyectoId).emit('usuario:escribiendo', { userId });
  });

  socket.on('stopTyping', ({ proyectoId, userId }) => {
    if (proyectoId) socket.to(proyectoId).emit('usuario:dejoDeEscribir', { userId });
  });

  socket.on('disconnect', () => {
    const { proyectoId, userId } = socket;
    if (proyectoId && userId && usuariosPorProyecto[proyectoId]) {
      usuariosPorProyecto[proyectoId].delete(String(userId));
      io.to(proyectoId).emit('usuarios:conectados', Array.from(usuariosPorProyecto[proyectoId]));
    }
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

syncDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar con MySQL:', err);
    process.exit(1);
  });
