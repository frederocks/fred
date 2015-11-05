var secrets = require('../config/secrets');
var querystring = require('querystring');
var validator = require('validator');
var async = require('async');
var request = require('request');
var _ = require('lodash');
var graph = require('fbgraph');
var Match = require('../models/matchModel');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  //console.log(db.collections.matches);
});


var _id = '', distance = '';

//var xToken = 'e073f188-2985-4408-94cb-36a26c7a4728';
var xToken = null;


exports.getMatch = function(req, res) {
	//fb user name is req.user.facebook
	// I used the stream initially but then all the distances matched up some im changing it to all instead of 'distance':null
	var stream = Match.find({}).stream();
	//the stream is on and prints out all matches 
	stream.on('data', function (doc){
		//console.log(doc._id);
		var options = {
		// url: 'https://api.gotinder.com/user/51c4c161692c27af37004c34', 3768fa53-a733-4bf6-881a-0572fa1045d7
		url: 'https://api.gotinder.com/user/' + doc._id,
		headers: {
			'X-Auth-Token':'3768fa53-a733-4bf6-881a-0572fa1045d7', 'User-Agent': 'request','Content-type' : 'application/json'
		}
	};
		request(options, function callback(error, response, body) {
		if (error) throw error;
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			//var info = body;
			//console.log(info)
			_id = info.results._id;
			distance = info.results.distance_mi;
///in here I wanna put a qualifier to only update the database if they're within like 10 miles
			Match.update({'_id': _id}, {'distance': distance, lastTinderActivity: info.results.ping_time}, {}, function(err, update){
				if(err) throw err; 
				//var updated = JSON.st
				//console.log("success " + JSON.stringify(update));
				//console.dir("success updated " + distance + " " + _id)
			})

		}
		if (response.statusCode == 500) {
			var info = JSON.parse(body);
			//console.log(info.results.distance_mi); 
			// db.collection('test').remove({'person._id': _id}, function(err, upserted){
			// 	if(err) throw err; 
			// 	console.dir("success removed " + upserted)
			// })

		}

		if (response.statusCode == 401) {
			var info = JSON.parse(body);	
		}
		})

	})

  // var token = _.find(req.user.tokens, { kind: 'facebook' });
  // console.log('token is ' + token.accessToken);
  //console.log('req.user ' + req.user)

	//db.collection('tinder').find({'distance': {$lte : 1}}).sort({last_activity_date: -1}).toArray(function(err, doc1){
	Match.find({'distance':{$lte:7}}, function(err, doc1){
		//console.log(doc1)
			res.render('match', {
	    	title: 'Matches', 
	    	doc1: doc1
  	});


  }).sort({lastTinderActivity: -1}).limit(100);
};


//plugin bootstrap minus and plus
//http://jsfiddle.net/laelitenetwork/puJ6G/
exports.postMatch = function(req, res) {

	//var d = req.params.userDistance3; 
	var d = parseInt(req.body.userDistance3); 
	console.log(d)
	Match.find({'distance': {$lte : d}}, function(err, doc2){
			res.render('match', {
	    	title: 'Matches', 
	    	doc1: doc2
  	});
  }).sort({lastTinderActivity: -1}).limit(100)
};