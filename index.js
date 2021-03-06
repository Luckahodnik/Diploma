// =============================================================================
// Express server and http handler =============================================
// =============================================================================
const express = require('express');

// =============================================================================
// Exception handler ===========================================================
// =============================================================================
const exceptionHandler = require('express-exception-handler');

// =============================================================================
// Filesystem module ===========================================================
// =============================================================================
const fs = require("fs");

// =============================================================================
// Path handling module ========================================================
// =============================================================================
const path = require('path');

// =============================================================================
// Database connector and models ===============================================
// =============================================================================
const db = require('./config/database.js');
const Racun = require('./models/Racun.js');
const Uporabnik = require('./models/Uporabnik.js');

// =============================================================================
// Docker-compose connection module ============================================
// =============================================================================
const dockerCompose = require('docker-compose');

// =============================================================================
// Server app initialization ===================================================
// =============================================================================
const app = express();
const port = 3000;

// =============================================================================
// Initialize exception handler ================================================
// =============================================================================
exceptionHandler.handle();

// =============================================================================
// Initialize handlebars data ==================================================
// =============================================================================
const handlebarsData = {
    serverIP : "",
    loginPage : "login",
    registerPage : "register",
    indexPage : "",
    vecPage : "vec",
    nfcPage : "nfc",
    extension : "",
    logoutPath : "/logout",
    logoutMethod : "POST"
}

// =============================================================================
// Require handlers and routes =================================================
// =============================================================================
const handlers = require('./app/handlers.js')(app, express, db, handlebarsData);
require('./app/routes.js')(app, express, handlers, handlebarsData);

// =============================================================================
// Initialize sequelize database connection ====================================
// =============================================================================
function authDB(){
    db.authenticate()
    .then(() => {
            console.log('Connection has been established successfully.');
            Uporabnik.sync().then(() => {
                console.log('Created table for Uporabnik model');
            });
            Racun.sync().then(() => {
                console.log('Created table for Racun model');
            });
        }
    )
    .catch(err => 
        console.error('Unable to connect to the database:', err)
    )
}

// =============================================================================
// Bring up docker container ===================================================
// =============================================================================
function upOne(){
    dockerCompose.upAll({ cwd: path.join(__dirname), log: true})
    .then(
        () => setTimeout(authDB, 8000),
        err => console.log('something went wrong:', err.message)
    );
}

// =============================================================================
// Check if docker container is running ========================================
// =============================================================================
let rgx = /diploma_db_[0-9]\s+[a-z-.]+\s+[a-z]+\s+Up\s+/g;
dockerCompose.ps({}).then(
    e => {
        if (e.out.match(rgx)){ authDB() } 
        else { upOne() }
    },
    err => console.log('something went wrong:', err.message)
);

// =============================================================================
// Create users directory in app/data ==========================================
// =============================================================================
const dataPath = path.join(__dirname, 'app', 'data');
const usersPath = path.join(dataPath, 'users');
if (!fs.existsSync(dataPath)) {
    fs.mkdir(dataPath, (err) => {});
}
if (!fs.existsSync(usersPath)) {
    fs.mkdir(usersPath, (err) => {});
}

// =============================================================================
// Start server app ============================================================
// =============================================================================
app.listen(port, 
    () => console.log(`E-papir server listening on port ${port}!`)
);