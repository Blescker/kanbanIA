import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Card = sequelize.define('Card', {
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  fechaInicio: { type: DataTypes.DATE },
  fechaFin: { type: DataTypes.DATE },
  posicion: { type: DataTypes.INTEGER, defaultValue: 0 },
  completada: { type: DataTypes.BOOLEAN, defaultValue: false },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'cards',
  timestamps: true,
});

export { Card };
