import Anthropic from '@anthropic-ai/sdk';
import { List, Card, CardEtiqueta, CardChecklist } from '../models/index.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const conversaciones = new Map();

// Construye el contexto del tablero actual para el system prompt
const construirContextoTablero = async (proyectoId) => {
  const listas = await List.findAll({
    where: { proyectoId },
    include: [{ model: Card, as: 'cards', attributes: ['id', 'titulo'] }],
    order: [['posicion', 'ASC']],
  });

  if (listas.length === 0) return '(El tablero está vacío — sin listas aún)';

  return listas.map(l => {
    const cards = l.cards?.length
      ? l.cards.map(c => `  - "${c.titulo}"`).join('\n')
      : '  (sin cards)';
    return `📋 Lista: "${l.nombre}"\n${cards}`;
  }).join('\n');
};

const construirSystemPrompt = (contextoTablero) => `
Eres un asistente especializado en gestión de proyectos Kanban. Tienes acceso al estado actual del tablero y puedes tanto crear planificaciones completas como modificar elementos existentes.

═══ ESTADO ACTUAL DEL TABLERO ═══
${contextoTablero}
═════════════════════════════════

CAPACIDADES:
- Crear una planificación completa (cuando el tablero esté vacío o el usuario pida uno nuevo)
- Renombrar listas o cards existentes
- Crear nuevas listas o cards
- Mover cards entre listas
- Actualizar descripción de cards
- Eliminar listas o cards
- Agregar ítems de checklist o etiquetas a cards

REGLAS IMPORTANTES:
1. Para modificaciones directas (renombrar, mover, actualizar, eliminar): ejecuta inmediatamente sin pedir confirmación, a menos que la acción sea destructiva (eliminar lista con muchas cards).
2. Para una planificación completa nueva: explícala primero en texto y espera confirmación del usuario antes de generar el JSON.
3. Si el usuario menciona un nombre que no existe en el tablero, díselo claramente y ofrece alternativas basadas en lo que existe.
4. Identifica listas y cards por su nombre tal como aparecen en el tablero (no por ID).
5. Nunca menciones que vas a generar JSON ni que estás procesando operaciones internamente.

FORMATO DE RESPUESTA:

Para MODIFICACIONES al tablero existente, tu respuesta debe ser texto natural explicando qué hiciste, seguido del bloque JSON de operaciones:

{ "operaciones": [
  { "tipo": "renombrar_lista", "nombre_actual": "nombre exacto actual", "nombre_nuevo": "nombre nuevo" },
  { "tipo": "renombrar_card", "lista": "nombre de la lista", "nombre_actual": "título actual", "nombre_nuevo": "título nuevo" },
  { "tipo": "crear_lista", "nombre": "nombre" },
  { "tipo": "crear_card", "lista": "nombre de lista", "titulo": "título", "descripcion": "desc", "checklist": ["item1"], "etiquetas": [{"nombre":"x","color":"#hex"}] },
  { "tipo": "mover_card", "titulo": "título card", "lista_origen": "nombre lista origen", "lista_destino": "nombre lista destino" },
  { "tipo": "actualizar_descripcion", "lista": "nombre lista", "titulo": "título card", "nueva_descripcion": "nueva desc" },
  { "tipo": "eliminar_card", "lista": "nombre lista", "titulo": "título card" },
  { "tipo": "eliminar_lista", "nombre": "nombre lista" },
  { "tipo": "agregar_checklist", "lista": "nombre lista", "titulo": "título card", "items": ["item1", "item2"] },
  { "tipo": "agregar_etiqueta", "lista": "nombre lista", "titulo": "título card", "nombre": "etiqueta", "color": "#hex" }
]}

Para CREAR UN PLAN COMPLETO (solo cuando el usuario confirme), responde ÚNICAMENTE con el JSON sin texto adicional:
{ "listas": [{ "nombre": "...", "tareas": [{ "titulo": "...", "descripcion": "...", "etiquetas": [...], "checklist": [...] }] }] }

Para CONVERSACIÓN normal, responde solo en texto.
`.trim();

// Ejecuta cada operación sobre la base de datos
const ejecutarOperaciones = async (operaciones, proyectoId) => {
  const resultados = [];

  for (const op of operaciones) {
    try {
      switch (op.tipo) {

        case 'renombrar_lista': {
          const lista = await List.findOne({ where: { proyectoId, nombre: op.nombre_actual } });
          if (!lista) { resultados.push({ ok: false, op, error: `Lista "${op.nombre_actual}" no encontrada` }); break; }
          await lista.update({ nombre: op.nombre_nuevo });
          resultados.push({ ok: true, op });
          break;
        }

        case 'renombrar_card': {
          const whereCard = { titulo: op.nombre_actual };
          if (op.lista) {
            const lista = await List.findOne({ where: { proyectoId, nombre: op.lista } });
            if (!lista) { resultados.push({ ok: false, op, error: `Lista "${op.lista}" no encontrada` }); break; }
            whereCard.listaId = lista.id;
          }
          const card = await Card.findOne({ where: whereCard });
          if (!card) { resultados.push({ ok: false, op, error: `Card "${op.nombre_actual}" no encontrada` }); break; }
          await card.update({ titulo: op.nombre_nuevo });
          resultados.push({ ok: true, op });
          break;
        }

        case 'crear_lista': {
          const count = await List.count({ where: { proyectoId } });
          await List.create({ nombre: op.nombre, proyectoId, posicion: count });
          resultados.push({ ok: true, op });
          break;
        }

        case 'crear_card': {
          const lista = await List.findOne({ where: { proyectoId, nombre: op.lista } });
          if (!lista) { resultados.push({ ok: false, op, error: `Lista "${op.lista}" no encontrada` }); break; }
          const count = await Card.count({ where: { listaId: lista.id } });
          const nuevaCard = await Card.create({ titulo: op.titulo, descripcion: op.descripcion || '', listaId: lista.id, posicion: count });
          if (Array.isArray(op.checklist)) {
            for (const item of op.checklist) {
              await CardChecklist.create({ cardId: nuevaCard.id, nombre: item, completado: false });
            }
          }
          if (Array.isArray(op.etiquetas)) {
            for (const e of op.etiquetas) {
              await CardEtiqueta.create({ cardId: nuevaCard.id, nombre: e.nombre || '', color: e.color || '#000000' });
            }
          }
          resultados.push({ ok: true, op });
          break;
        }

        case 'mover_card': {
          const listaDest = await List.findOne({ where: { proyectoId, nombre: op.lista_destino } });
          if (!listaDest) { resultados.push({ ok: false, op, error: `Lista destino "${op.lista_destino}" no encontrada` }); break; }
          const whereCard = { titulo: op.titulo };
          if (op.lista_origen) {
            const listaOrig = await List.findOne({ where: { proyectoId, nombre: op.lista_origen } });
            if (listaOrig) whereCard.listaId = listaOrig.id;
          }
          const card = await Card.findOne({ where: whereCard });
          if (!card) { resultados.push({ ok: false, op, error: `Card "${op.titulo}" no encontrada` }); break; }
          await card.update({ listaId: listaDest.id });
          resultados.push({ ok: true, op });
          break;
        }

        case 'actualizar_descripcion': {
          const whereCard = { titulo: op.titulo };
          if (op.lista) {
            const lista = await List.findOne({ where: { proyectoId, nombre: op.lista } });
            if (lista) whereCard.listaId = lista.id;
          }
          const card = await Card.findOne({ where: whereCard });
          if (!card) { resultados.push({ ok: false, op, error: `Card "${op.titulo}" no encontrada` }); break; }
          await card.update({ descripcion: op.nueva_descripcion });
          resultados.push({ ok: true, op });
          break;
        }

        case 'eliminar_card': {
          const whereCard = { titulo: op.titulo };
          if (op.lista) {
            const lista = await List.findOne({ where: { proyectoId, nombre: op.lista } });
            if (lista) whereCard.listaId = lista.id;
          }
          const card = await Card.findOne({ where: whereCard });
          if (!card) { resultados.push({ ok: false, op, error: `Card "${op.titulo}" no encontrada` }); break; }
          await card.destroy();
          resultados.push({ ok: true, op });
          break;
        }

        case 'eliminar_lista': {
          const lista = await List.findOne({ where: { proyectoId, nombre: op.nombre } });
          if (!lista) { resultados.push({ ok: false, op, error: `Lista "${op.nombre}" no encontrada` }); break; }
          await lista.destroy();
          resultados.push({ ok: true, op });
          break;
        }

        case 'agregar_checklist': {
          const whereCard = { titulo: op.titulo };
          if (op.lista) {
            const lista = await List.findOne({ where: { proyectoId, nombre: op.lista } });
            if (lista) whereCard.listaId = lista.id;
          }
          const card = await Card.findOne({ where: whereCard });
          if (!card) { resultados.push({ ok: false, op, error: `Card "${op.titulo}" no encontrada` }); break; }
          for (const item of (op.items || [])) {
            await CardChecklist.create({ cardId: card.id, nombre: item, completado: false });
          }
          resultados.push({ ok: true, op });
          break;
        }

        case 'agregar_etiqueta': {
          const whereCard = { titulo: op.titulo };
          if (op.lista) {
            const lista = await List.findOne({ where: { proyectoId, nombre: op.lista } });
            if (lista) whereCard.listaId = lista.id;
          }
          const card = await Card.findOne({ where: whereCard });
          if (!card) { resultados.push({ ok: false, op, error: `Card "${op.titulo}" no encontrada` }); break; }
          await CardEtiqueta.create({ cardId: card.id, nombre: op.nombre || '', color: op.color || '#000000' });
          resultados.push({ ok: true, op });
          break;
        }

        default:
          resultados.push({ ok: false, op, error: `Operación desconocida: ${op.tipo}` });
      }
    } catch (err) {
      resultados.push({ ok: false, op, error: err.message });
    }
  }

  return resultados;
};

export const generarPlan = async (req, res) => {
  const { descripcion, proyectoId } = req.body;
  if (!descripcion || !proyectoId) {
    return res.status(400).json({ msg: 'Descripción y proyectoId son requeridos' });
  }

  const sesionId = String(req.user.id);
  if (!conversaciones.has(sesionId)) conversaciones.set(sesionId, []);

  const historial = conversaciones.get(sesionId);
  historial.push({ role: 'user', content: descripcion });

  try {
    const contextoTablero = await construirContextoTablero(proyectoId);
    const systemPrompt = construirSystemPrompt(contextoTablero);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      messages: historial,
    });

    const mensajeIA = response.content[0].text;
    historial.push({ role: 'assistant', content: mensajeIA });

    // Intentar extraer JSON de la respuesta
    let planJSON = null;
    try {
      const match = mensajeIA.match(/\{[\s\S]*\}/);
      if (match) planJSON = JSON.parse(match[0]);
    } catch (e) {}

    // Caso 1: Plan completo nuevo (listas)
    if (planJSON?.listas) {
      conversaciones.delete(sesionId);
      const creadas = [];
      for (const lista of planJSON.listas) {
        const listaGuardada = await List.create({ nombre: lista.nombre, proyectoId });
        for (const tarea of lista.tareas || []) {
          const nuevaCard = await Card.create({ titulo: tarea.titulo, descripcion: tarea.descripcion, listaId: listaGuardada.id });
          if (Array.isArray(tarea.etiquetas)) {
            for (const e of tarea.etiquetas) await CardEtiqueta.create({ cardId: nuevaCard.id, nombre: e.nombre || '', color: e.color || '#000000' });
          }
          if (Array.isArray(tarea.checklist)) {
            for (const c of tarea.checklist) {
              const nombre = typeof c === 'string' ? c : (c.nombre || '');
              await CardChecklist.create({ cardId: nuevaCard.id, nombre, completado: false });
            }
          }
        }
        creadas.push(listaGuardada);
      }
      return res.status(201).json({ msg: 'Planificación creada', listas: creadas });
    }

    // Caso 2: Operaciones sobre el tablero existente
    if (planJSON?.operaciones?.length > 0) {
      const resultados = await ejecutarOperaciones(planJSON.operaciones, proyectoId);
      const exitosas = resultados.filter(r => r.ok).length;
      const fallidas = resultados.filter(r => !r.ok);

      // Texto de la IA sin el bloque JSON
      const textoIA = mensajeIA.replace(/\{[\s\S]*\}/, '').trim();

      let resumen = `✅ ${exitosas} operación${exitosas !== 1 ? 'es' : ''} aplicada${exitosas !== 1 ? 's' : ''} al tablero.`;
      if (fallidas.length > 0) {
        resumen += `\n⚠️ ${fallidas.length} no pudieron ejecutarse: ${fallidas.map(f => f.error).join(', ')}.`;
      }

      return res.status(200).json({
        mensajeIA: textoIA || resumen,
        resumen,
        operaciones: resultados,
      });
    }

    // Caso 3: Conversación normal
    res.status(200).json({ mensajeIA });
  } catch (error) {
    console.error('Error en planificación IA:', error);
    if (error.status === 401) return res.status(401).json({ msg: 'API key de Anthropic inválida.' });
    if (error.status === 429) return res.status(429).json({ msg: 'Límite de uso de Anthropic alcanzado.' });
    return res.status(500).json({ msg: 'No se pudo generar la planificación.' });
  }
};
