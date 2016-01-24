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
    currentFoodItems: [mongoose.Schema.Types.ObjectId],
    pastFoodItems: [mongoose.Schema.Types.ObjectId],  
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
    new Foods({
      portionsAvailable: 10,
      timeRange: {start: null, end: null},
      name: "Bad Food",
      images: [null],
      description: "I maed dis and it sux",
      portionDefinition: "You get nothing and like it",
      address: "This is an address",
      sellerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });
    
    new Foods({
      portionsAvailable: 24,
      timeRange: {start: null, end: null},
      name: "Good Food",
      images: [null],
      description: "I heard this is good",
      portionDefinition: "Pooptons of good food",
      address: {
        
      },
      sellerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });

    new Foods({
      portionsAvailable: 1,
      timeRange: {start: null, end: null},
      name: "Ambrosia",
      images: [null],
      description: "It's got bits of real panther in it",
      portionDefinition: "A dash",
      address: "Mount Olympus",
      sellerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });

    new Users({ 
      userName: "User_One",
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });
    new Users({ 
      userName: "User_Two",
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });
    new Users({ 
      userName: "Bobby_Tables",
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });

    new Sellers({
      userName: "Seller_One",
      currentFoodItems: [mongoose.Types.ObjectId("56a3ff94190f46312a882f6f")],
      pastFoodItems: [mongoose.Types.ObjectId("56a3ffbb2619fd4a2a5a8e5a")],  
      reviews: [{
        rating: 1,
        comment: "I don't like her cooking... I don't care if she's my mom, she gets one star",
        reviewerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d45"),
      },{
        rating: 2,
        comment: "Good kid, but Maad City",
        reviewerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      },],
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });
    
    new Purchases({
      foodId:  mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      userId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      sellerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      quantity: 5,
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });
    new Purchases({
      foodId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      userId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      sellerId: mongoose.Types.ObjectId("56a4244bd496bd063c807d46"),
      quantity: 1,
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
    });
  }
});

app.get('/landing', function(req, res){
  res.render('landing', {title: 'Food App', script: 'javascripts/landing.js'})
})

// Saving the id of the user will make it easier to do things
// Probably not the best practice, but performancewise it should be fine
// The id doesn't change often and we can just save it when the user logs on
// For now we will use this dummy value
curId = null; 

/* GET home page. */
app.get('/', function(req, res) {
  console.log(req.session.id);
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
                                foods: foods, seller:seller});
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
    sellerId: curId,
  }).save(function(err,saved){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    res.redirect("/");
  });
})

app.get('/users/new', function(req,res){
  res.render('newuser');
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
      req.session.id = saved._id;
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
      req.session.id = saved._id;
      res.redirect("/");
    });
  }
});

module.exports = app;

