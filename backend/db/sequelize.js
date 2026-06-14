import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.production' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pgp_ia_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

export default sequelize;
