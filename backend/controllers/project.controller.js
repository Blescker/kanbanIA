import { Project, ProjectMember, User, Invitacion } from '../models/index.js';

const incluirMiembros = [
  {
    model: ProjectMember,
    as: 'miembros',
    include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'correo', 'avatar'] }],
  },
];

export const crearProyecto = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ msg: 'El nombre del proyecto es obligatorio' });

    const proyecto = await Project.create({ nombre, descripcion, creadorId: req.user.id });
    await ProjectMember.create({ projectId: proyecto.id, userId: req.user.id, rol: 'propietario' });

    const proyectoCompleto = await Project.findByPk(proyecto.id, { include: incluirMiembros });
    res.status(201).json({ msg: 'Proyecto creado correctamente', proyecto: proyectoCompleto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear el proyecto' });
  }
};

export const obtenerProyectos = async (req, res) => {
  try {
    const membresias = await ProjectMember.findAll({ where: { userId: req.user.id } });
    const projectIds = membresias.map((m) => m.projectId);

    const proyectos = await Project.findAll({
      where: { id: projectIds },
      include: incluirMiembros,
    });

    res.status(200).json(proyectos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener proyectos' });
  }
};

export const obtenerProyectoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Project.findByPk(id, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const esMiembro = proyecto.miembros.some((m) => m.userId === req.user.id);
    if (!esMiembro) return res.status(403).json({ msg: 'Acceso denegado a este proyecto' });

    res.status(200).json(proyecto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener el proyecto' });
  }
};

export const editarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Project.findByPk(id, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const propietario = proyecto.miembros.find(
      (m) => m.userId === req.user.id && m.rol === 'propietario'
    );
    if (!propietario) return res.status(403).json({ msg: 'Solo el propietario puede editar el proyecto' });

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    await proyecto.save();

    res.status(200).json({ msg: 'Proyecto actualizado correctamente', proyecto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al editar el proyecto' });
  }
};

export const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Project.findByPk(id, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const propietario = proyecto.miembros.find(
      (m) => m.userId === req.user.id && m.rol === 'propietario'
    );
    if (!propietario) return res.status(403).json({ msg: 'Solo el propietario puede eliminar el proyecto' });

    await proyecto.destroy();
    res.status(200).json({ msg: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar el proyecto' });
  }
};

export const agregarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo, rol } = req.body;

    const proyecto = await Project.findByPk(id, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const propietario = proyecto.miembros.find(
      (m) => m.userId === req.user.id && m.rol === 'propietario'
    );
    if (!propietario) return res.status(403).json({ msg: 'Solo el propietario puede agregar miembros' });

    const usuarioInvitado = await User.findOne({ where: { correo } });
    if (!usuarioInvitado) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const yaMiembro = proyecto.miembros.find((m) => m.userId === usuarioInvitado.id);
    if (yaMiembro) return res.status(400).json({ msg: 'El usuario ya es miembro del proyecto' });

    await ProjectMember.create({ projectId: id, userId: usuarioInvitado.id, rol });
    res.status(200).json({ msg: 'Miembro agregado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al agregar miembro' });
  }
};

export const obtenerMiembros = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Project.findByPk(id, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const esMiembro = proyecto.miembros.some((m) => m.userId === req.user.id);
    if (!esMiembro) return res.status(403).json({ msg: 'No tienes acceso a este proyecto' });

    res.status(200).json(proyecto.miembros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los miembros' });
  }
};

export const eliminarMiembro = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const targetUserId = parseInt(userId);

    const proyecto = await Project.findByPk(id, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const propietario = proyecto.miembros.find(
      (m) => m.userId === req.user.id && m.rol === 'propietario'
    );
    if (!propietario) return res.status(403).json({ msg: 'Solo el propietario puede eliminar miembros' });

    if (req.user.id === targetUserId) {
      return res.status(400).json({ msg: 'No puedes eliminarte a ti mismo del proyecto' });
    }

    await ProjectMember.destroy({ where: { projectId: id, userId: targetUserId } });
    res.status(200).json({ msg: 'Miembro eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar miembro' });
  }
};

export const invitarMiembro = async (req, res) => {
  const { correo } = req.body;
  const proyectoId = req.params.id;
  if (!correo) return res.status(400).json({ msg: 'Correo es requerido' });

  try {
    const usuarioInvitado = await User.findOne({ where: { correo: correo.toLowerCase().trim() } });
    if (!usuarioInvitado) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const proyecto = await Project.findByPk(proyectoId, { include: incluirMiembros });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const yaMiembro = proyecto.miembros.some((m) => m.userId === usuarioInvitado.id);
    if (yaMiembro) return res.status(400).json({ msg: 'El usuario ya es miembro del proyecto' });

    const yaInvitado = await Invitacion.findOne({
      where: { proyectoId, usuarioInvitadoId: usuarioInvitado.id, estado: 'pendiente' },
    });
    if (yaInvitado) return res.status(400).json({ msg: 'Ya existe una invitación pendiente para este usuario' });

    await Invitacion.create({
      proyectoId,
      usuarioInvitadoId: usuarioInvitado.id,
      usuarioInvitadorId: req.user.id,
    });

    res.json({ msg: 'Invitación enviada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al invitar miembro' });
  }
};
