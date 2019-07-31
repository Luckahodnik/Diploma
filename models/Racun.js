const Sequelize = require('sequelize');
const seq = require('../config/database');
const Uporabnik = require('./Uporabnik.js');

let Racun = seq.define('racuni',{
  // attributes
  uporabniskiHash: {
    field: 'uporabniski_hash',
    type: Sequelize.BLOB('tiny'),
    allowNull: false,
    references: {
      model: Uporabnik,
      key: 'uporabniski_hash',
     // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },

  idRacuna:{
    field: 'id_racuna',
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  izdajateljRacuna: {
    field: 'izdajatelj_racuna',
    type: Sequelize.STRING,
    allowNull: false,
  },

  datum: {
    field: 'datum',
    type: Sequelize.DATEONLY,
    allowNull: false,
  },

  znesek: {
    field: 'znesek_z_ddv',
    type: Sequelize.FLOAT,
    allowNull: false,
  },

  ddv: {
    field: 'ddv',
    type: Sequelize.FLOAT,
    allowNull: true,
  },

  XMLPath: {
    field: 'xml_path',
    type: Sequelize.STRING,
    allowNull: true,
  }
  
}, {
  sequelize: seq,
  modelName: 'racuni',
  freezeTableName: true
  // options
});

module.exports = Racun;