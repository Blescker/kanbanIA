import { List, Card, Project, ProjectMember } from '../models/index.js';

const esMiembroProyecto = async (proyectoId, userId) => {
  const miembro = await ProjectMember.findOne({ where: { projectId: proyectoId, userId } });
  return !!miembro;
};

export const crearLista = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;
    const { nombre, posicion } = req.body;

    if (!nombre) return res.status(400).json({ msg: 'El nombre de la lista es obligatorio' });

    const proyecto = await Project.findByPk(proyectoId);
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    if (!(await esMiembroProyecto(proyectoId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para agregar listas' });
    }

    const lista = await List.create({ nombre, posicion, proyectoId });
    res.status(201).json({ msg: 'Lista creada correctamente', lista });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la lista' });
  }
};

export const obtenerListasPorProyecto = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;

    const proyecto = await Project.findByPk(proyectoId);
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    if (!(await esMiembroProyecto(proyectoId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes acceso a este proyecto' });
    }

    const listas = await List.findAll({ where: { proyectoId }, order: [['posicion', 'ASC']] });
    res.status(200).json(listas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener listas' });
  }
};

export const editarLista = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ msg: 'El nombre es obligatorio' });

    const lista = await List.findByPk(id);
    if (!lista) return res.status(404).json({ msg: 'Lista no encontrada' });

    if (!(await esMiembroProyecto(lista.proyectoId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para editar listas' });
    }

    lista.nombre = nombre;
    await lista.save();
    res.json({ msg: 'Lista actualizada correctamente', lista });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al editar la lista' });
  }
};

export const eliminarLista = async (req, res) => {
  try {
    const { id } = req.params;

    const lista = await List.findByPk(id);
    if (!lista) return res.status(404).json({ msg: 'Lista no encontrada' });

    if (!(await esMiembroProyecto(lista.proyectoId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar listas' });
    }

    await lista.destroy();
    res.json({ msg: 'Lista y sus cards eliminadas correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar la lista' });
  }
};
