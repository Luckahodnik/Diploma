const Sequelize = require('sequelize');
const db = require('index.js');

class Racun extends Model {}
Racun.init({
  // attributes
  uporabniskiHash: {
    field: 'uporabniski_hash',
    type: Sequelize.BLOB('tiny'),
    allowNull: false,
    primaryKey: true
  },
  izdajateljRacuna: {
    field: 'izdajatelj_racuna',
    type: Sequelize.STRING
  },
  datum: {
    field: 'datum',
    type: Sequelize.DATEONLY
  },
  znesek: {
    field: 'znesek_z_ddv',
    type: Sequelize.FLOAT
  },
  ddv: {
    field: 'ddv',
    type: Sequelize.FLOAT
  },
  XMLPath: {
    field: 'xml_path',
    type: Sequelize.STRING
  }
}, {
  sequelize,
  modelName: 'racuni',
  freezeTableName: true
  // options
});

class Uporabnik extends Model {}
Uporabnik.init({
  // attributes
  /*uporabniskiHash: {
    field: 'uporabniski_hash',
    type: Sequelize.BLOB('tiny'),
    allowNull: false,
    primaryKey: true
  }*/
}, {
  sequelize,
  modelName: 'uporabniki',
  freezeTableName: true
  // options
});


//module.exports = racun;