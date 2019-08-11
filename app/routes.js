// =============================================================================
// Path handling module ========================================================
// =============================================================================
const path = require('path');

const fileUpload = require('express-fileupload');

const bodyParser = require('body-parser');

// =============================================================================
// Passport with local strategy ================================================
// =============================================================================
const passport = require('passport');

module.exports = function(app, express) {

    // =========================================================================
    // HOME PAGE ===============================================================
    // =========================================================================
    app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname,'../www/index.html'))
        }
    );

    // =========================================================================
    // REGISTER ================================================================
    // =========================================================================
    app.post('/register', (req, res) => {
            register()
        }
    );
    
    // =========================================================================
    // LOGIN ===================================================================
    // =========================================================================
    app.post('/login', (req, res) => {
            login()
        }
    );

    // =========================================================================
    // REGISTER PAGE ===========================================================
    // =========================================================================
    app.get(['/register', '/register.html'], (req, res) => {
        res.sendFile(path.join(__dirname, '../www/register.html'))
    });

    // =========================================================================
    // LOGIN PAGE ==============================================================
    // =========================================================================
    app.get(['/login', '/login.html'], (req, res) => {
        res.sendFile(path.join(__dirname, '../www/login.html'))
    });

    // =========================================================================
    // NFC/NDEF READER PAGE ====================================================
    // =========================================================================
    app.get(['/nfc', '/nfc.html'], (req, res) => {
        res.sendFile(path.join(__dirname, '../www/nfc.html'))
    });

    // =========================================================================
    // MORE PAGE ===============================================================
    // =========================================================================
    app.get(['/vec', '/vec.html'], (req, res) => {
        res.sendFile(path.join(__dirname, '../www/vec.html'))
    });
    
    // =========================================================================
    // STATIC CONTENT ==========================================================
    // =========================================================================
    app.use('/css',    express.static('www/css'));
    app.use('/img',    express.static('www/img'));
    app.use('/js',     express.static('www/js'));
    app.use('/vendor', express.static('www/vendor'));

};