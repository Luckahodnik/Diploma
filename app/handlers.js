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

// =============================================================================
// DOM parser ==================================================================
// =============================================================================
let DOMParser = require('xmldom').DOMParser;

// =============================================================================
// XPath processing ============================================================
// =============================================================================
let XPath = require('xpath');

// =============================================================================
// XML processing ==============================================================
// =============================================================================
let xmlutils = require('./utils.js')(DOMParser, XPath);


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
                    if(!req.decoded){
                        res.status(400);
                        res.setHeader("Content-Type", "text/plain");
                        return res.send("User is not logged in");
                    }
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
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
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No name or surname provided");
        }

        if (!email){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No email provided");
        }

        if (!password){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No password provided");
        }

        if (password !== passwordCheck){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("Please match passwords");
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

        if (!email){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No email provided");
        }

        if (!password){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No password provided");
        }

        Uporabnik.findOne({
            where: {
                id: uuidv5(email, NAMESPACE_UUID).toString()
            }
        }).then(uporabnik => {
            if (uporabnik){
                let data = uporabnik.get({ plain: true });
                let genHash = uuidv5(password, data.gesloSalt);
                if (data.gesloHash !== genHash){
                    res.status(400);
                    res.setHeader("Content-Type", "text/plain");
                    return res.send("Incorrect password");
                } else {
                    let token = jwt.sign(
                        { email: email }, SECRET, { expiresIn: '24h' }
                    );
                    res.cookie('Authorization', 'Bearer ' + token);
                    res.setHeader('Authorization', 'Bearer ' + token);
                    return res.redirect('/');
                }
            } else {
                res.status(400);
                res.setHeader("Content-Type", "text/plain");
                return res.send("User with given email address does not exist");
            }
        });
    }

    function logoutMiddleware (req, res, next) {
        if (req.decoded)
            res.clearCookie('Authorization');
        return res.redirect('/login');
    }

    function retrieveXMLDocument(req, res, next) {
        if(!req.decoded){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("User not logged in");
        }

        if(!req.params.id){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No file id was given");
        }

        let uporabnikId = uuidv5(req.decoded.email, NAMESPACE_UUID);
        let xmlPath = path.join(__dirname, 'data', 'users', uporabnikId.toString(), req.params.id);
        
        Racun.findOne({ raw: true, where: { uporabnikId: uporabnikId, idRacuna : req.params.id } })
        .then( (racun) => {
            if(racun){
                if (fs.existsSync(xmlPath)){
                    res.status(200);
                    res.setHeader("Content-Type", "application/octet-stream");
                    res.setHeader("Content-Disposition", "attachment; filename=" + racun.XMLName);
                    return fs.createReadStream(xmlPath).pipe(res);
                } else {
                    res.status(400);
                    res.setHeader("Content-Type", "text/plain");
                    return res.send("Document not found");
                }
            } else {
                res.status(400);
                res.setHeader("Content-Type", "text/plain");
                return res.send("Resource not found");
            }
        });

    }

    function retrieveXML(req, res, next) {
        if(!req.decoded){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("User not logged in");
        }
        let uporabnikId = uuidv5(req.decoded.email, NAMESPACE_UUID);

        res.setHeader('Content-Type', 'application/json');
        Racun.findAll({ raw: true, where: { uporabnikId: uporabnikId } })
        .then( (racuni) => {
            res.send(racuni);
        });
    }

    function persistData(req, res, next) {

        console.log(req.body);

        if(!req.decoded){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("User not logged in");
        }

        if(!req.body){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No fields in request");
        }

        if(!req.body.ime){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("Field ime is empty");
        }
        
        if(!req.body.znesek){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("Field znesek is empty");
        }

        if(!req.body.datum){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("Field datum is empty");
        }

        if(!req.body.ddv){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("Field ddv is empty");
        }

        let uporabnikId = uuidv5(req.decoded.email, NAMESPACE_UUID);
        let idRacuna = uuidv4();

        Racun.create(
            {
                uporabnikId : uporabnikId,
                idRacuna : idRacuna,
                izdajateljRacuna: req.body.ime,
                znesek: req.body.znesek,
                datum: req.body.datum,
                ddv: req.body.ddv,
                XMLName: ""
            }
        ).then(racun => {
            db.sync();
            res.setHeader('Content-Type', 'application/json');
            res.status(201);
            return res.send(racun);
        });
    }

    function persistXML(req, res, next) {
        if(!req.decoded){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("User not logged in");
        }

        if(req.files && 'raw_xml_data' in req.files){
            let racunData = xmlutils.processXML( req.files['raw_xml_data'].data.toString() );
            let uporabnikId = uuidv5(req.decoded.email, NAMESPACE_UUID);
            let idRacuna = uuidv4();
            let userPath = path.join(__dirname, 'data', 'users', uporabnikId.toString());
            let dataPath = path.join(userPath, idRacuna.toString());

            if (!fs.existsSync(userPath)) {
                fs.mkdirSync(userPath);
            }
            fs.writeFileSync(dataPath, req.files['raw_xml_data'].data.toString(), 'utf-8');

            Racun.create(
                {
                    uporabnikId : uporabnikId,
                    idRacuna : idRacuna,
                    izdajateljRacuna: racunData.ime,
                    znesek: racunData.znesek,
                    datum: racunData.datum,
                    ddv: racunData.ddv,
                    XMLName: req.files['raw_xml_data'].name
                }
            ).then(racun => {
                db.sync();
                res.setHeader('Content-Type', 'application/json');
                res.status(201);
                return res.send(racun);
            });
        } else {
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No file appended to request");
        }
    }

    function deleteXML(req, res, next) {
        if(!req.decoded){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("User not logged in");
        }

        if(!req.params.id){
            res.status(400);
            res.setHeader("Content-Type", "text/plain");
            return res.send("No file id was given");
        }

        let uporabnikId = uuidv5(req.decoded.email, NAMESPACE_UUID);

        Racun.findOne({ where: { uporabnikId: uporabnikId, idRacuna : req.params.id } })
        .then( (racun) => {
            if(racun){
                racun.destroy();
                res.status(204);
                return res.send();
            } else {
                res.status(400);
                res.setHeader("Content-Type", "text/plain");
                return res.send("XML document entry not found");
            }
        });
    }

    return {
        verifyToken: verifyToken,
        registerMiddleware: registerMiddleware,
        loginMiddleware: loginMiddleware,
        logoutMiddleware: logoutMiddleware,
        persistData: persistData,
        persistXML: persistXML,
        retrieveXML: retrieveXML,
        retrieveXMLDocument: retrieveXMLDocument,
        deleteXML: deleteXML
    };
};