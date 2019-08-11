const Sequelize = require('sequelize');
const seq = require('../config/database');

let Uporabnik = seq.define('uporabniki',{
  // attributes
  id: {
    field: 'id',
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  },

  gesloHash: {
    field: 'geslo_hash',
    type: Sequelize.BLOB('tiny'),
    allowNull: false,
  },

  gesloSalt: {
    field: 'geslo_salt',
    type: Sequelize.BLOB('tiny'),
    allowNull: false,
  },

  ime: {
    field: 'ime',
    type: Sequelize.STRING,
    allowNull: true,
  },

  priimek: {
    field: 'priimek',
    type: Sequelize.STRING,
    allowNull: true,
  },

  email: {
    field: 'email',
    type: Sequelize.STRING,
    allowNull: false,
  },

  createdAt: {
    field: 'created_at',
    type: 'TIMESTAMP',
    allowNull: true,
  },

  updatedAt: {
    field: 'updated_at',
    type: 'TIMESTAMP',
    allowNull: true,
  }

}, {
  sequelize: seq,
  modelName: 'uporabniki',
  freezeTableName: true
  // options
});

module.exports = Uporabnik;
