const Sequelize = require('sequelize');
const seq = require('../config/database');

let Uporabnik = seq.define('uporabniki',{
  // attributes
  uporabniskiHash: {
    field: 'uporabniski_hash',
    type: Sequelize.BLOB('tiny'),
    allowNull: false,
    primaryKey: true
  },

  uporabniskoIme: {
    field: 'uporabnisko_ime',
    type: Sequelize.STRING,
    allowNull: false,
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
  
  slikaPath: {
    field: 'slika_path',
    type: Sequelize.STRING,
    allowNull: true,
  },

}, {
  sequelize: seq,
  modelName: 'uporabniki',
  freezeTableName: true
  // options
});

module.exports = Uporabnik;
