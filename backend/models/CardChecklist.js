import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const CardChecklist = sequelize.define('CardChecklist', {
  nombre: { type: DataTypes.STRING(255), allowNull: false },
  completado: { type: DataTypes.BOOLEAN, defaultValue: false },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'card_checklist',
  timestamps: false,
});

export { CardChecklist };
