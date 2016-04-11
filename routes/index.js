//TODOs
//  Remove the redundancy in login and creating users
//    The logic is basically duplicated
// TODO MAJOR TODO
//    Update all the logic to reflect the new database configuration
//    That is a lot of stuff

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var express = require('express');
var mongo = require('mongodb');
var fs = require('fs');
var Grid = require('gridfs-stream');
var multer = require('multer');
// var upload = multer({ dest: 'tmp/' }); //TODO pUPLOADS
var upload = multer({ dest: 'public/img/' });
var bcrypt = require('bcrypt');
var request = require('request');

var Users = require('../models/users');
var Foods = require('../models/foods');
var Purchases = require('../models/purchases');
var populate_script = require('../utils/populate_db');

var app = express();

app.use(cookieParser());
app.use(expressSession({secret:'seekraets'}));
app.use(bodyParser());

mongoose.connect('mongodb://localhost/ThriftyFood', function (error) {
  if (error) {
      console.log(error);
  }
  else{
    console.log('Successfully Connected');
  }
});

var conn = mongoose.connection
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);

//populate db
//TODO still needed?
populate_script();

/* GET home page. */
app.get('/', function(req, res) {
  // TODO filter by pickup date... don't want to display old items
  Foods.find(function(err,foods){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    else{
      var sellerIds = [];
      for (var f in foods){
        sellerIds.push(foods[f].sellerId);
      }

      // TODO test
      Users.aggregate([{$match: {_id: {$in: sellerIds}}},
                        {$unwind: "$reviews"},
                        {$group: {_id:"$_id", userName:{$first: "$userName"},
                                   avgRating: {$avg: "$reviews.rating"}}}] , function(err2,seller){

        if (err2) {
          console.log(err2);
          res.status(500).send(err2);
        }

        res.render('index', {
          title: 'Vesta',
          script: 'index.js',
          foods: foods,
          seller: seller,
          session: req.session
        });
      });
    }
  });
});

app.get('/landing', function(req, res){
  res.render('landing', {title: 'Food App', script: 'landing.js'})
});

app.get('/maps', function(req, res){
  res.render('maps', {title: 'Food', script: 'maps.js'})
});

module.exports = app;
