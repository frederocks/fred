var cheerio = require('cheerio');
var request = require('request');
var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
var yogaSchema = new mongoose.Schema({
  time: { type: String, default: 'Guest' },
  _class: { type: String},
  teacher: { type: String },
  date: { type: Date, default: Date.now }
});

// mongoose.connect('mongodb://localhost:27017/yoga');
// mongoose.connection.on('error', function() {
//   console.error('MongoDB Connection Error. Make sure MongoDB is running.');
// });
var conn = mongoose.createConnection('mongodb://localhost:27017/data');
var Yoga = conn.model('Yoga', yogaSchema);
/**
 * GET /
 * Your STL page.
 */

exports.getYourstl = function(req, res, next) {
	// var links = [];
	Yoga.find(function(err,yogis){
		//if (err) return console.error(err);
	//console.log(yogis)
	// links = yogis;
	//return links	
  		res.render('yourstl', {
    	title: 'Your Stl', 
    	links: yogis
  		});
	}).limit(20)
}




// exports.getYourstl = function(req, res, next) {
//   request.get('http://stlouis.yogasix.com/st-louis-schedule', function(err, request, body) {
//     if (err) return next(err);
//     var $ = cheerio.load(body);
//     var links = [];
//     $('tr[id^="tr"]').each(function() {
//       //links.push([$(this).children().text().split('\n')[1].trim() + ' ' + $(this).children().text().split('\n')[0].trim() + ' ' + $(this).children().text().split('\n')[5].trim() + ' ' + $(this).children().text().split('\n')[6].trim()]);
//       var time = $(this).children().text().split('\n')[0].trim();
//       var _class = $(this).children().text().split('\n')[1].trim();
//       var teacher = $(this).children().text().split('\n')[5].trim() + ' ' + $(this).children().text().split('\n')[6].trim();
//       links.push([time, _class, teacher]);
//       //links.push([$(this).children().text().split('\n')[1].trim() , $(this).children().text().split('\n')[0].trim() , $(this).children().text().split('\n')[5].trim() , $(this).children().text().split('\n')[6].trim()]);
//       // links.push($(this).children().text().split('\n')[0].trim());
//       // links.push($(this).children().text().split('\n')[5].trim());
//       // links.push($(this).children().text().split('\n')[6].trim());
//     var yoga = new Yoga({time : time, _class:_class, teacher:teacher });
//     yoga.save(function(err){
//     	console.log('Saved!');
//     });

//     });
//   res.render('yourstl', {
//     title: 'Your STL', 
//     links: links
//     });
//   });
// };

// exports.getScraping = function(req, res, next) {
//   request.get('http://stlouis.yogasix.com/st-louis-schedule', function(err, request, body) {
//     if (err) return next(err);
//     var $ = cheerio.load(body);
//     var links = [];
//     $('tr[id^="tr"]').each(function() {
//       links.push($(this).children().text().split('\n')[1].trim());
//     });
//     res.render('api/scraping', {
//       title: 'Web Scraping',
//       links: links
//     });
//   });
// };