var Users = require('../models/users');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var request = require('request');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

//login page
router.get('/login', function(req,res){
  res.render('login');
});

//new user page
router.get('/new_user', function(req, res){
  res.render('new_user', {script: 'new_user.js'});
});

// TODO this needs work... better error handling, etc
// Consider using passport
router.post('/login', function(req,res){

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

//logout page
router.get('/logout', function(req, res){
  // TODO not sure if this is the best way to handle this
  // Could lose information such as shopping carts?
  req.session.destroy(function(err){
    if (err) res.status(500).send(err);
    res.redirect('/');
  });
});

//stripe oauth callback
router.get('/new_seller/connected', function(req, res) {
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
router.post('/submit', function(req, res){
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

//FIXME wrong prefix
router.get('/seller/:id', function(req,res){
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


module.exports = router;
