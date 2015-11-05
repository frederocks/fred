var mongoose = require('mongoose');
var SwimSchema = require('../models/swim');
var db =mongoose.createConnection('mongodb://localhost/test');
//var SwimSchema = mongoose.model('restaurants').schema;

var swim = db.model('restaurant', SwimSchema);



exports.getSwim = function(req, res) {
  swim.find(function(err, place){
  	if(err){console.log('some erre')};
  
  res.render('swim',{
    title: 'Swimming', 
    place:place
  });
}).limit(20)
}