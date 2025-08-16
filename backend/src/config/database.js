const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'megasys',
  username: process.env.DB_USER || 'megasys_user',
  password: process.env.DB_PASSWORD || 'megasys_pass_2024',
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,    // Usa snake_case en BD
    freezeTableName: true, // No pluraliza nombres de tablas
    paranoid: false       // No usa soft deletes por defecto
  }
});

module.exports = sequelize;