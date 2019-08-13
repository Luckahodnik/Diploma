// =============================================================================
// Universally unique identifier generator module ==============================
// =============================================================================
const uuidv4 = require('uuid/v4');
const uuidv5 = require('uuid/v5');

// =============================================================================
// Namespace unique identifier =================================================
// =============================================================================
const NAMESPACE_UUID = 'e36a80cb-7780-4b62-afbf-e684dc24419a';

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
    type: Sequelize.UUID,
    allowNull: false,
  },

  gesloSalt: {
    field: 'geslo_salt',
    type: Sequelize.UUID,
    allowNull: false,
  },

  virtualGeslo: {
    type: Sequelize.VIRTUAL,
    set: function (val) {
      let salt = uuidv4();
      let hashed = uuidv5(val, salt);
      this.setDataValue('geslo_salt', salt);
      this.setDataValue('password_hash', hashed);
    },
    validate: {
      isCorrect: function (val) {
        if (val.length < 2) {
          throw new Error("Prosimo izberite daljše geslo")
        }
      }
    }
  },

  virtualEmail: {
    type: Sequelize.VIRTUAL,
    set: function (val) {
      this.setDataValue('email', val);
      this.setDataValue('id', uuidv5(val, NAMESPACE_UUID));
    },
    validate: {
      isCorrect: function (val) {
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(val)) {
          throw new Error("Vpisan elektronski naslov ni veljaven")
        }
      }
    }
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
