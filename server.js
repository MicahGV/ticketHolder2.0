
var path = require('path');
var PouchDB = require('pouchdb');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.use('/api/couchdb', repStream('http://localhost:5984/templates'));

console.log('what');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

/* GET home page. */
app.get('/', function(req, res, next) {
    //Path to your main file
  res.status(200).sendFile(path.join(__dirname+'/public/index.html')); 
});

app.listen(3000, () => console.log('listening on port 3000!'));