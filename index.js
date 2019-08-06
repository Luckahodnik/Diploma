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
const compose = require('docker-compose');
const LocalStrategy = require('passport-local').Strategy;

var passport   = require('passport')
var session    = require('express-session')
var bodyParser = require('body-parser')
var exceptionHandler = require('express-exception-handler')
exceptionHandler.handle()

passport.use('local-login', new LocalStrategy(
  {
    usernameField: 'email', 
    passwordField : 'password'
  },
  function(username, password, done) {
    const hash = crypto.createHash('sha256');
    hash.update(username.toLowerCase());
    Uporabnik.findOne({ where : { uporabniskiHash: hash.digest() } }).then(function (result) {
      console.log(result);
      return done(null, result);
      if (!result.rows) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.use('local-signup', new LocalStrategy(
  {
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' :  email }, function(err, user) {
      // if there are any errors, return the error
      if (err)
      return done(err);

      // check to see if theres already a user with that email
      if (user) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
      } else {
        var newUser = new User();

        // set the user's local credentials
        newUser.local.email    = email;
        newUser.local.password = newUser.generateHash(password);

        // save the user
        newUser.save(function(err) {
          if (err)
          throw err;
          return done(null, newUser);
        });
      }
    }) 
  }
));

//passport
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session()); 


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


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
    //res.cookie('piskot','dela'),{expire : new Date() + 9999};
    //console.log('Cookies: ', req.cookies);
});


app.post('/register', 
  passport.authenticate('local-signup', { successRedirect: '/',
                                   failureRedirect: '/register' })
);

app.post('/login',
  passport.authenticate('local-login', { successRedirect: '/',
                                   failureRedirect: '/login' })
);

/*app.post('/login', function(req, res) {
  console.log(req.body);
  res.send("ALL OK!");
});*/

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
app.get(['/vec', '/vec.html'], function (req, res) {
  res.sendFile(path.join(__dirname,'/www/vec.html'))
});

app.use('/css', express.static('www/css'));
app.use('/img', express.static('www/img'));
app.use('/js',  express.static('www/js'));
app.use('/vendor',  express.static('www/vendor'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));