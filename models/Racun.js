var DataTypes = require('sequelize/lib/data-types');
const Sequelize = require('sequelize');
const seq = require('../config/database');
const Uporabnik = require('./Uporabnik.js');

let Racun = seq.define('racuni',{
  // attributes
  uporabnikId: {
    field: 'uporabnik_id',
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: Uporabnik,
      key: 'id',
     // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },

  idRacuna:{
    field: 'id',
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
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

  XMLName: {
    field: 'xml_name',
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
  modelName: 'racuni',
  freezeTableName: true
  // options
});

module.exports = Racun;
