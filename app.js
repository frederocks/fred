/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');
var multer  = require('multer');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var tinder = require('tinderjs');
var fs = require('fs');
// var mongo = require('mongodb');
// var monk = require('monk');
// var db = monk('localhost:27017/nodetest1');
/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
///my controllers 
//var bikesController = require('./controllers/bikes');
var aboutController = require('./controllers/about');
var stlController = require('./controllers/yourstl');
//var bikemapController = require('./controllers/bikemap');
var testController = require('./controllers/test');
var yogaController = require('./controllers/yoga');
var swimController = require('./controllers/swim');
var earthController = require('./controllers/earth');
var fireController = require('./controllers/fire');
var waterController = require('./controllers/water');
var windController = require('./controllers/wind');
var matchController = require('./controllers/match');
/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

var client = new tinder.TinderClient();



/**
 * Create Express server.
 */
var app = express();

// Make our db accessible to our router
// app.use(function(req,res,next){
//     req.db = db;
//     next();
// });
/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
	console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

var conn = mongoose.createConnection('mongodb://localhost/test');
var Match = require('./models/matchModel');

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
	paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public/favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: path.join(__dirname, 'uploads') }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: secrets.sessionSecret,
	store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
	csrf: true,
	xframe: 'SAMEORIGIN',
	xssProtection: true
}));
app.use(function(req, res, next) {
	res.locals.user = req.user;
	next();
});
app.use(function(req, res, next) {
	if (/api/i.test(req.path)) req.session.returnTo = req.path;
	next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

///my additions 
//app.get('/bikemap', bikemapController.getBikemap);
app.get('/yourstl', stlController.getYourstl);
app.get('/about', aboutController.getAbout);
app.get('/test', testController.getTest);
app.get('/yoga', yogaController.getYoga);
app.get('/swim', swimController.getSwim);
app.get('/match', matchController.getMatch);
app.post('/match', matchController.postMatch);
app.get('/earth', earthController.getEarth);

app.post('/earth', earthController.postEarth);
app.get('/fire', fireController.getFire);
app.get('/water', waterController.getWater);
app.get('/wind', windController.getWind);



/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);


app.get('/api/scraping', apiController.getScraping);

app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);
app.get('/api/linkedin', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getLinkedin);
app.get('/api/instagram', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getInstagram);

app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
app.get('/api/bitgo', apiController.getBitGo);
app.post('/api/bitgo', apiController.postBitGo);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), function(req, res) {
	res.redirect(req.session.returnTo || '/');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
	//console.log('req url is ' + req.url.substr(29));

	client.authorize('CAAGm0PX4ZCpsBABjUdxrRrHkvqjtUhMA91R9gxnkyBjNzP3Fw2smRbCJYfGZBP2E5r0M5Gij7jhi0LCp2rB8u15zkmcLWtllZCEFeatngyDKUgpU2Tyuvccd4ee2eNtLfZAzLN41ZCSzovF30FE8sDAWVJlZBiF0IBrr9KedTxTcMZBVub2cfwNrbLznxX5gZB2WR720MEWNfK0DGoWqAWdX', 10100373065426104, function(){
		// client.getRecommendations(10, function(error, data){
		// 	//console.log(data.results);

		client.getHistory(function(error, data){
			fs.writeFile('requestData.txt', JSON.stringify(data), function (err){
				if (err) throw err; 
			//console.log('its saved' + JSON.stringify(data));
			})
		var list = [];
			for (var i = data.matches.length - 1; i >= 0; i--) {
				if (typeof data.matches[i].person !== 'undefined') {
					var match = new Match({
							_id: data.matches[i].person._id, 
							name : data.matches[i].person.name, 
							birthday: data.matches[i].person.birth_date, 
							lastTinderActivity: data.matches[i].person.ping_time, 
							lastActivity: data.matches[i].last_activity_date, 
							photos:data.matches[i].person.photos,
							distance: null
					
					});

					//MIGHT NEED THIS IF save doesn't update
					// Match.findOne({_id: match._id}, function(err, existingMatch){
					// 	if (err) throw(err);
					// 	if (existingMatch){
					// 		//existingMatch.remove();
					// 		// Match.update({_id: match._id}, {$set: {lastTinderActivity:data.matches[i].last_activity_date }}).exec();
					// 		// Match.update({_id: match._id}, {$set: {photos :data.matches[i].person.photos[0].url }}).exec();
					// 	}
					// 	if(!existingMatch) {
					// 		match.save(function(err) {
					// 		if (err) throw(err);
					// 		});
					// 	}
					// });
					// Match.findOne({_id:match._id}, function(err, doc){
					// 	if (typeof doc !== 'undefined' || typeof doc !== null)
					// 	{
					// 		console.log(doc);
					// 		doc.lastTinderActivity = match.lastTinderActivity;
					// 		doc.save();
					// 	}
					// })
					////////I use this save function the first time they log in to save all matches then comment it out so upserts are performed instead
				// 	match.save(function(err) {
				// 	if (err) throw(err);
				// });
					///////////////////////
					Match.update({_id: match._id}, {name: match.name, birthday: match.birthday, lastTinderActivity:match.lastTinderActivity, lastActivity:match.lastActivity}, {upsert: true}, function(err) {
					if (err) throw(err);
				});

				};
					
				if (data.matches[i].person) {
					Match.update({_id: data.matches[i].person._id,}, {lastTinderActivity:data.matches[i].person.ping_time}, function(err) {
					if (err) throw(err);
				});
				};
				// if (data.matches[i].last_activity_date) console.log(JSON.stringify(data.matches[i].last_activity_date));
				// if (data.matches[i]._id) console.log(JSON.stringify(data.matches[i]._id));
				
				//if (data.matches[i].person.birth_date) console.log(JSON.stringify(data.matches[i].person.birth_date));
			};
		}) 
	});

	// res.redirect(req.session.returnTo || '/');
	res.redirect('/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
	res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
	res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
	res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), function(req, res) {
	res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes. (API examples)
 */


app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
	res.redirect('/api/venmo');
});

/**
 * Error Handler.
 */
app.use(errorHandler());



/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;

//auth route for tinder
//curl  -H "Content-Type: application/json" -d '{"facebook_token":"CAAGm0PX4ZCpsBAOIhKwFSdFLsjv1q5Dz6GUHzP8g1FXzeUa4cr1wm7dG07TcBIpH1d8TuZCDkI2JOsfO3sHOFhBzAkSC52ZBjJC7fQosZA75gNew1GKCAuBZClBAfDZB4DwRS0D09aLcPyGoRwSXrOZAKFnFiRUPA5trEnZCh6fIg46V2ojMwje7ti3FxmZAjq28IRuvMnHNY4Ch1WZAedpNaL"}' https://api.gotinder.com/auth
// curl -v 'https://api.gotinder.com/user/ping' --data '{"lat": 41.8850704674581, "lon": -87.6269250986163, "facebook_token":"CAAGm0PX4ZCpsBAOIhKwFSdFLsjv1q5Dz6GUHzP8g1FXzeUa4cr1wm7dG07TcBIpH1d8TuZCDkI2JOsfO3sHOFhBzAkSC52ZBjJC7fQosZA75gNew1GKCAuBZClBAfDZB4DwRS0D09aLcPyGoRwSXrOZAKFnFiRUPA5trEnZCh6fIg46V2ojMwje7ti3FxmZAjq28IRuvMnHNY4Ch1WZAedpNaL"}'
// curl  -H "Content-Type: application/json" -d '{"facebook_token":"CAAGm0PX4ZCpsBAOIhKwFSdFLsjv1q5Dz6GUHzP8g1FXzeUa4cr1wm7dG07TcBIpH1d8TuZCDkI2JOsfO3sHOFhBzAkSC52ZBjJC7fQosZA75gNew1GKCAuBZClBAfDZB4DwRS0D09aLcPyGoRwSXrOZAKFnFiRUPA5trEnZCh6fIg46V2ojMwje7ti3FxmZAjq28IRuvMnHNY4Ch1WZAedpNaL, , "lat": 41.8850704674581, "lon": -87.6269250986163"}' https://api.gotinder.com/user/ping
// curl  -H "Content-Type: application/json, X-Auth-Token: ef3a294a-d8f7-4bd6-8b51-763f038d2ea8" -d '{"lat": 41.88507046745811, "lon": -87.62692509861631}' https://api.gotinder.com/user/ping
// {"token":"ef3a294a-d8f7-4bd6-8b51-763f038d2ea8" 
//curl  -H "Content-Type: application/json, X-Auth-Token: ef3a294a-d8f7-4bd6-8b51-763f038d2ea8" -d '{"lat": 41.88507046745811, "lon": -87.62692509861631}' https://api.gotinder.com/user/ping
