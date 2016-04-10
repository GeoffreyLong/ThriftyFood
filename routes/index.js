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

populate_script();

app.get('/landing', function(req, res){
  res.render('landing', {title: 'Food App', script: 'landing.js'})
})

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

        if (err2){
          console.log(err2);
          res.status(500).send(err2);
        }
        res.render('index', { title: 'Vesta', script: 'index.js',
                              foods:foods, seller:seller, curUserName: req.session.userName,
                              curUserType: req.session.type, curUserId: req.session.userId});
      });
    }
  });
});

app.get('/food/new', function(req, res){
  res.render('new_food', {script: 'new_food.js', curUserName: req.session.userName,
                        curUserType: req.session.type, curUserId: req.session.userId, script: 'new_food.js'});
})

app.post('/food/submit', upload.any('test'), function(req, res){
  //console.log(req.body);
  //console.log(req.files);

  // will get the cover photo info
  var dateTokens = req.body.date.split("-");
  var startTokens = req.body.startTime.split(":");
  var endTokens = req.body.endTime.split(":");
  var startDate = new Date(dateTokens[0], dateTokens[1], dateTokens[2],
    endTokens[0], endTokens[1], 0, 0);
  var endDate = new Date(dateTokens[0], dateTokens[1], dateTokens[2],
    startTokens[0], startTokens[1], 0, 0);

  var cPhoto = req.files[0];
  //var cPhotoName = cPhoto.path + "." + cPhoto.mimetype.split("/")[1];
  var cPhotoName = "img/" + cPhoto.filename;

  //TODO pUPLOADS for now use the simple filesystem?
  // Adapted from http://excellencenodejsblog.com/gridfs-using-mongoose-nodejs/
  // Alternatively could do http://howtonode.org/really-simple-file-uploads?
  // The name of the file
  //var writestream = gfs.createWriteStream({filename: req.files[0].filename});
  // The file that is written
  //fs.createReadStream(req.files[0].path).pipe(writestream);

  //writestream.on('close', function (file) {
  //  console.log(file.filename + ' written To DB');
    new Foods({
      portionsAvailable: req.body.portions,
      timeRange: {start: startDate, end: endDate},
      name: req.body.name,
  //    images: [file._id],        //TODO pUPLOADS
      images: [cPhotoName],        // For now we will use the simple way
                                   // idk if the other way is even better
      description: req.body.description,
      portionDefinition: req.body.portionDef,
      address: {
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        street: req.body.street,
        number: req.body.number,
      },
      sellerId: req.session.userId,
    }).save(function(err,saved){
      if (err){
        console.log(err);
        res.status(500).send(err);
      }
      res.redirect("/");
    });
  //});

})

//new user page
app.get('/users/new_user', function(req, res){
  res.render('new_user', {script: 'new_user.js'});
});

app.get('/users/new_seller/connected', function(req, res) {
  //TODO use stripe auth-id in headers and redirect to create-account form
  //TODO error handling
  var scope = req.query.scope;
  var stripeAuthenticationCode = req.query.code;
  var userId = req.session.userId;

  console.log(JSON.stringify(scope));
  console.log(JSON.stringify(stripeAuthenticationCode));
  console.log(JSON.stringify(req.session, null, 2));
  console.log(JSON.stringify(req.session.userId, null, 2));

  request.post({
    url: "https://connect.stripe.com/oauth/token",
    form: {
      grant_type: "authorization_code",
      code: stripeAuthenticationCode,
      client_secret: "sk_test_an3Nezne8XguJAefiBJgNV63"
    }, function (err, response, body) {
      //FIXME no response is being received
      //stripe auth failure
      if (err) {
        //TODO redirect to fail page
        res.redirect('/');
      }

      //stripe auth success, update account info, redirect to homepage
      else {
        console.log(body);
        var oauthToken = JSON.parse(body).access_token;
        Users.findByIdAndUpdate(userId, {
          $set: {
            'user.seller.stripeId': oauthToken
          }
        }, function (err, user) {
          res.redirect('/');
        });
      }
    }
  });
});


// TODO handle mismatching passwords in javascript file
// This will handle both the user and seller additions
// If the req.body has a 'usersubmit' then it is a user
// In this case the type for the db and usage will be user, else it is seller
app.post('/users/submit', function(req, res){
  console.log(req.body);
  console.log(JSON.stringify(req.body));
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      if (err){
        console.log(err);
        res.status(500).send(err);
      }

      var type = 'user';
      if ('isSeller' in req.body){
        type = 'seller';
        console.log("WOWOW");
      }

      new Users({
        userName: req.body.username,
        password: hash,
        type: type,
      }).save(function(err,saved){
        if (err){
          console.log(err);
          res.status(500).send(err);
        }
        req.session.userId = saved._id;
        req.session.userName = saved.userName;
        if ('usersubmit' in req.body){
          req.session.type = type;
        }
        else{
          req.session.type = type;
        }
        res.redirect("/");
      });
    });
  });
});

app.get('/seller/:id', function(req,res){
  var sellerId = req.params.sellerId;


  Users.findById(sellerId, function(err,seller){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    else{
      // Any more information needed?
      res.render('seller', { seller:seller });
    }
  });
});

app.get('/users/login', function(req,res){
  res.render('login');
});


// TODO this needs work... better error handling, etc
// Consider using passport
app.post('/users/login', function(req,res){

  Users.find({'userName':req.body.username}, function(err, user){
    if (err) res.status(500).send(err);
    if (user.length != 0){
      var userId = user[0]._id;
      var userName = user[0].userName;

      bcrypt.compare(req.body.password, user[0].password, function(herr, hres) {
        if (herr) res.status(500).send(herr);
        if (hres){
          req.session.userId = userId;
          req.session.userName = userName;
          req.session.type = 'user';
          res.redirect('/');
        }
        else{
          res.redirect('/users/login');
        }
      });
    }
    else{
      Sellers.find({'userName':req.body.username}, function(err2, seller){
        if (err2) res.status(500).send(err2);
        if (seller.length != 0){
          var userId = seller[0]._id;
          var userName = seller[0].userName;
          bcrypt.compare(req.body.password, seller[0].password, function(herr2, hres2) {
            console.log();
            if (herr2) res.status(500).send(herr);
            if (hres2){
              req.session.userId = userId;
              req.session.userName = userName;
              req.session.type = 'seller';
              res.redirect('/');
            }
            else{
              res.redirect('/users/login');
            }
          });
        }
        else{
          //TODO should give an error message
          res.redirect('/users/login');
        }
      });
    }
  })
});

app.get('/users/logout', function(req,res){
  // TODO not sure if this is the best way to handle this
  // Could lose information such as shopping carts?
  req.session.destroy(function(err){
    if (err) res.status(500).send(err);
    res.redirect('/');
  });
});

app.get('/maps', function(req, res){
  res.render('maps', {title: 'Food', script: 'maps.js'})
})

module.exports = app;
