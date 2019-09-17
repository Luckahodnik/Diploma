const fs = require('fs');
const util = require('util');
const path = require('path');
const Handlebars = require('handlebars');
const stat = util.promisify(fs.stat);

module.exports = function(ctx) {

    console.log(ctx.opts.platforms);
    // Make sure android platform is part of build
    if (!ctx.opts.platforms.includes('android')) return;

    const wwwRoot = path.join(ctx.opts.projectRoot, 'platforms/android/app/src/main/assets/www');
    const defaultRoot = path.join(ctx.opts.projectRoot, 'www');

    const loginPath = path.join(defaultRoot, 'login.html');
    const registerPath = path.join(defaultRoot, 'register.html');
    const vecPath = path.join(defaultRoot, 'vec.html');
    const indexPath = path.join(defaultRoot, 'index.html');
    const nfcPath = path.join(defaultRoot, 'nfc.html');


    const loginWWWPath = path.join(wwwRoot, 'login.html');
    const registerWWWPath = path.join(wwwRoot, 'register.html');
    const vecWWWPath = path.join(wwwRoot, 'vec.html');
    const indexWWWPath = path.join(wwwRoot, 'index.html');
    const nfcWWWPath = path.join(wwwRoot, 'nfc.html');

    let data = {
        serverIP : "http://10.42.0.1:3000",
        loginPage : "login",
        registerPage : "register",
        indexPage : "index",
        vecPage : "vec",
        nfcPage : "nfc",
        extension : ".html",
        logoutPath : "login.html",
        logoutMethod : "GET"
    }

    console.log("LOADING login.html");
    loginFile = fs.readFileSync(loginPath, "utf8");
    let loginTemplate = Handlebars.compile(loginFile);
    let newLoginFile = loginTemplate(data);
    fs.writeFileSync(loginWWWPath, newLoginFile);

    console.log("LOADING register.html");
    registerFile = fs.readFileSync(registerPath, "utf8");
    let registerTemplate = Handlebars.compile(registerFile);
    let newRegisterFile = registerTemplate(data);
    fs.writeFileSync(registerWWWPath, newRegisterFile);

    console.log("LOADING vec.html");
    vecFile = fs.readFileSync(vecPath, "utf8");
    let vecTemplate = Handlebars.compile(vecFile);
    let newVecFile = vecTemplate(data);
    fs.writeFileSync(vecWWWPath, newVecFile);

    console.log("LOADING index.html");
    indexFile = fs.readFileSync(indexPath, "utf8");
    let indexTemplate = Handlebars.compile(indexFile);
    let newIndexFile = indexTemplate(data);
    fs.writeFileSync(indexWWWPath, newIndexFile);

    console.log("LOADING nfc.html");
    nfcFile = fs.readFileSync(nfcPath, "utf8");
    let nfcTemplate = Handlebars.compile(nfcFile);
    let newNfcFile = nfcTemplate(data);
    fs.writeFileSync(nfcWWWPath, newNfcFile);

    return stat(wwwRoot).then(stats => {
      console.log(`Size of ${wwwRoot} is ${stats.size} bytes`);
    });
};
