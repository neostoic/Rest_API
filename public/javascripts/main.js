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
///// -add Yelp
///// -create recommendation algorithm (rank by best(default), distance(km and mins), price)
///// -create system architecture using mongo (semantics)
///// -git it
///// -put it online if possible
/////
//###############################################################

//load all the modules
var matching = require("./venues_matching.js");
var async = require("async");
var request = require("request");
var GooglePlaces = require("googleplaces");
var mapping = require("./mapping.js");


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


    if (typeof params.radius != "undefined")
      {
      foursquare_param.radius=params.radius;
      google_param.radius=params.radius;
      }



      var hrstart2 = process.hrtime();



    // controll flow of the functions
    async.auto({
        foursquare_data: function(callback){
            console.log('Foursquare loading...');


            request({url:"https://api.foursquare.com/v2/venues/explore", qs:foursquare_param},function(err, response, body) {
                    if(err) { console.log(err); return; }
                    else {
                            var info = JSON.parse(body);
                            var map =[];
                             map = mapping.foursquare(info.response.groups[0].items,coordinates);

                            callback(null, map); //fq_data

                            hrend3 = process.hrtime(hrstart2);
                            console.log("Foursquare COMPLETE in : %ds %dms", hrend3[0], hrend3[1]/1000000);


                          }
                  });

        },
        google_data: function(callback){
            console.log('Google loading...');


            var googlePlaces = new GooglePlaces("AIzaSyBSkbvLWVBP7-iBUFJkHwkU5S0SgpVTu3M", "json");


            googlePlaces.placeSearch(google_param, function (error, response) {
                if (error) throw error;
                else {
                    var map =[];
                     map = mapping.google(response.results,coordinates);

                    callback(null, map);

                    hrend4 = process.hrtime(hrstart2);
                    console.log("Google COMPLETE in : %ds %dms", hrend4[0], hrend4[1]/1000000);

                  }
            });

        },
        matching: ['foursquare_data', 'google_data', function(callback, results){

          var hrstart5 = process.hrtime();

          var sendd = results.google_data;
          var match =  matching.venues_matching(results.foursquare_data,results.google_data,0.45,40);

          hrend5 = process.hrtime(hrstart5);
          console.log("Matching and integration completed in : %ds %dms", hrend5[0], hrend5[1]/1000000);
            callback(null, match);
        }],
        recommendation: ['matching', function(callback, results){

            callback(null, 'recommend');
        }]
    }, function(err, results) {
      if(err)
        {console.log('err = ', err);}
      //  console.log('results = ', results);
        callback({foursquare: results.foursquare_data , google: results.google_data ,integrated:results.matching}); // callback of main function
    });



}};
