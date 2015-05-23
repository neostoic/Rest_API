//###############################################################
///// Copyright 2015, Georgoulas Ioannis, All rights reserved.
/////
///// Project: Venues recommender API
/////
///// File description: (recommendation_algorithm.js)
///// recommendation algorithm
/////
//###############################################################



module.exports = {
  rank: function(list,method,radius)
        {
          var weights ={};
          var ranked_list = [];

          if (method == "best")
          {
             weights = {
              rating : 0.5,
              distance:0.1,
              powered:0.4,
              price:0
            };
          }
          else if (method == "distance")
          {
             weights = {
              rating : 0.3,
              distance:0.45,
              powered:0.25,
              price:0
            };
          }


          var index_store = [];
          var w_rating;
          var w_powered;
          var w_distance;

          for(i=0;i<list.length;i++)
          {
            //rating
            w_rating = list[i].rating * weights.rating;

            //poweredby
            if (list[i].other.poweredBy.length == 1)
            {
              w_powered = 6* weights.powered;
            }
            else if (list[i].other.poweredBy.length == 2)
            {
              w_powered = 8* weights.powered;
            }
            else if (list[i].other.poweredBy.length == 3)
            {
              w_powered = 10* weights.powered;
            }

            //distance

            help_distance = list[i].distance * 10 /radius ;

            var l=9;
            for(k=0;k<10;k++)
            {

              if(help_distance>k && help_distance<=k+1)
              {
                w_distance= (1 - help_distance + k + l)*weights.distance;
              }

              l--;


            }

            index_store.push({index:i , rank: w_rating + w_powered + w_distance});

          }


          index_store.sort(function(a, b){return b.rank-a.rank});


          //rank the list based on the index
          for(i=0;i<index_store.length;i++)
          {

            if(typeof list[index_store[i].index].rating != "undefined")
            {
              ranked_list.push(list[index_store[i].index]);
              }

          }


          console.log(index_store);
          return ranked_list;

      }
};
