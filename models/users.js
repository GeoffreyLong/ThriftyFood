var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    // There might be a better way to do this
    type: String,                                 // {"user", "seller"}
    seller: {
      stripeID: String, //stripe account id
      currentFoodItems: [mongoose.Schema.Types.ObjectId],
      pastFoodItems: [mongoose.Schema.Types.ObjectId],// Is this distinction necessary?
    },
});

var Users = mongoose.model('users', UserSchema);

module.exports = Users;
