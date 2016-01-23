var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/ThrifyFood', function (error) {
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
    address: String
});

//var Game = mongoose.model('games', GameSchema);
var Game = mongoose.model('test', FoodSchema);

var express = require('express');
var app = express();

// Temporary object used for testing
var foodTemp = {
  portionsAvailable: 10,
  timeRange: {start: null, end: null},
  name: "Good Food",
  images: [null],
  description: "I heard this is good",
  portionDefinition: "Pooptons of good food",
  address: "We should probably make this an object later",
};

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Food App', script: '/javascripts/index.js', 
                        food: foodTemp});
});


app.get('/play/:gameNumber', function(req, res){
  var gameNumber = req.params.gameNumber;
  console.log("Game Number = " + gameNumber);

  //TODO need to check if user is authorized to play level
  /*
  Game.find({gameNumber: req.body.gameNumber}, function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }

    // TODO next
  });
  */

  res.render('play', { game: gameTemp, script: '/javascripts/play.js' });
});

module.exports = app;

