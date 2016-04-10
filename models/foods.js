var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Extend for "Iteration"?
// Might be difficult with mongoDB
var FoodSchema = new Schema({
    sellerId: mongoose.Schema.Types.ObjectId,
    name: String,
    images: [String],
    description: String,
    portionDefinition: String,
    portionsAvailable: Number,
    expiration: Date,                                 // An expected expiration date
    //TODO will want to change this to "availibilities really
    // For now will just forget about time range
    // timeRange: {start: Date, end: Date},
    timeRange: {start: Date, end: Date},
    price: Number,
    address: {                                        // Could change to region
      country: String,
      state: String,
      city: String,
      street: String,
      number: String, // since you could probably have like 114A
      // TODO apt #?
    },
    reviews: [{
      rating: Number,                                   // A number between 1 and 5
      comment: String,
      reviewerId: mongoose.Schema.Types.ObjectId,       // The ID of the reviewer
    }]
});

var Foods = mongoose.model('foods', FoodSchema);

module.exports = Foods;
