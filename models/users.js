var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    // There might be a better way to do this
    type: String,
    currentFoodItems: [mongoose.Schema.Types.ObjectId],
    pastFoodItems: [mongoose.Schema.Types.ObjectId],
    seller: {
      stripeID: String, //stripe account id
    },
});

var Users = mongoose.model('users', UserSchema);

module.exports = Users;
