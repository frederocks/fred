/**
 * GET /
 * Your STL page.
 */
exports.getTest = function(req, res) {
  res.render('test', {
    title: 'Your test'
  });
};