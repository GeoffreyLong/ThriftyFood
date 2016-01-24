var mongoose = require('mongoose');

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
    address: String,
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

var express = require('express');
var app = express();

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
      address: "We should probably make this an object later",
    }).save(function(err,saved){
      if (err) console.log(err);
      // console.log(JSON.stringify(saved));
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
      res.render('index', { title: 'Food App', script: '/javascripts/index.js', 
                            foods: foods});
    }
  });
});


module.exports = app;

