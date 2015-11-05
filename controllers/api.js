var secrets = require('../config/secrets');
var querystring = require('querystring');
var validator = require('validator');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var graph = require('fbgraph');
var LastFmNode = require('lastfm').LastFmNode;
var tumblr = require('tumblr.js');
var foursquare = require('node-foursquare')({ secrets: secrets.foursquare });
var Github = require('github-api');
var Twit = require('twit');
var stripe = require('stripe')(secrets.stripe.secretKey);
var twilio = require('twilio')(secrets.twilio.sid, secrets.twilio.token);
var Linkedin = require('node-linkedin')(secrets.linkedin.clientID, secrets.linkedin.clientSecret, secrets.linkedin.callbackURL);
var BitGo = require('bitgo');
var clockwork = require('clockwork')({ key: secrets.clockwork.apiKey });
var paypal = require('paypal-rest-sdk');
var lob = require('lob')(secrets.lob.apiKey);
var ig = require('instagram-node').instagram();
var Y = require('yui/yql');
var _ = require('lodash');

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Examples'
  });
};


/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = function(req, res, next) {
  var token = _.find(req.user.tokens, { kind: 'facebook' });
  //console.log('token is ' + token.accessToken);
  graph.setAccessToken(token.accessToken);
  async.parallel({
    getMe: function(done) {
      graph.get(req.user.facebook, function(err, me) {
        done(err, me);
      });
    },
    getMyFriends: function(done) {
      graph.get(req.user.facebook + '/friends', function(err, friends) {
        done(err, friends.data);
      });
    }
  },
  function(err, results) {
    if (err) return next(err);
    res.render('api/facebook', {
      title: 'Facebook API',
      me: results.getMe,
      friends: results.getMyFriends
    });
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = function(req, res, next) {
  request.get('https://news.ycombinator.com/', function(err, request, body) {
    if (err) return next(err);
    var $ = cheerio.load(body);
    var links = [];
    $('.title a[href^="http"], a[href^="https"]').each(function() {
      links.push($(this));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links: links
    });
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = function(req, res, next) {
  var token = _.find(req.user.tokens, { kind: 'github' });
  var github = new Github({ token: token.accessToken });
  var repo = github.getRepo('sahat', 'requirejs-library');
  repo.show(function(err, repo) {
    if (err) return next(err);
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo
    });
  });

};



/**
 * GET /api/twitter
 * Twiter API example.
 */
exports.getTwitter = function(req, res, next) {
  var token = _.find(req.user.tokens, { kind: 'twitter' });
  var T = new Twit({
    consumer_key: secrets.twitter.consumerKey,
    consumer_secret: secrets.twitter.consumerSecret,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.get('search/tweets', { q: 'nodejs since:2013-01-01', geocode: '40.71448,-74.00598,5mi', count: 10 }, function(err, reply) {
    if (err) return next(err);
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets: reply.statuses
    });
  });
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = function(req, res, next) {
  req.assert('tweet', 'Tweet cannot be empty.').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }
  var token = _.find(req.user.tokens, { kind: 'twitter' });
  var T = new Twit({
    consumer_key: secrets.twitter.consumerKey,
    consumer_secret: secrets.twitter.consumerSecret,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
    if (err) return next(err);
    req.flash('success', { msg: 'Tweet has been posted.'});
    res.redirect('/api/twitter');
  });
};



/**
 * GET /api/stripe
 * Stripe API example.
 */
exports.getStripe = function(req, res) {
  res.render('api/stripe', {
    title: 'Stripe API',
    publishableKey: secrets.stripe.publishableKey
  });
};

/**
 * POST /api/stripe
 * Make a payment.
 */
exports.postStripe = function(req, res, next) {
  var stripeToken = req.body.stripeToken;
  var stripeEmail = req.body.stripeEmail;
  stripe.charges.create({
    amount: 395,
    currency: 'usd',
    card: stripeToken,
    description: stripeEmail
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      req.flash('errors', { msg: 'Your card has been declined.' });
      res.redirect('/api/stripe');
    }
    req.flash('success', { msg: 'Your card has been charged successfully.' });
    res.redirect('/api/stripe');
  });
};


/**
 * GET /api/clockwork
 * Clockwork SMS API example.
 */
exports.getClockwork = function(req, res) {
  res.render('api/clockwork', {
    title: 'Clockwork SMS API'
  });
};

/**
 * POST /api/clockwork
 * Send a text message using Clockwork SMS
 */
exports.postClockwork = function(req, res, next) {
  var message = {
    To: req.body.telephone,
    From: 'Hackathon',
    Content: 'Hello from the Hackathon Starter'
  };
  clockwork.sendSms(message, function(err, responseData) {
    if (err) return next(err.errDesc);
    req.flash('success', { msg: 'Text sent to ' + responseData.responses[0].to });
    res.redirect('/api/clockwork');
  });
};

/**
 * GET /api/venmo
 * Venmo API example.
 */
exports.getVenmo = function(req, res, next) {
  var token = _.find(req.user.tokens, { kind: 'venmo' });
  var query = querystring.stringify({ access_token: token.accessToken });
  async.parallel({
    getProfile: function(done) {
      request.get({ url: 'https://api.venmo.com/v1/me?' + query, json: true }, function(err, request, body) {
        done(err, body);
      });
    },
    getRecentPayments: function(done) {
      request.get({ url: 'https://api.venmo.com/v1/payments?' + query, json: true }, function(err, request, body) {
        done(err, body);
      });
    }
  },
  function(err, results) {
    if (err) return next(err);
    res.render('api/venmo', {
      title: 'Venmo API',
      profile: results.getProfile.data,
      recentPayments: results.getRecentPayments.data
    });
  });
};

/**
 * POST /api/venmo
 * Send money.
 */
exports.postVenmo = function(req, res, next) {
  req.assert('user', 'Phone, Email or Venmo User ID cannot be blank').notEmpty();
  req.assert('note', 'Please enter a message to accompany the payment').notEmpty();
  req.assert('amount', 'The amount you want to pay cannot be blank').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/venmo');
  }
  var token = _.find(req.user.tokens, { kind: 'venmo' });
  var formData = {
    access_token: token.accessToken,
    note: req.body.note,
    amount: req.body.amount
  };
  if (validator.isEmail(req.body.user)) {
    formData.email = req.body.user;
  } else if (validator.isNumeric(req.body.user) &&
    validator.isLength(req.body.user, 10, 11)) {
    formData.phone = req.body.user;
  } else {
    formData.user_id = req.body.user;
  }
  request.post('https://api.venmo.com/v1/payments', { form: formData }, function(err, request, body) {
    if (err) return next(err);
    if (request.statusCode !== 200) {
      req.flash('errors', { msg: JSON.parse(body).error.message });
      return res.redirect('/api/venmo');
    }
    req.flash('success', { msg: 'Venmo money transfer complete' });
    res.redirect('/api/venmo');
  });
};

/**
 * GET /api/linkedin
 * LinkedIn API example.
 */
exports.getLinkedin = function(req, res, next) {
  var token = _.find(req.user.tokens, { kind: 'linkedin' });
  var linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me(function(err, $in) {
    if (err) return next(err);
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};

/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = function(req, res, next) {
  var token = _.find(req.user.tokens, { kind: 'instagram' });
  ig.use({ client_id: secrets.instagram.clientID, client_secret: secrets.instagram.clientSecret });
  ig.use({ access_token: token.accessToken });
  async.parallel({
    searchByUsername: function(done) {
      ig.user_search('richellemead', function(err, users, limit) {
        done(err, users);
      });
    },
    searchByUserId: function(done) {
      ig.user('175948269', function(err, user) {
        done(err, user);
      });
    },
    popularImages: function(done) {
      ig.media_popular(function(err, medias) {
        done(err, medias);
      });
    },
    myRecentMedia: function(done) {
      ig.user_self_media_recent(function(err, medias, pagination, limit) {
        done(err, medias);
      });
    }
  }, function(err, results) {
    if (err) return next(err);
    res.render('api/instagram', {
      title: 'Instagram API',
      usernames: results.searchByUsername,
      userById: results.searchByUserId,
      popularImages: results.popularImages,
      myRecentMedia: results.myRecentMedia
    });
  });
};



/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = function(req, res, next) {
  paypal.configure({
    mode: 'sandbox',
    client_id: secrets.paypal.client_id,
    client_secret: secrets.paypal.client_secret
  });

  var paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: secrets.paypal.returnUrl,
      cancel_url: secrets.paypal.cancelUrl
    },
    transactions: [{
      description: 'Hackathon Starter',
      amount: {
        currency: 'USD',
        total: '1.99'
      }
    }]
  };

  paypal.payment.create(paymentDetails, function(err, payment) {
    if (err) return next(err);
    req.session.paymentId = payment.id;
    var links = payment.links;
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === 'approval_url') {
        res.render('api/paypal', {
          approvalUrl: links[i].href
        });
      }
    }
  });
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = function(req, res) {
  var paymentId = req.session.paymentId;
  var paymentDetails = { payer_id: req.query.PayerID };
  paypal.payment.execute(paymentId, paymentDetails, function(err) {
    if (err) {
      res.render('api/paypal', {
        result: true,
        success: false
      });
    } else {
      res.render('api/paypal', {
        result: true,
        success: true
      });
    }
  });
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = function(req, res) {
  req.session.paymentId = null;
  res.render('api/paypal', {
    result: true,
    canceled: true
  });
};

/**
 * GET /api/lob
 * Lob API example.
 */
exports.getLob = function(req, res, next) {
  lob.routes.list({
    zip_codes: ['10007'] 
  }, function(err, routes) {
    if(err) return next(err); 
    res.render('api/lob', {
      title: 'Lob API',
      routes: routes.data[0].routes
    });
  });
};

/**
 * GET /api/bitgo
 * BitGo wallet example
 */
exports.getBitGo = function(req, res, next) {
  var bitgo = new BitGo.BitGo({ env: 'test', accessToken: secrets.bitgo.accessToken });
  var walletId = req.session.walletId; // we use the session to store the walletid, but you should store it elsewhere

  var renderWalletInfo = function(walletId) {
    bitgo.wallets().get({id: walletId}, function(err, walletRes) {
      walletRes.createAddress({}, function(err, addressRes) {
        walletRes.transactions({}, function(err, transactionsRes) {
          res.render('api/bitgo', {
            title: 'BitGo API',
            wallet: walletRes.wallet,
            address: addressRes.address,
            transactions: transactionsRes.transactions
          });
        });
      });
    });
  };

  if (walletId) {
    // wallet was created in the session already, just load it up
    renderWalletInfo(walletId);
  } else {
    bitgo.wallets().createWalletWithKeychains(
      {
        passphrase: req.sessionID, // change this!
        label: 'wallet for session ' + req.sessionID,
        backupXpub: 'xpub6AHA9hZDN11k2ijHMeS5QqHx2KP9aMBRhTDqANMnwVtdyw2TDYRmF8PjpvwUFcL1Et8Hj59S3gTSMcUQ5gAqTz3Wd8EsMTmF3DChhqPQBnU'
      },
      function(err, res) {
        req.session.walletId = res.wallet.wallet.id;
        renderWalletInfo(req.session.walletId);
      }
    );
  }
};

/**
 * POST /api/bitgo
 * BitGo send coins example
 */
exports.postBitGo = function(req, res, next) {
  var bitgo = new BitGo.BitGo({ env: 'test', accessToken: secrets.bitgo.accessToken });
  var walletId = req.session.walletId; // we use the session to store the walletid, but you should store it elsewhere
  var amount = parseInt(req.body.amount);

  try {
    bitgo.wallets().get({id: walletId}, function (err, wallet) {
      wallet.sendCoins(
      { address: req.body.address, amount: parseInt(req.body.amount), walletPassphrase: req.sessionID },
      function (e, result) {
        if (e) {
          console.dir(e);
          req.flash('errors', { msg: e.message });
          return res.redirect('/api/bitgo');
        }
        req.flash('info', { msg: 'txid: ' + result.hash + ', hex: ' + result.tx });
        return res.redirect('/api/bitgo');
      });
    });
  } catch(e) {
    req.flash('errors', { msg: e.message });
    return res.redirect('/api/bitgo');
  }
};