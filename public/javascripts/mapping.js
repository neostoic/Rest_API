//###############################################################
///// Copyright 2015, Georgoulas Ioannis, All rights reserved.
/////
///// Project: Venues recommender API
/////
///// File description: (mapping.js)
///// mapping data based on global scheme
/////
//###############################################################

var Venue     = require('../../models/venues.js');
var Math = require("mathjs");


module.exports = {
  google: function(input,coord)
        {
          var timestamp = Math.round((new Date()).getTime() / 1000);
          var gg_data = []; //this array holds the objects of the fourquare data

          for(i=0;i<input.length;i++)
          {
            var gg = new Venue();

            gg.other.poweredBy="Google";
            gg.other.timestamp=timestamp;
            gg.distance = Math.round(location_matching(coord[0],coord[1],input[i].geometry.location.lat,input[i].geometry.location.lng));

            if (typeof input[i].opening_hours != "undefined")
              {
                gg.other.openNow=input[i].opening_hours.open_now;
              }

            if (typeof input[i].rating != "undefined")
              {
                gg.rating=input[i].rating*2;
              }

            if (typeof input[i].price_level != "undefined")
              {
                gg.price=input[i].price_level;
              }
            gg.price=input[i].price_level;

            gg.location.lon=input[i].geometry.location.lng;
            gg.location.lat=input[i].geometry.location.lat;
            gg.location.address=input[i].vicinity;

            gg.name=input[i].name;

            gg_data.push(gg);



        }
        return gg_data;
      },
  foursquare: function(input,coord)
        {
          var timestamp = Math.round((new Date()).getTime() / 1000);

          var fq_data = []; //this array holds the objects of the fourquare data

          for(i=0;i<input.length;i++)
          {
          var fq = new Venue();

          fq.other.timestamp=timestamp;

          fq.distance = Math.round(location_matching(coord[0],coord[1],input[i].venue.location.lat,input[i].venue.location.lng));
          fq.other.checkins=input[i].venue.stats.checkinsCount;
          fq.other.poweredBy="Foursquare";
          if (typeof input[i].venue.hours != "undefined")
            {
              fq.other.openNow=input[i].venue.hours.isOpen;
            }

          if (typeof input[i].venue.rating != "undefined")
            {
              fq.rating=input[i].venue.rating;
            }
          fq.rating=input[i].venue.rating;

          if (typeof input[i].venue.price != "undefined")
            {
              fq.price=input[i].venue.price.tier;
            }


          fq.location.lon=input[i].venue.location.lng;
          fq.location.lat=input[i].venue.location.lat;
          fq.location.address=input[i].venue.location.address + ", " + input[i].venue.location.city;

          fq.name=input[i].venue.name;

          fq_data.push(fq);
          }

          return fq_data;// return venues_matching function

        }

};
function location_matching(lat1,lon1,lat2,lon2){

  var R = 6371; // km
  var dLat = (lat2-lat1)* (Math.PI / 180);
  var dLon = (lon2-lon1)* (Math.PI / 180);
  var lat1 = lat1* (Math.PI / 180);
  var lat2 = lat2* (Math.PI / 180);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c * 1000;

return d; //return the distance in meters
}
