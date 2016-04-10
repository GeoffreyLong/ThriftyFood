var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// The purchases will most likely be over one seller
var PurchaseSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    sellerId: mongoose.Schema.Types.ObjectId,
    foods: [{
      foodId: mongoose.Schema.Types.ObjectId,         //
      quantity: Number,                               // The number of portions
      //sellerId: mongoose.Schema.Types.ObjectId,     // Include? Inherent in foodId
    }],
});

var Purchases = mongoose.model('purchases', PurchaseSchema);

module.exports = Purchases;
