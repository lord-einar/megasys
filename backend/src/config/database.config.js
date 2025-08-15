// ============================================
// backend/src/config/database.config.js
// ============================================
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'megasys_user',
    password: process.env.DB_PASSWORD || 'megasys_pass_2024',
    database: process.env.DB_NAME || 'megasys',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  test: {
    username: process.env.DB_USER || 'megasys_user',
    password: process.env.DB_PASSWORD || 'megasys_pass_2024',
    database: process.env.DB_NAME || 'megasys_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};