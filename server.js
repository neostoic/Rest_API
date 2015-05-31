//###############################################################
///// Copyright 2015, Georgoulas Ioannis, All rights reserved.
/////
///// Project: Venues recommender API
/////
///// File description: (server.js)
///// Server functionalities: port number, routes, http requests, mongodb connection
/////
//###############################################################


// BASE SETUP
// =============================================================================

var mongoose   = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/restAPI'); // connect to our database


// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var Bear     = require('./models/bear');
var Main     = require('./public/javascripts/main.js');
var eval     = require('./public/javascripts/evaluate.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


app.set('view engine', 'jade');

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Enables CORS
var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      console.log(' ');
      console.log('------------A request just arrived.------------');
      next();
    }
};


// enable CORS!
router.use(enableCORS);




/*

// middleware to use for all requests -- add validity checks
router.use(function(req, res, next) {
    // do logging
    console.log(' ');
    console.log('------------A request just arrived.------------');
    next(); // make sure we go to the next routes and don't stop here
});

*/
// route that our documentation will be (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {

      res.render('index', { title: 'iVenues' });
});




//This is the get method that we will do the search on API for restorants
router.route('/api/search')

    .get(function(req, res) {

    // Correct url parameters checking is required

    var valid_params = ["query","location","radius","rankby","limit","opennow"];
    var flag=0;
    var check =0;

    //timer starts
    var hrstart = process.hrtime();


    //check if the parameters are valid
    for(i=0; i<Object.keys(req.query).length ; i++)
    {
      for(j=0; j<valid_params.length; j++)
      {
        if(Object.keys(req.query)[i] == valid_params[j])
        {
          flag=1;
        }
      }

      if (flag == 0)
      {
        res.json({ error: 'Parameter --- '+ Object.keys(req.query)[i]  +' --- is not recognised. ' });
        check =1;
      }
      flag=0;
    }



    if (check == 1)//wrong or uknown parameters --> no need to run these checks
      {
        console.log('API failed to answer -  syntax error in url parameters.');
      }
    else if (typeof req.query.location == "undefined")//check if location is undefined
      {
       res.json({ error: 'Location parameters are missing' });
       console.log('API failed to answer -  syntax error in url parameters.');

      }
    else if(!(/^([-+]?\d{1,2}[.]\d+),\s*([-+]?\d{1,3}[.]\d+)$/.test(req.query.location))) // check if the location parameter match the pattern
    {
      res.json({ error: 'Location parameters are bad typed' });
      console.log('API failed to answer -  syntax error in url parameters.');

    }
    else if (typeof req.query.query == "undefined")//check if query is undefined
      {
       res.json({ error: 'Query parameter is missing' });
       console.log('API failed to answer -  syntax error in url parameters.');

      }
    else if (typeof req.query.radius != "undefined" &&  (!(/^\d+$/.test(req.query.radius)) || req.query.radius > 40000) )//check if radius exists and waht value it has, over 40000 is not allowed
      {
          res.json({ error: 'Radius has a max limit on 50.000' });
          console.log('API failed to answer -  syntax error in url parameters.');

      }
    else if (typeof req.query.limit != "undefined" && (req.query.limit > 20 || req.query.limit < 1 || !(/^\d+$/.test(req.query.limit))))//check if limit exists and what value it has, 1<=limit<=20
      {
          res.json({ error: 'Limit parameter should be between 1 and 20' });
          console.log('API failed to answer -  syntax error in url parameters.');

      }
    else if ((typeof req.query.rankby != "undefined" )&& ((req.query.rankby !="best") && (req.query.rankby !="price") && (req.query.rankby !="distance")&& (req.query.rankby !="time")))//check if rankby exists and what value it has
      {
          res.json({ error: 'Wrong ranking input.' });
          console.log('API failed to answer -  syntax error in url parameters.');

      }
    else if ((typeof req.query.opennow != "undefined" )&& ((req.query.opennow !="true") && (req.query.opennow !="false")))//check if opennow exists and what value it has
      {
          res.json({ error: 'Opennow parameter must br true or false.' });
          console.log('API failed to answer -  syntax error in url parameters.');

      }
    else
    {

    //  hrend = process.hrtime(hrstart);

        Main.main(req.query,function(data){
        res.json(data);
/*
      console.log("Execuation time of url check : %ds %dms", hrend[0], hrend[1]/1000000);

      hrend2 = process.hrtime(hrstart);
      console.log("Execuation time of integration : %ds %dms", hrend2[0], hrend2[1]/1000000);
*/
      hrend3 = process.hrtime(hrstart);
      console.log("API answered succesfully in : %ds %dms", hrend3[0], hrend3[1]/1000000);

         });
    }


    });

//This is the get method that we will do the search on API for restorants
router.route('/evaluate')

    .get(function(req, res) {

      eval.evaluate(req.query,function(data){
        res.json(data);

    });
    });









/*



// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {

        var bear = new Bear();      // create a new instance of the Bear model
        bear.name = req.body.name;  // set the bears name (comes from the request)

        // save the bear and check for errors
        bear.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Bear created!' });
        });

    })

    // get all the bears (accessed at GET http://localhost:8080/api/bears)
   .get(function(req, res) {
       Bear.find(function(err, bears) {
           if (err)
               res.send(err);

           res.json(bears);
       });
   });

   // on routes that end in /bears/:bear_id
   // ----------------------------------------------------
   router.route('/bears/:bear_id')

       // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
       .get(function(req, res) {
           Bear.findById(req.params.bear_id, function(err, bear) {
               if (err)
                   res.send(err);
               res.json(bear);
           });
       })

       // update the bear with this id (accessed at PUT http://localhost:8080/api/bears/:bear_id)
           .put(function(req, res) {

               // use our bear model to find the bear we want
               Bear.findById(req.params.bear_id, function(err, bear) {

                   if (err)
                       res.send(err);

                   bear.name = req.body.name;  // update the bears info

                   // save the bear
                   bear.save(function(err) {
                       if (err)
                           res.send(err);

                       res.json({ message: 'Bear updated!' });
                   });

               });
           })

           // delete the bear with this id (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
      .delete(function(req, res) {
       Bear.remove({
           _id: req.params.bear_id
       }, function(err, bear) {
           if (err)
               res.send(err);

           res.json({ message: 'Successfully deleted' });
       });
   });

*/




// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
