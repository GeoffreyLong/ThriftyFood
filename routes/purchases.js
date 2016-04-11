var express = require('express');
var router = express.Router();
var stripe = require('stripe')('sk_test_an3Nezne8XguJAefiBJgNV63');
var Foods = require('../models/foods');
var Users = require('../models/users');

//create a purchase, post request with charge_token, foodId (probably buyerId too)
router.post('/create', function(req, res) {
  var stripeToken = req.body.stripeToken;
  var foodId = req.body.foodId;

  console.log(stripeToken);
  console.log(foodId);

  //find purchased food
  Foods.findById(foodId, function (food_err, food) {
    if (food_err) {
      //TODO
      console.log('failed to find requested food for id [' + foodId + ']');
      res.render('/');
    }

    console.log(JSON.stringify(food));

    //find seller
    Users.findById(food.sellerId, function (seller_err, seller) {
      if (seller_err) {
        //TODO
        console.log('failed to find seller for requested food');
        console.log(JSON.stringify(food, null, 2))
        res.render('/');
      }
      console.log(JSON.stringify(seller));

      stripe.charges.create({
        amount: food.price * 100, //in cents
        currency: 'cad',
        source: stripeToken, //credit card token created client side by stripeJS
        description: 'test connect charge',
        application_fee: 10
      }, {
        stripe_account: seller.seller.stripeId
      }, function (err, charge) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(charge)
          }

          //redirect to homepage, needs to go to different page
          res.redirect('/');
      });
    });
  });
});

module.exports = router;
