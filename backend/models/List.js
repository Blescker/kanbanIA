import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const List = sequelize.define('List', {
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  posicion: { type: DataTypes.INTEGER, defaultValue: 0 },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'lists',
  timestamps: true,
});

export { List };
