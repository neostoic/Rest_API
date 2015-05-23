//###############################################################
///// Copyright 2015, Georgoulas Ioannis, All rights reserved.
/////
///// Project: Venues recommender API
/////
///// File description: (venues_mathcing.js)
///// String mathcing and location nearness functions
/////
//###############################################################

//load all the modules
var request = require("request");
var Math = require("mathjs");


//###############################################################
///// exported global function venues_matching
//###############################################################
module.exports = {
  venues_matching: function(listA,listB,similarity_limit,max_distance) {

    var similarity = [];
    var index_store = [];

    for(i=0;i<listA.length;i++)
    {
      for(j=0;j<listB.length;j++)
      {

        //calculation of the edit distance
        var lev = string_matching(listA[i].name,listB[j].name);

        //similarity in string names in %
        var similarity = 1 - (lev/(Math.max(listA[i].name.length,listB[j].name.length)));

          if (similarity >= similarity_limit)
          {
            //calculation of the distance between the two given pair of coordinates
            var distance = location_matching(listA[i].location.lat,listA[i].location.lon,listB[j].location.lat,listB[j].location.lon);
            if(distance<=max_distance)
            {

              //store the index of the listB
              index_store.push(j);
              //Update the data in listA (integration)

              //rating
              if ( listA[i].rating == "undefined")
                {
                  if ( listB[j].rating != "undefined")
                  {
                    listA[i].rating = listB[j].rating;

                  }
                }
              else
              {
                if ( listB[j].rating != "undefined")
                {

                  if(listA[i].other.poweredBy.length == 1)
                  {
              //    console.log("Before listA:" + listA[i].rating  + " and listB: " + listB[j].rating)
                  var rounded = Math.round( (listB[j].rating + listA[i].rating)/2 * 10 ) / 10;
                  listA[i].rating = rounded;
                //  console.log("After listA:" + listA[i].rating)

                  }
                  else if (listA[i].other.poweredBy.length == 2)
                  {
                    var rounded2 = Math.round( (listB[j].rating/3 + listA[i].rating*2/3) * 10 ) / 10;
                    listA[i].rating = rounded2;

                  }
                }

              }

              //openNow check
              if ( listA[i].other.openNow == "undefined")
                {
                  if ( listB[j].other.openNow != "undefined")
                  {
                    listA[i].other.openNow = listB[j].other.openNow;

                  }
                }

                //price check
                if ( listA[i].price == "undefined")
                  {
                    if ( listB[j].price != "undefined")
                    {
                      listA[i].price = listB[j].price;

                    }
                  }


                //phone check
                if (typeof listA[i].other.phone == "undefined")
                  {
                    if ( listB[j].other.phone != "undefined")
                    {
                      listA[i].other.phone = listB[j].other.phone;
                    }
                  }

                  //powered field
                  listA[i].other.poweredBy.push(listB[j].other.poweredBy[0]);


              console.log("Similarity: " + similarity + " Names:--------------- " +listA[i].name +" ------------- "+listB[j].name +" Distance: " + distance);
            }
          }
      }

      //the last thing before exit the double for loop is to build the exported integrated list
      if (i == (listA.length-1))
      {

        index_store.sort(function(a, b){return b-a});
        for(k=0 ;k<index_store.length ;k++)
        {
         listB.splice(index_store[k],1);
        }
      //  console.log(index_store);

        var new_list = listA.concat(listB);

      }
    }


  return new_list;// return venues_matching function

  }
};


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
