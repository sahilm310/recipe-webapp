var express = require ('express')
var bodyParser= require ('body-parser')
var session = require ('express-session')
var path = require('path');
var validator = require ('express-validator');
const expressSanitizer = require('express-sanitizer');
//const mysql = require('mysql');
const app = express()
const port = 8000
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/mybookshopdb";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();                                                                                                                                              
});
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'somerandomstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use(expressSanitizer());
// new code added to your Express web server
require('./routes/main')(app);
app.set('views',__dirname + '/views');
//app.set('view engine', 'ejs');
app.set('view engine', 'pug')
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'views')));
//////////////
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
