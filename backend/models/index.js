import sequelize from '../db/sequelize.js';
import { User } from './User.js';
import { Project } from './Project.js';
import { ProjectMember } from './ProjectMember.js';
import { List } from './List.js';
import { Card } from './Card.js';
import { CardMember } from './CardMember.js';
import { CardEtiqueta } from './CardEtiqueta.js';
import { CardChecklist } from './CardChecklist.js';
import { CardAdjunto } from './CardAdjunto.js';
import { Message } from './Message.js';
import { Invitacion } from './Invitaciones.js';

// Project ↔ User (creador)
Project.belongsTo(User, { as: 'creador', foreignKey: 'creadorId' });
User.hasMany(Project, { foreignKey: 'creadorId' });

// Project ↔ ProjectMember ↔ User
Project.hasMany(ProjectMember, { as: 'miembros', foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
ProjectMember.belongsTo(User, { as: 'usuario', foreignKey: 'userId' });
User.hasMany(ProjectMember, { foreignKey: 'userId' });

// Project → List → Card
Project.hasMany(List, { foreignKey: 'proyectoId', onDelete: 'CASCADE' });
List.belongsTo(Project, { foreignKey: 'proyectoId' });
List.hasMany(Card, { as: 'cards', foreignKey: 'listaId', onDelete: 'CASCADE' });
Card.belongsTo(List, { foreignKey: 'listaId' });

// Card ↔ User (miembros asignados)
Card.belongsToMany(User, { as: 'miembros', through: CardMember, foreignKey: 'cardId' });
User.belongsToMany(Card, { through: CardMember, foreignKey: 'userId' });

// Card → sub-tablas
Card.hasMany(CardEtiqueta, { as: 'etiquetas', foreignKey: 'cardId', onDelete: 'CASCADE' });
CardEtiqueta.belongsTo(Card, { foreignKey: 'cardId' });

Card.hasMany(CardChecklist, { as: 'checklist', foreignKey: 'cardId', onDelete: 'CASCADE' });
CardChecklist.belongsTo(Card, { foreignKey: 'cardId' });

Card.hasMany(CardAdjunto, { as: 'adjuntos', foreignKey: 'cardId', onDelete: 'CASCADE' });
CardAdjunto.belongsTo(Card, { foreignKey: 'cardId' });

// Message → User, Project
Message.belongsTo(User, { as: 'usuario', foreignKey: 'usuarioId' });
Message.belongsTo(Project, { foreignKey: 'proyectoId' });
Project.hasMany(Message, { foreignKey: 'proyectoId', onDelete: 'CASCADE' });

// Invitacion → Project, User (x2)
Invitacion.belongsTo(Project, { as: 'proyecto', foreignKey: 'proyectoId' });
Invitacion.belongsTo(User, { as: 'usuarioInvitado', foreignKey: 'usuarioInvitadoId' });
Invitacion.belongsTo(User, { as: 'usuarioInvitador', foreignKey: 'usuarioInvitadorId' });

export const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log('✅ Base de datos MySQL sincronizada');
};

export {
  sequelize, User, Project, ProjectMember,
  List, Card, CardMember, CardEtiqueta, CardChecklist, CardAdjunto,
  Message, Invitacion,
};
