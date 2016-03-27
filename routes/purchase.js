var express = require('express');
var router = express.Router();
var stripe = require('stripe')('sk_test_an3Nezne8XguJAefiBJgNV63');

router.post('/create', function(req, res) {
  res.redirect('/');
});

module.exports = router;
