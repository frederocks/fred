var MongoClient = require('mongodb').MongoClient,
	MongoServer = require('mongodb').Server, 
	Db = require('mongodb').Db,
	db = new Db('test', new MongoServer('localhost', 27017, { 'native_parser': true }));

//////////
db.open();
 
exports.getWind = function(req, res) {

  res.render('wind', {
    title: 'Wind'
  });
};

exports.getWind = function(req, res) {
	db.collection('tinder').find({}).toArray(function(err, doc){
			res.render('wind', {
	    	title: 'Wind', 
	    	doc: doc, 

  	});

	});
};