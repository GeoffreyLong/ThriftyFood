var express = require('express');
var router = express.Router();
var stripe = require('stripe')('sk_test_an3Nezne8XguJAefiBJgNV63');

router.post('/create', function(req, res) {
  var stripeToken = req.body.stripeToken;

  var charge = stripe.charges.create({
    amount: 100, //in cents
    currency: 'cad',
    source: stripeToken,
    description: 'test charge'
  }, function (err, charge) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(charge)
    }
  });

  //redirect to homepage, needs to go to different page
  res.redirect('/');
});

module.exports = router;
