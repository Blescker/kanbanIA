import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const ProjectMember = sequelize.define('ProjectMember', {
  rol: {
    type: DataTypes.ENUM('propietario', 'colaborador', 'lector'),
    defaultValue: 'colaborador',
  },
}, {
  tableName: 'project_members',
  timestamps: true,
});

export { ProjectMember };
