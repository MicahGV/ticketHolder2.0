
var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var PouchDB = require('pouchdb');

var db = new PouchDB('http://localhost:5984/templates');

var app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

db.info().then(function(info) {
    console.log(info);
});