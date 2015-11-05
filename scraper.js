// function generateUrls(limit) {
//   var url = 'http://stlouis.yogasix.com/st-louis';
//   var urls = [];
//   var i;
//   for (i=1; i < limit; i++) {
//     urls.push(url + i);
//   }
//   return urls;
// }
var http = require('http');

var cheerio = require('cheerio');

var util = require('util');

var EventEmitter = require('events').EventEmitter;

var STATUS_CODES = http.STATUS_CODES;


/*
 * Scraper Constructor
**/
function Scraper (url) {
    this.url = url;
    this.init();
}

/*
 * Make it an EventEmitter
**/
util.inherits(Scraper, EventEmitter);

/*
 * Initialize scraping
**/
Scraper.prototype.init = function () {
    var model;
    var self = this;
    self.on('loaded', function (html) {
        model = self.parsePage(html);
        self.emit('complete', model);
    });
    self.loadWebPage();
};

Scraper.prototype.loadWebPage = function () {
  var self = this;
  console.log('\n\nLoading ' + website);
  http.get(self.url, function (res) {
    var body = '';
    if(res.statusCode !== 200) {
      return self.emit('error', STATUS_CODES[res.statusCode]);
    }
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      self.emit('loaded', body);
    });
  })
  .on('error', function (err) {
    self.emit('error', err);
  });      
};
/*
 * Parse html and return an object
**/
Scraper.prototype.parsePage = function (html) {
  var $ = cheerio.load(html);
  $('tr').each(function(i, element){
  	var a = $(this);
  	var ab = a.text();
  	if(ab.trim().split('\n')[7]){
	   var metadata = {
	   	time: ab.trim().split('\n')[0].trim(),
	   	_class: ab.trim().split('\n')[2].trim(),
	   	room:ab.trim().split('\n')[3].trim(),
	   	teacher: ab.trim().split('\n')[7].trim() + ' ' + ab.trim().split('\n')[8].trim(),	   	
	   	// time: time,
	   	// type: parseInt(type),
	   	// type2: type,
	   	// b: b,
	   	// c: c,
	   	// c: parseInt(c)
	   };
	}
	   //console.log(metadata);
  });
  // var type = $('#address').text();
  // var location = $('#tel').text();
  // var time = $('td.#row_date').text();
  // var teacher = $('#fax').text();
  // var description = $('#email').text();
  // var website = $('#website').attr('href');
  // var phone =  $('#postal').text();
  // var model = {
  //   type: type.trim().split('\n'),
  //   description: description.trim(),
  //   phone: phone.trim().split('\n'),
  //   teacher: teacher.trim().split('\n'),
  //   website: website || '',
  //   time: time.trim().split('\n'),
  //   location: location.trim().split('\n'),
  //   url: this.url
  // };
  return metadata;
};
module.exports = Scraper;


//table[2]/tr[td]
//div[3]/table[1]/tbody/tr[td]