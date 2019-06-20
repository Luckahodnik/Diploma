const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'/www/index.html'))
})
app.use('/css', express.static('www/css'));
app.use('/img', express.static('www/img'));
app.use('/js',  express.static('www/js'));
app.use('/vendor',  express.static('www/vendor'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));