const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
//const models = require('./models/racuni');
const app = express();
const port = 3000;
//Database
const db = require('./config/database.js');
const Racun = require('./models/Racun.js');
const Uporabnik = require('./models/Uporabnik.js');
const fileUpload = require('express-fileupload');
//console.log(models);

const crypto = require('crypto');
const hash = crypto.createHash('sha256');

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    /*var upIme = "Hijena";
    hash.update(upIme.toLowerCase());
    
    Uporabnik.create(
      { 
        uporabniskoIme: upIme, 
        email: "HELLO@gmail.com",
        uporabniskiHash: hash.digest(),
        gesloHash: "",
        gesloSalt: "" 
      }
    ).then(uporabnik => {
        console.log(uporabnik);
    })
    .catch(function(err) {
        console.log("To je error");
    });*/
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'/www/index.html'))
});
app.post('/register', function(req, res) {
  console.log(req.body);
  console.log(req.files);
  res.send("ALL OK!");
});

app.get(['/register', '/register.html'], function (req, res) {
  res.sendFile(path.join(__dirname,'/www/register.html'))
});
app.get(['/login', '/login.html'], function (req, res) {
  res.sendFile(path.join(__dirname,'/www/login.html'))
});

app.use('/css', express.static('www/css'));
app.use('/img', express.static('www/img'));
app.use('/js',  express.static('www/js'));
app.use('/vendor',  express.static('www/vendor'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));