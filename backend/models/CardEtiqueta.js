import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const CardEtiqueta = sequelize.define('CardEtiqueta', {
  nombre: { type: DataTypes.STRING(100) },
  color: { type: DataTypes.STRING(30) },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'card_etiquetas',
  timestamps: false,
});

export { CardEtiqueta };
