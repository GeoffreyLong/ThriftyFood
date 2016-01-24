var mongoose = require('mongoose');
var bodyParser = require('body-parser'); 
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var express = require('express');
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

//TODO Add creation schema (i.e. when person first plays game, need maps to load)
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
});
var SellerSchema = new Schema({
    userName: String,
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
    }).save(function(err,saved){
      if (err) console.log(err);
      userID1 = saved._id;
      
      new Users({ 
        userName: "User_Two",
      }).save(function(err,saved){
        if (err) console.log(err);
        userID2 = saved._id;
        
        new Users({ 
          userName: "Bobby_Tables",
        }).save(function(err,saved){
          if (err) console.log(err);
          userID3 = saved._id;

          new Sellers({
            userName: "Seller_One",
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
              name: "Bad Food",
              images: [null],
              description: "I maed dis and it sux",
              portionDefinition: "You get nothing and like it",
              price: 7.80,
              address: {
                country: Canada,
                state: QC,
                city: Montreal,
                street: Durocher,
                number: 3625, // since you could probably have like 114A
              },
              sellerId: sellerID1,
            }).save(function(err,saved){
              if (err) console.log(err);
              foodID1 = saved._id;
              
              new Foods({
                portionsAvailable: 24,
                timeRange: {start: null, end: null},
                name: "Good Food",
                images: [null],
                description: "I heard this is good",
                portionDefinition: "Pooptons of good food",
                price: 5.00,
                address: {
                  country: Canada,
                  state: QC,
                  city: Montreal,
                  street: Durocher,
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
                  images: [null],
                  description: "It's got bits of real panther in it",
                  portionDefinition: "A dash",
                  price: 10000.00,
                  address: {
                    country: Canada,
                    state: QC,
                    city: Montreal,
                    street: Aylmer,
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
  res.render('landing', {title: 'Food App', script: 'javascripts/landing.js'})
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
      console.log(foods);
      
      Sellers.findById(foods.sellerId, function(err2,seller){
        if (err2){
          console.log(err2);
          res.status(500).send(err2);
        }  
        else{
          console.log(seller);
          res.render('index', { title: 'Food App', script: '/javascripts/index.js', 
                                foods:foods, seller:seller, curUserName: req.session.userName,
                                curUserType: req.session.type});
        }
      });
    }
  });
});

app.get('/food/new', function(req, res){
  res.render('newfood');
})

app.post('/food/submit', function(req, res){
  console.log(req.body);

  var dateTokens = req.body.date.split("-");
  var startTokens = req.body.startTime.split(":");
  var endTokens = req.body.endTime.split(":");
  var startDate = new Date(dateTokens[0], dateTokens[1], dateTokens[2],
    endTokens[0], endTokens[1], 0, 0);
  var endDate = new Date(dateTokens[0], dateTokens[1], dateTokens[2],
    startTokens[0], startTokens[1], 0, 0);
    
  new Foods({
    portionsAvailable: req.body.portions,
    timeRange: {start: startDate, end: endDate},
    name: req.body.name,
    images: [null],
    description: req.body.description,
    portionDefinition: req.body.portionDef,
    address: {
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      street: req.body.street,
      number: req.body.number,
    },
    sellerId: req.session.id,
  }).save(function(err,saved){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    res.redirect("/");
  });
})

app.get('/users/new', function(req,res){
  res.render('newuser', {script: '../javascripts/newuser.js'})
});


// TODO handle mismatching passwords in javascript file
app.post('/users/submit', function(req, res){
  console.log(req.body)
  if (req.body.usersubmit){
    new Sellers({
      userName: req.body.username,
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
  }
  else{
    new Users({
      userName: req.body.username,
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
  }
});

module.exports = app;

