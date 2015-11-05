var secrets = require('../config/secrets');
var querystring = require('querystring');
var validator = require('validator');
var async = require('async');
var request = require('request');
var _ = require('lodash');
var graph = require('fbgraph');
var monk = require('monk')('localhost/inferno');
var db = require('monk')('localhost/inferno')
var betch = db.get('test');
var _id = '', distance = '';

var xToken = 'e073f188-2985-4408-94cb-36a26c7a4728';

var collection = "db.collection('test')";
/**
 * GET /
 * Home page.
 */
//var $ = require('jquery');
///////////////from mongo db university
var MongoClient = require('mongodb').MongoClient,
	MongoServer = require('mongodb').Server, 
	Db = require('mongodb').Db,
	db = new Db('test', new MongoServer('localhost', 27017, { 'native_parser': true }));

//////////
db.open();

// exports.getEarth = function(req, res) {
// 	db.collection('tinder').findOne({}, function(err, doc))
//   res.render('earth', {
//     title: 'Earth'
//   });
// };
// exports.getFacebook = function(req, res, next) {
//   var token = _.find(req.user.tokens, { kind: 'facebook' });
//   //console.log('token is ' + token.accessToken);
//   graph.setAccessToken(token.accessToken);
//   async.parallel({
//     getMe: function(done) {
//       graph.get(req.user.facebook, function(err, me) {
//         done(err, me);
//       });
//     },
//     getMyFriends: function(done) {
//       graph.get(req.user.facebook + '/friends', function(err, friends) {
//         done(err, friends.data);
//       });
//     }
//   },
//   function(err, results) {
//     if (err) return next(err);
//     res.render('api/facebook', {
//       title: 'Facebook API',
//       me: results.getMe,
//       friends: results.getMyFriends
//     });
//   });
// };

//var doc1 = {};
exports.getEarth = function(req, res) {
	//fb user name is req.user.facebook
  // var token = _.find(req.user.tokens, { kind: 'facebook' });
  // console.log('token is ' + token.accessToken);
  // console.log('req.user ' + req.user)
	db.collection('tinder').find({'distance': {$lte : 1}}).sort({last_activity_date: -1}).toArray(function(err, doc1){
	db.collection('tinder').find({'distance': {$lte : 2}}).toArray(function(err, doc){
			res.render('earth', {
	    	title: 'Earth', 
	    	doc: doc, 
	    	doc1: doc1
  	});

	});
  });
};


//plugin bootstrap minus and plus
//http://jsfiddle.net/laelitenetwork/puJ6G/
exports.postEarth = function(req, res) {

	//var d = req.params.userDistance3; 
	var d = parseInt(req.body.userDistance); 
	console.log(d)
	db.collection('tinder').find({'distance': {$lte : d}}).sort({last_activity_date: -1}).toArray(function(err, doc4){
	db.collection('tinder').find({'distance': {$lte : 5}}).sort({last_activity_date: -1}).toArray(function(err, doc2){
			res.render('earth', {
	    	title: 'Earth', 
	    	doc1: doc4, 
	    	doc: doc2
  	});

	
  });
  });
};