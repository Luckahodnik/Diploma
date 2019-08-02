const express = require('express');
const cookieParser = require('cookie-parser');
const exphbs  = require('express-handlebars');
const path = require('path');
//const models = require('./models/racuni');
const app = express();
const port = 3000;
//Database
const db = require('./config/database.js');
const Racun = require('./models/Racun.js');
const Uporabnik = require('./models/Uporabnik.js');
const http = require('http')

const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');
const compose = require('docker-compose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var session = require("express-session"),
    bodyParser = require("body-parser");


passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());


function authDB(){
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
}

function upOne(){
  compose.upAll({ cwd: path.join(__dirname), log: true})
  .then(
    () => { setTimeout(authDB, 3000); },
    err => { console.log('something went wrong:', err.message)}
  );
}

compose.ps({}).then(
  (e) => {
    if(e.out.match(/diploma_db_[0-9]\s+[a-z-.]+\s+[a-z]+\s+Up\s+/g)){
      authDB();
    } else {
      upOne();
    }
  },
  err => { console.log('something went wrong:', err.message)}
);

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());



app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'/www/index.html'))
    res.cookie('piskot','dela'),{expire : new Date() + 9999};
    console.log('Cookies: ', req.cookies);
});


app.get('/clearcookie', function(req,res){
  clearCookie('cookie_name');
  res.send('Cookie deleted');
});

app.post('/register', function(req, res) {
  console.log(req.body);
  console.log(req.files);
  res.send("ALL OK!");
});
app.post('/login', function(req, res) {
  console.log(req.body);
  res.send("ALL OK!");
});
app.post('/', function(req, res) {
  console.log(req.body);
  res.send("ALL OK!");
});

app.get(['/register', '/register.html'], function (req, res) {
  res.sendFile(path.join(__dirname,'/www/register.html'))
});
app.get(['/login', '/login.html'], function (req, res) {
  res.sendFile(path.join(__dirname,'/www/login.html'))
});
app.get(['/nfc', '/nfc.html'], function (req, res) {
  res.sendFile(path.join(__dirname,'/www/nfc.html'))
});

app.use('/css', express.static('www/css'));
app.use('/img', express.static('www/img'));
app.use('/js',  express.static('www/js'));
app.use('/vendor',  express.static('www/vendor'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));