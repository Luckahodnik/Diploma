const Sequelize = require('sequelize');

// Option 1: Passing parameters separately
module.exports = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
});
