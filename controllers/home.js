/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.render('home1', {
    title: 'Home'
  });
};

