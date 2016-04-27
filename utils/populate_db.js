var Foods = require('../models/foods');
var Users = require('../models/users');
var Purchases = require('../models/purchases');
var bcrypt = require('bcrypt');

// Temporary code for seeding
var exec = function () {
  Foods.find().count(function(err, count){

    if (err){
      console.log(err)
    }
    else if (count == 0){
      var userID1 = null;
      var userID2 = null;
      var userID3 = null;
      var foodID1 = null;
      var foodID2 = null;
      var foodID3 = null;


      new Users({
        userName: "Buyer_One",
        password: bcrypt.hashSync("Buyer_One", bcrypt.genSaltSync(10)),
        email: "user_one@domain.com",
        type: "buyer",
      }).save(function(err,saved){
        if (err) console.log(err);
        userID1 = saved._id;

        new Users({
          userName: "Buyer_Two",
          password: bcrypt.hashSync("asdfasdf", bcrypt.genSaltSync(10)),
          email: "user_two@domain.com",
          type: "buyer",
        }).save(function(err,saved){
          if (err) console.log(err);
          userID2 = saved._id;

          new Users({
            userName: "Bobby_Tables",
            password: bcrypt.hashSync("hello", bcrypt.genSaltSync(10)),
            email: "bobby@domain.com",
            type: "seller",
            seller: {
              currentFoodItems: [],
              pastFoodItems: [],
            }
          }).save(function(err,saved){
            if (err) console.log(err);
            seller_Id1 = saved._id;

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
              reviews: [{
                rating: 1,
                comment: "I don't like her cooking... I don't care if she's my mom, she gets one star",
                reviewerId: userID2,
              },{
                rating: 2,
                comment: "Good kid, but Maad City",
                reviewerId: userID1,
              },],

              sellerId: seller_Id1,
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
                sellerId: seller_Id1,
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
                  sellerId: seller_Id1,
                }).save(function(err,saved){
                  if (err) console.log(err);
                  foodID3 = saved._id;
                  new Purchases({
                    userId: userID1,
                    sellerId: seller_Id1,
                    foods: [{
                      foodId: foodID1,
                      quantity: 5,
                    }],
                  }).save(function(err,saved){
                    if (err) console.log(err);
                    // console.log(JSON.stringify(saved));
                    new Purchases({
                      userId: userID2,
                      sellerId: seller_Id1,
                      foods: [{
                        foodId: foodID2,
                        quantity: 1,
                      }],
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
    }
  });
}

module.exports = exec;
