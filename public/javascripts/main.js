//###############################################################
///// Copyright 2015, Georgoulas Ioannis, All rights reserved.
/////
///// Project: Venues recommender API
/////
///// File description: (main.js)
///// the main file of the application.
/////
/////
///// Tasks:
///// -create recommendation algorithm (rank by best(default), distance(km and mins), price)
///// -put it online if possible
/////
//###############################################################

//load all the modules
var matching = require("./venues_matching.js");
var async = require("async");
var request = require("request");
var GooglePlaces = require("googleplaces");
var mapping = require("./mapping.js");
var recommender = require("./recommendation_algorithm.js");
var yelp = require("yelp").createClient
     ({
       consumer_key: "KqaH919E97OcBjvwSdmNOA",
       consumer_secret: "EdrY8mUdX2FrW8bfzwuGc5sHVhQ",
       token: "b88_Jj3xFQfP1JPtEgKxXa_WVcdlPVe4",
       token_secret: "eUQ94vBmJEbE_OUoluHmz7e7HZM"
     });


//export the main function
module.exports = {
  main: function(params,callback) {

    //handling request parameters
    //initialize parameter objects, (error checking was made in server.js file)
    //location and query parameters are obligatory
    var coordinates = params.location.split(",");

    var foursquare_param = {
      ll:params.location,
      client_id:'FZU3WGDZLLCL3BSGD5OXUFBPVS0VCJEATRLD1YK1DB51LTP5',
      client_secret: 'NTJEXBP3ZSGRECQ3MGE4JM4IGWZU11WHR5II0R3RNYHROGDE',
      v:'20150228',
      query:params.query,
      limit:'20',
      radius:'10000'
      };

      var google_param = {
        location:[coordinates[0],coordinates[1]],
        radius: '10000',
        keyword: params.query,
        types:'bakery|bar|cafe|food|night_club|restaurant'
      };



      var yelp_param = {
        term : params.query,
        limit:20,
        ll:params.location,
        radius_filter:'10000'
      };

      var radius = 10000;
    if (typeof params.radius != "undefined")
      {
      foursquare_param.radius=params.radius;
      google_param.radius=params.radius;
      yelp_param.radius_filter= params.radius;
      radius = params.radius;
      }

      if (typeof params.rankby == "undefined")
      {
      var rankmethod = "best";
      }
      else
      {
        var rankmethod = params.rankby;

      }



      var hrstart2 = process.hrtime();

      var original_yelp;
      var original_foursquare;
      var original_google;

    // controll flow of the functions
    async.auto({

        yelp_data: function(callback){
            console.log('Yelp loading...');
            var hrstart77 = process.hrtime();



            yelp.search(yelp_param, function(err, data) {
              if(err) { console.log(err); return; }
              else {
                    original_yelp = data.businesses;
                    var map =[];
                      map = mapping.yelp(data.businesses,coordinates);
                      callback(null, map);

                      hrend6 = process.hrtime(hrstart77);
                      console.log("Yelp COMPLETE in : %ds %dms", hrend6[0], hrend6[1]/1000000);
                    }
            });

        },
        foursquare_data: function(callback){
            console.log('Foursquare loading...');

            var hrstart55 = process.hrtime();

            request({url:"https://api.foursquare.com/v2/venues/explore", qs:foursquare_param},function(err, response, body) {
                    if(err) { console.log(err); return; }
                    else {
                            var info = JSON.parse(body);
                            original_foursquare = info.response.groups[0].items;
                            var map =[];
                             map = mapping.foursquare(info.response.groups[0].items,coordinates);

                            callback(null, map); //fq_data

                            hrend3 = process.hrtime(hrstart55);
                            console.log("Foursquare COMPLETE in : %ds %dms", hrend3[0], hrend3[1]/1000000);


                          }
                  });

        },
        google_data: function(callback){
            console.log('Google loading...');
            var hrstart66 = process.hrtime();


            var googlePlaces = new GooglePlaces("AIzaSyBSkbvLWVBP7-iBUFJkHwkU5S0SgpVTu3M", "json");


            googlePlaces.placeSearch(google_param, function (error, response) {
                if (error) throw error;
                else {
                    original_google = response.results;
                    var map =[];
                     map = mapping.google(response.results,coordinates);

                    callback(null, map);

                    hrend4 = process.hrtime(hrstart66);
                    console.log("Google COMPLETE in : %ds %dms", hrend4[0], hrend4[1]/1000000);

                  }
            });

        },

        matching: ['foursquare_data', 'google_data', function(callback, results){

          var hrstart5 = process.hrtime();

          var sendd = results.google_data;
          var match =  matching.venues_matching(results.foursquare_data,results.google_data,0.40,45);

          hrend5 = process.hrtime(hrstart5);
          console.log("Matching and integration (Foursquare - Google) completed in : %ds %dms", hrend5[0], hrend5[1]/1000000);
            callback(null, match);
        }],
        matching2: ['matching', 'yelp_data', function(callback, results){

          var hrstart5 = process.hrtime();

          var match =  matching.venues_matching(results.matching,results.yelp_data,0.40,45);

          hrend5 = process.hrtime(hrstart5);
          console.log("Matching and integration (Old - Yelp) completed in : %ds %dms", hrend5[0], hrend5[1]/1000000);
            callback(null, match);
        }],
        recommendation: ['matching2', function(callback, results){

          var rec =recommender.rank(results.matching2,rankmethod,radius);


            callback(null, rec);
        }]
    }, function(err, results) {
      if(err)
        {console.log('err = ', err);}
      //  console.log('results = ', results);
        callback({foursquare: original_foursquare , google: original_google , yelp: original_yelp, ranked:results.recommendation}); // callback of main function
    });



}};
