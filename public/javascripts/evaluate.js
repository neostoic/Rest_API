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
///// -fixed locations to find which API is more acurate on populating our schema
///// -think about the evaluation
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
var Math = require("mathjs");


//export the main function
module.exports = {
  evaluate: function(params,callback) {


    //calculation of the edit distance
    var lev = string_matching(params.name1,params.name2);

    //similarity in string names in %
    var similarity = 1 - (lev/(Math.max(params.name1.length,params.name2.length)));

console.log("Name:" +similarity);

var coordinates1 = params.location1.split(",");
var coordinates2 = params.location2.split(",");

  var distance = location_matching(coordinates1[0],coordinates1[1],coordinates2[0],coordinates2[1]);

  console.log("Distance:" +distance);

  callback({Name: similarity , Distance: distance});
}};


//###############################################################
///// edit distance calculation function
//###############################################################
function string_matching(a,b){
  /*
  Copyright (c) 2011 Andrei Mackenzie
  */

    if(a.length == 0) return b.length;
    if(b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }

    return matrix[b.length][a.length];


}


//###############################################################
/////location nearness function
//###############################################################
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
