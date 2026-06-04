import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Invitacion = sequelize.define('Invitacion', {
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada'),
    defaultValue: 'pendiente',
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'invitaciones',
  timestamps: true,
});

export { Invitacion };
