const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

const Sequelize = require('sequelize');

// Option 1: Passing parameters separately
const db = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
});

db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'/www/index.html'))
})
app.use('/css', express.static('www/css'));
app.use('/img', express.static('www/img'));
app.use('/js',  express.static('www/js'));
app.use('/vendor',  express.static('www/vendor'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));