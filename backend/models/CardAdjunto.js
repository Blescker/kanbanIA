import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const CardAdjunto = sequelize.define('CardAdjunto', {
  nombre: { type: DataTypes.STRING(255), allowNull: false },
  url: { type: DataTypes.TEXT, allowNull: false },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'card_adjuntos',
  timestamps: false,
});

export { CardAdjunto };
