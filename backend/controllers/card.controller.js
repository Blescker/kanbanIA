import { Card, List, Project, ProjectMember, CardMember, CardEtiqueta, CardChecklist, CardAdjunto, User } from '../models/index.js';

const incluirCard = [
  { model: CardEtiqueta, as: 'etiquetas' },
  { model: CardChecklist, as: 'checklist' },
  { model: CardAdjunto, as: 'adjuntos' },
  { model: User, as: 'miembros', through: { attributes: [] }, attributes: ['id', 'nombre', 'correo', 'avatar'] },
];

const esMiembroDeCard = async (listaId, userId) => {
  const lista = await List.findByPk(listaId);
  if (!lista) return false;
  const miembro = await ProjectMember.findOne({ where: { projectId: lista.proyectoId, userId } });
  return !!miembro;
};

export const crearTarjeta = async (req, res) => {
  try {
    const { id: listaId } = req.params;
    const { titulo, descripcion, fechaInicio, fechaFin } = req.body;

    if (!titulo) return res.status(400).json({ msg: 'El título es obligatorio' });

    const lista = await List.findByPk(listaId);
    if (!lista) return res.status(404).json({ msg: 'Lista no encontrada' });

    if (!(await esMiembroDeCard(listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para agregar tarjetas' });
    }

    const tarjeta = await Card.create({ titulo, descripcion, fechaInicio, fechaFin, listaId });
    const tarjetaCompleta = await Card.findByPk(tarjeta.id, { include: incluirCard });
    res.status(201).json({ msg: 'Tarjeta creada correctamente', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la tarjeta' });
  }
};


export const asignarMiembros = async (req, res) => {
  try {
    const { id } = req.params;
    const { miembros } = req.body;

    if (!Array.isArray(miembros)) {
      return res.status(400).json({ msg: 'Se debe enviar un array de IDs de miembros' });
    }

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    const lista = await List.findByPk(tarjeta.listaId);
    const miembrosProyecto = await ProjectMember.findAll({ where: { projectId: lista.proyectoId } });
    const idsMiembrosProyecto = miembrosProyecto.map((m) => m.userId);

    const esRequeridorMiembro = idsMiembrosProyecto.includes(req.user.id);
    if (!esRequeridorMiembro) {
      return res.status(403).json({ msg: 'No tienes permiso para asignar miembros en esta tarjeta' });
    }

    const todosSonMiembros = miembros.every((uid) => idsMiembrosProyecto.includes(parseInt(uid)));
    if (!todosSonMiembros) {
      return res.status(400).json({ msg: 'Uno o más usuarios no son miembros del proyecto' });
    }

    await CardMember.destroy({ where: { cardId: id } });
    for (const userId of miembros) {
      await CardMember.create({ cardId: id, userId: parseInt(userId) });
    }

    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.status(200).json({ msg: 'Miembros asignados correctamente', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al asignar miembros' });
  }
};

export const agregarChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ msg: 'El nombre del ítem es obligatorio' });

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!(await esMiembroDeCard(tarjeta.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    await CardChecklist.create({ cardId: id, nombre, completado: false });

    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.status(200).json({ msg: 'Ítem añadido al checklist', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al agregar ítem al checklist' });
  }
};

export const actualizarChecklistItem = async (req, res) => {
  try {
    const { cardId, itemId } = req.params;
    const { nombre, completado } = req.body;

    const item = await CardChecklist.findOne({ where: { id: itemId, cardId } });
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado' });

    const card = await Card.findByPk(cardId);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    if (!(await esMiembroDeCard(card.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    if (nombre !== undefined) item.nombre = nombre;
    if (completado !== undefined) item.completado = completado;
    await item.save();

    const checklist = await CardChecklist.findAll({ where: { cardId } });
    res.json(checklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar ítem del checklist' });
  }
};

export const eliminarChecklistItem = async (req, res) => {
  try {
    const { cardId, itemId } = req.params;

    const item = await CardChecklist.findOne({ where: { id: itemId, cardId } });
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado en el checklist' });

    const card = await Card.findByPk(cardId);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    if (!(await esMiembroDeCard(card.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    await item.destroy();

    const tarjetaCompleta = await Card.findByPk(cardId, { include: incluirCard });
    res.status(200).json({ msg: 'Ítem eliminado', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar el ítem del checklist' });
  }
};

export const agregarAdjunto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, url } = req.body;
    if (!nombre || !url) return res.status(400).json({ msg: 'Nombre y URL son obligatorios' });

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!(await esMiembroDeCard(tarjeta.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    await CardAdjunto.create({ cardId: id, nombre, url });

    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.status(200).json({ msg: 'Adjunto agregado correctamente', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al agregar adjunto' });
  }
};

export const eliminarAdjunto = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const adjunto = await CardAdjunto.findOne({ where: { id: itemId, cardId: id } });
    if (!adjunto) return res.status(404).json({ msg: 'Adjunto no encontrado' });

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    if (!(await esMiembroDeCard(tarjeta.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    await adjunto.destroy();

    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.status(200).json({ msg: 'Adjunto eliminado', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar adjunto' });
  }
};

export const agregarEtiqueta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, color } = req.body;
    if (!nombre || !color) return res.status(400).json({ msg: 'Nombre y color son obligatorios' });

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!(await esMiembroDeCard(tarjeta.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    await CardEtiqueta.create({ cardId: id, nombre, color });

    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.status(200).json({ msg: 'Etiqueta agregada', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al agregar etiqueta' });
  }
};

export const eliminarEtiqueta = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const etiqueta = await CardEtiqueta.findOne({ where: { id: itemId, cardId: id } });
    if (!etiqueta) return res.status(404).json({ msg: 'Etiqueta no encontrada' });

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    if (!(await esMiembroDeCard(tarjeta.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    await etiqueta.destroy();

    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.status(200).json({ msg: 'Etiqueta eliminada', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar etiqueta' });
  }
};

export const reordenarTarjetas = async (req, res) => {
  try {
    const { id: listaId } = req.params;
    const { tarjetas } = req.body;

    if (!Array.isArray(tarjetas)) {
      return res.status(400).json({ msg: 'Debes enviar un arreglo de tarjetas con posición' });
    }

    if (!(await esMiembroDeCard(listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para reordenar tarjetas en esta lista' });
    }

    for (const tarjeta of tarjetas) {
      await Card.update({ posicion: tarjeta.posicion }, { where: { id: tarjeta.id, listaId } });
    }

    res.status(200).json({ msg: 'Tarjetas reordenadas correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al reordenar tarjetas' });
  }
};

export const obtenerTarjetasPorLista = async (req, res) => {
  try {
    const { id: listaId } = req.params;

    if (!listaId || isNaN(parseInt(listaId))) {
      return res.status(400).json({ msg: 'ID de lista inválido' });
    }

    const lista = await List.findByPk(listaId);
    if (!lista) return res.status(200).json([]);

    const miembro = await ProjectMember.findOne({ where: { projectId: lista.proyectoId, userId: req.user.id } });
    if (!miembro) return res.status(403).json({ msg: 'No tienes permiso para ver las tarjetas' });

    const tarjetas = await Card.findAll({
      where: { listaId },
      include: incluirCard,
      order: [['posicion', 'ASC']],
    });

    res.status(200).json(tarjetas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener tarjetas' });
  }
};

export const obtenerTarjeta = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findByPk(id, { include: incluirCard });
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    if (!(await esMiembroDeCard(card.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para ver esta tarjeta' });
    }
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener tarjeta' });
  }
};

export const moverCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaListaId } = req.body;

    if (!nuevaListaId) return res.status(400).json({ msg: 'nuevaListaId es obligatorio' });

    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    const listaOrigen = await List.findByPk(card.listaId);
    if (!listaOrigen) return res.status(404).json({ msg: 'Lista de origen no encontrada' });

    const listaDestino = await List.findByPk(nuevaListaId);
    if (!listaDestino) return res.status(404).json({ msg: 'Lista de destino no encontrada' });

    if (listaOrigen.proyectoId !== listaDestino.proyectoId) {
      return res.status(403).json({ msg: 'No se puede mover una tarjeta a otro proyecto' });
    }

    const miembro = await ProjectMember.findOne({ where: { projectId: listaOrigen.proyectoId, userId: req.user.id } });
    if (!miembro) return res.status(403).json({ msg: 'No tienes permiso para mover tarjetas en este proyecto' });

    card.listaId = nuevaListaId;
    await card.save();

    res.json({ msg: 'Tarjeta movida correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al mover tarjeta' });
  }
};

export const actualizarEstadoCompletada = async (req, res) => {
  try {
    const { id } = req.params;
    const { completada } = req.body;

    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!(await esMiembroDeCard(card.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta tarjeta' });
    }

    card.completada = completada;
    await card.save();

    res.json({ msg: 'Estado actualizado', card });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar estado' });
  }
};

export const obtenerChecklist = async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    const checklist = await CardChecklist.findAll({ where: { cardId: req.params.id } });
    res.json(checklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

export const obtenerEtiquetasCard = async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    const etiquetas = await CardEtiqueta.findAll({ where: { cardId: req.params.id } });
    res.json(etiquetas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener etiquetas' });
  }
};

export const actualizarTarjeta = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;

    const tarjeta = await Card.findByPk(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!(await esMiembroDeCard(tarjeta.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para editar esta tarjeta' });
    }

    const camposPermitidos = ['titulo', 'descripcion', 'fechaInicio', 'fechaFin'];
    camposPermitidos.forEach((campo) => {
      if (campos[campo] !== undefined) tarjeta[campo] = campos[campo];
    });

    await tarjeta.save();
    const tarjetaCompleta = await Card.findByPk(id, { include: incluirCard });
    res.json({ msg: 'Tarjeta actualizada correctamente', tarjeta: tarjetaCompleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar la tarjeta' });
  }
};

export const eliminarCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!(await esMiembroDeCard(card.listaId, req.user.id))) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar tarjetas' });
    }

    await card.destroy();
    res.json({ msg: 'Tarjeta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar la tarjeta' });
  }
};
