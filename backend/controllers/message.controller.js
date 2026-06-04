import { Message, Project, ProjectMember, User } from '../models/index.js';

export const guardarMensaje = async (req, res) => {
  try {
    const { contenido, proyectoId } = req.body;
    if (!contenido || !proyectoId) {
      return res.status(400).json({ msg: 'Contenido y proyectoId son obligatorios' });
    }

    const proyecto = await Project.findByPk(proyectoId);
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const miembro = await ProjectMember.findOne({ where: { projectId: proyectoId, userId: req.user.id } });
    if (!miembro) return res.status(403).json({ msg: 'No tienes acceso a este chat' });

    const mensaje = await Message.create({ contenido, proyectoId, usuarioId: req.user.id });
    const guardado = await Message.findByPk(mensaje.id, {
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'avatar'] }],
    });

    res.status(201).json(guardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al guardar mensaje' });
  }
};

export const obtenerMensajesPorProyecto = async (req, res) => {
  try {
    const { proyectoId } = req.params;

    const proyecto = await Project.findByPk(proyectoId);
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const miembro = await ProjectMember.findOne({ where: { projectId: proyectoId, userId: req.user.id } });
    if (!miembro) return res.status(403).json({ msg: 'No tienes acceso a este chat' });

    const mensajes = await Message.findAll({
      where: { proyectoId },
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'avatar'] }],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener mensajes' });
  }
};
