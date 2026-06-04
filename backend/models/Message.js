import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Message = sequelize.define('Message', {
  contenido: { type: DataTypes.TEXT, allowNull: false },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'messages',
  timestamps: true,
});

export { Message };
