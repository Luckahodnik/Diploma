// =============================================================================
// Cookie parser, file upload and body parser ==================================
// =============================================================================
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');

// =============================================================================
// Handlebars view engine, Session manager and file upload for Express =========
// =============================================================================
const exphbs = require('express-handlebars');
const session = require('express-session');
const fileUpload = require('express-fileupload');

// =============================================================================
// Filesystem module ===========================================================
// =============================================================================
const fs = require("fs");

// =============================================================================
// Path handling module ========================================================
// =============================================================================
const path = require('path');

// =============================================================================
// Sequelize models ============================================================
// =============================================================================
const Racun = require('../models/Racun.js');
const Uporabnik = require('../models/Uporabnik.js');

// =============================================================================
// Cryptography module =========================================================
// =============================================================================
const crypto = require('crypto');

// =============================================================================
// Universally unique identifier generator module and secret ===================
// =============================================================================
const uuidv5 = require('uuid/v5');
const uuidv4 = require('uuid/v4');

// =============================================================================
// Secret key ==================================================================
// =============================================================================
const SECRET = 'diplomasecret';


// =============================================================================
// Namespace unique identifier =================================================
// =============================================================================
const NAMESPACE_UUID = 'e36a80cb-7780-4b62-afbf-e684dc24419a';

// =============================================================================
// JSON Web Token library ======================================================
// =============================================================================
let jwt = require('jsonwebtoken');

module.exports = (app, express, db) => {
    
    // =========================================================================
    // BODY PARSER =============================================================
    // =========================================================================
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // =========================================================================
    // SESSION =================================================================
    // =========================================================================
    app.use(
        session(
            { 
                secret: SECRET,
                resave: true, 
                saveUninitialized:true
            }
        )
    );

    // =========================================================================
    // FILE UPLOAD =============================================================
    // =========================================================================
    app.use(fileUpload());

    // =========================================================================
    // JSON HANDLER ============================================================
    // =========================================================================
    app.use(express.json());

    // =========================================================================
    // URLENCODED HANDLER ======================================================
    // =========================================================================
    app.use(express.urlencoded({extended: true}));

    // =========================================================================
    // COOKIE PARSER ===========================================================
    // =========================================================================
    app.use(cookieParser());

    // =========================================================================
    // HANDLEBARS VIEW ENGINE ==================================================
    // =========================================================================
    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');

    // =========================================================================
    // VERIFY BEARER TOKEN =====================================================
    // =========================================================================
    function verifyToken(req, res, next) {
        let token = req.headers['x-access-token'] || 
            req.headers['authorization'];

        if (!token)
            token = req.cookies.Authorization;

        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }

            jwt.verify(token, SECRET, (err, decoded) => {
                if (err) {
                    /*
                    return res.json({
                        success: false,
                        message: 'Token is not valid'
                    });
                    */
                    next();
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            /*
            return res.json({
                success: false,
                message: 'Auth token is not supplied'
            });
            */
            next();
        }
    };

    function registerMiddleware (req, res, next) {

        const name = req.body.name;
        const surname = req.body.surname;
        const email = req.body.email;
        const password = req.body.password;
        const passwordCheck = req.body.passwordCheck;

        if (!name || !surname){
            return;
        }

        if (!email){
            return;
        }

        if (!password){
            return;
        }

        if (password !== passwordCheck){
            return;
        }

        Uporabnik.findOne({
            where: {
                id: uuidv5(email, NAMESPACE_UUID).toString()
            }
        }).then(uporabnik => {
            if (uporabnik){
                return res.redirect('/login');
            } else {
                let salt = uuidv4();
                Uporabnik.create(
                    {
                        id : uuidv5(email, NAMESPACE_UUID).toString(),
                        gesloSalt: salt.toString(),
                        gesloHash: uuidv5(password, salt).toString(),
                        ime: name,
                        priimek: surname,
                        email: email
                    }
                ).then(uporabnik => {
                    let token = jwt.sign(
                        { email: email }, SECRET, { expiresIn: '24h' }
                    );
                    db.sync();
                    res.cookie('Authorization', 'Bearer ' + token);
                    res.setHeader('Authorization', 'Bearer ' + token);
                    return res.redirect('/');
                })
            }
        });

    }

    function loginMiddleware (req, res, next) {
        const email = req.body.email;
        const password = req.body.password;
        if (email && password) {
            Uporabnik.findOne({
                where: {
                    id: uuidv5(email, NAMESPACE_UUID).toString()
                }
            }).then(uporabnik => {
                if (uporabnik){
                    let data = uporabnik.get({ plain: true });
                    let genHash = uuidv5(password, data.gesloSalt);
                    if (data.gesloHash !== genHash){
                        return res.redirect('/login');
                    } else {
                        let token = jwt.sign(
                            { email: email }, SECRET, { expiresIn: '24h' }
                        );
                        res.cookie('Authorization', 'Bearer ' + token);
                        res.setHeader('Authorization', 'Bearer ' + token);
                        return res.redirect('/');
                    }
                } else {
                    return res.redirect('/login');
                }
            });
        } else {
            return res.redirect('/login');
        }
    }

    function logoutMiddleware (req, res, next) {
        if (req.decoded)
            res.clearCookie('Authorization');
        return res.redirect('/login');
    }

    return {
        verifyToken: verifyToken,
        registerMiddleware: registerMiddleware,
        loginMiddleware: loginMiddleware,
        logoutMiddleware: logoutMiddleware
    };
};