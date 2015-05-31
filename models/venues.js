//###############################################################
///// Copyright 2015, Georgoulas Ioannis, All rights reserved.
/////
///// Project: Venues recommender API
/////
///// File description: (venues.js)
///// API schema design using mongoose module
/////
//###############################################################


var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var VenueSchema   = new Schema({
    name: String, // human readable format
    location: {
      lat:Number,
      lon:Number,
      address: String // in this format -> e.g. 17 Great Junction Street, Edinburgh
    },
    price: Number, // scale of 4, 1-2-3-4
    distance: Number, // meters from location search
    rating: Number, //  scale of 10
    other:{
      checkins:Number,//only from Foursquare
      poweredBy: [String], // name of the APIs used
      timestamp: Number,//timestamp of the request
      openNow: Boolean,
      phone: String
    }

});

module.exports = mongoose.model('Venue', VenueSchema);
