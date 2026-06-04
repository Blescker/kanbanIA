import { User, Invitacion, Project, ProjectMember } from '../models/index.js';
import bcrypt from 'bcryptjs';

export const actualizarAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ msg: 'El avatar es requerido' });

    const usuario = await User.findByPk(req.user.id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    usuario.avatar = avatar;
    await usuario.save();

    res.status(200).json({
      msg: 'Avatar actualizado correctamente',
      usuario: { _id: usuario.id, id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, avatar: usuario.avatar },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar el avatar' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json({
      _id: usuario.id, id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      avatar: usuario.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener perfil' });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido } = req.body;

    const usuario = await User.findByPk(req.user.id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    usuario.nombre = nombre || usuario.nombre;
    usuario.apellido = apellido || usuario.apellido;
    await usuario.save();

    res.json({
      msg: 'Perfil actualizado correctamente',
      usuario: { _id: usuario.id, id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, correo: usuario.correo, avatar: usuario.avatar },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar perfil' });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    if (!passwordActual || !nuevaPassword) {
      return res.status(400).json({ msg: 'Ambas contraseñas son obligatorias' });
    }

    const usuario = await User.findByPk(req.user.id);
    const passwordValido = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordValido) return res.status(401).json({ msg: 'Contraseña actual incorrecta' });

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al cambiar contraseña' });
  }
};

export const buscarUsuarioPorCorreo = async (req, res) => {
  const { correo } = req.query;
  if (!correo) return res.status(400).json({ msg: 'El correo es requerido' });

  try {
    const usuario = await User.findOne({
      where: { correo: correo.toLowerCase().trim() },
      attributes: { exclude: ['password'] },
    });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json({ _id: usuario.id, id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, correo: usuario.correo, avatar: usuario.avatar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

export const obtenerInvitacionesPendientes = async (req, res) => {
  try {
    const invitaciones = await Invitacion.findAll({
      where: { usuarioInvitadoId: req.user.id, estado: 'pendiente' },
      include: [
        { model: Project, as: 'proyecto', attributes: ['id', 'nombre', 'descripcion'] },
        { model: User, as: 'usuarioInvitador', attributes: ['id', 'nombre', 'correo', 'avatar'] },
      ],
    });
    res.json(invitaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener invitaciones' });
  }
};

export const aceptarInvitacion = async (req, res) => {
  try {
    const { id } = req.params;

    const invitacion = await Invitacion.findByPk(id);
    if (!invitacion) return res.status(404).json({ msg: 'Invitación no encontrada' });

    const yaEsMiembro = await ProjectMember.findOne({ where: { projectId: invitacion.proyectoId, userId: req.user.id } });
    if (yaEsMiembro) return res.status(400).json({ msg: 'Ya eres miembro' });

    await ProjectMember.create({ projectId: invitacion.proyectoId, userId: req.user.id, rol: 'colaborador' });

    invitacion.estado = 'aceptada';
    await invitacion.save();

    res.status(200).json({ msg: 'Ahora eres miembro del proyecto' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al aceptar invitación' });
  }
};

export const rechazarInvitacion = async (req, res) => {
  const invitacionId = req.params.id;

  try {
    const invitacion = await Invitacion.findByPk(invitacionId);
    if (!invitacion) return res.status(404).json({ msg: 'Invitación no encontrada' });
    if (invitacion.estado !== 'pendiente') return res.status(400).json({ msg: 'Invitación ya procesada' });
    if (invitacion.usuarioInvitadoId !== req.user.id) {
      return res.status(403).json({ msg: 'No autorizado para rechazar esta invitación' });
    }

    invitacion.estado = 'rechazada';
    await invitacion.save();

    res.json({ msg: 'Invitación rechazada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al rechazar invitación' });
  }
};
