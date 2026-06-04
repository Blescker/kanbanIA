import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Project = sequelize.define('Project', {
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, {
  tableName: 'projects',
  timestamps: true,
});

export { Project };
