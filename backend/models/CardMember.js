import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const CardMember = sequelize.define('CardMember', {}, {
  tableName: 'card_members',
  timestamps: false,
});

export { CardMember };
