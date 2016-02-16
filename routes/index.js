//TODOs
//  Remove the redundancy in login and creating users
//    The logic is basically duplicated

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
var Schema = mongoose.Schema;

var FoodSchema = new Schema({
    portionsAvailable: Number,
    timeRange: {start: Date, end: Date},
    name: String,
    images: [String],
    description: String,
    portionDefinition: String,
    price: Number,
    address: {
      country: String,
      state: String,
      city: String,
      street: String,
      number: String, // since you could probably have like 114A
      // TODO apt #?
    },
    sellerId: mongoose.Schema.Types.ObjectId,
});
var UserSchema = new Schema({
    userName: String,
    password: String,
});
var SellerSchema = new Schema({
    userName: String,
    password: String,
    currentFoodItems: [mongoose.Schema.Types.ObjectId], // necessary?
    pastFoodItems: [mongoose.Schema.Types.ObjectId],    // necessary?
    reviews: [{
      rating: Number,
      comment: String,
      reviewerId: mongoose.Schema.Types.ObjectId,
    }],
});
var PurchaseSchema = new Schema({
    foodId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    sellerId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
});


var Foods = mongoose.model('foods', FoodSchema);
var Users = mongoose.model('users', UserSchema);
var Sellers = mongoose.model('sellers', SellerSchema);
var Purchases = mongoose.model('purchases', PurchaseSchema);


// Temporary code for seeding
Foods.find().count(function(err, count){

  if (err){
    console.log(err)
  }
  else if (count == 0){
    var userID1 = null;
    var userID2 = null;
    var userID3 = null;
    var sellerID1 = null;
    var sellerID2 = null;
    var foodID1 = null;
    var foodID2 = null;
    var foodID3 = null;


    new Users({
      userName: "User_One",
      password: bcrypt.hashSync("User_One", bcrypt.genSaltSync(10)),
    }).save(function(err,saved){
      if (err) console.log(err);
      userID1 = saved._id;

      new Users({
        userName: "User_Two",
        password: bcrypt.hashSync("User_Two", bcrypt.genSaltSync(10)),
      }).save(function(err,saved){
        if (err) console.log(err);
        userID2 = saved._id;

        new Users({
          userName: "Bobby_Tables",
          password: bcrypt.hashSync("hello", bcrypt.genSaltSync(10)),
        }).save(function(err,saved){
          if (err) console.log(err);
          userID3 = saved._id;

          new Sellers({
            userName: "Seller_One",
            password: bcrypt.hashSync("Seller_One", bcrypt.genSaltSync(10)),
            currentFoodItems: [],
            pastFoodItems: [],
            reviews: [{
              rating: 1,
              comment: "I don't like her cooking... I don't care if she's my mom, she gets one star",
              reviewerId: userID3,
            },{
              rating: 2,
              comment: "Good kid, but Maad City",
              reviewerId: userID1,
            },],
          }).save(function(err,saved){
            if (err) console.log(err);
            sellerID1 = saved._id;

            new Foods({
              portionsAvailable: 10,
              timeRange: {start: null, end: null},
              name: "Fish Salad Spectaculare",
              images: ['img/food1.jpg'],
              description: "A flaky slice of heaven that simply melts in your mouth.",
              portionDefinition: "6oz Fish, 6oz salad",
              price: 7.80,
              address: {
                country: "Canada",
                state: "QC",
                city: "Montreal",
                street: "Durocher",
                number: 3625, // since you could probably have like 114A
              },
              sellerId: sellerID1,
            }).save(function(err,saved){
              if (err) console.log(err);
              foodID1 = saved._id;

              new Foods({
                portionsAvailable: 24,
                timeRange: {start: null, end: null},
                name: "Pancakes",
                images: ['img/food2.jpg'],
                description: "Buttery deliciousness; rated best in MTL (syrup optional)",
                portionDefinition: "4 pancakes",
                price: 5.00,
                address: {
                  country: "Canada",
                  state: "QC",
                  city: "Montreal",
                  street: "Durocher",
                  number: 3515, // since you could probably have like 114A
                },
                sellerId: sellerID1,
              }).save(function(err,saved){
                if (err) console.log(err);
                foodID2 = saved._id;
                new Foods({
                  portionsAvailable: 1,
                  timeRange: {start: null, end: null},
                  name: "Ambrosia",
                  images: ['img/food3.jpg'],
                  description: "It's got bits of real panther in it",
                  portionDefinition: "A dash",
                  price: 10000.00,
                  address: {
                    country: "Canada",
                    state: "QC",
                    city: "Montreal",
                    street: "Aylmer",
                    number: 2500, // since you could probably have like 114A
                  },
                  sellerId: sellerID1,
                }).save(function(err,saved){
                  if (err) console.log(err);
                  foodID3 = saved._id;
                  new Purchases({
                    foodId: foodID1,
                    userId: userID1,
                    sellerId: sellerID1,
                    quantity: 5,
                  }).save(function(err,saved){
                    if (err) console.log(err);
                    // console.log(JSON.stringify(saved));
                    new Purchases({
                      foodId: foodID1,
                      userId: userID3,
                      sellerId: sellerID1,
                      quantity: 1,
                    }).save(function(err,saved){
                      if (err) console.log(err);
                      // console.log(JSON.stringify(saved));
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }
});

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
      Sellers.aggregate([{$match: {_id: {$in: sellerIds}}},
                        {$unwind: "$reviews"},
                        {$group: {_id:"$_id", userName:{$first: "$userName"},
                                   avgRating: {$avg: "$reviews.rating"}}}] , function(err2,seller){

        if (err2){
          console.log(err2);
          res.status(500).send(err2);
        }
        res.render('index', { title: 'Food App', script: 'index.js',
                              foods:foods, seller:seller, curUserName: req.session.userName,
                              curUserType: req.session.type, curUserId: req.session.userId});
      });
    }
  });
});

app.get('/food/new', function(req, res){
  res.render('newfood', {script: 'newfood.js', curUserName: req.session.userName,
                        curUserType: req.session.type, curUserId: req.session.userId, script: 'newfood.js'});
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

app.get('/users/new', function(req,res){
  res.render('newuser', {script: 'newuser.js'})
});


// TODO handle mismatching passwords in javascript file
app.post('/users/submit', function(req, res){
  console.log(req.body);
  console.log(JSON.stringify(req.body));
  if ('usersubmit' in req.body){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err){
            console.log(err);
            res.status(500).send(err);
          }

          new Users({
            userName: req.body.username,
            password: hash,
          }).save(function(err,saved){
            if (err){
              console.log(err);
              res.status(500).send(err);
            }
            req.session.userId = saved._id;
            req.session.userName = saved.userName;
            req.session.type = 'user';
            res.redirect("/");
          });
        });
    });
  }
  else{
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err){
            console.log(err);
            res.status(500).send(err);
          }

          new Sellers({
            userName: req.body.username,
            password: hash,
          }).save(function(err,saved){
            if (err){
              console.log(err);
              res.status(500).send(err);
            }
            req.session.userId = saved._id;
            req.session.userName = saved.userName;
            req.session.type = 'seller';
            res.redirect("/");
          });
        });
    });
  }
});

app.get('/seller/:id', function(req,res){
  var sellerId = req.params.sellerId;


  Sellers.findById(sellerId, function(err,seller){
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
