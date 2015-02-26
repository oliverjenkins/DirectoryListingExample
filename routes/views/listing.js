var keystone = require('keystone');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Set locals
	locals.section = 'directory';
	locals.filters = {
		listing: req.params.listing
	};
	locals.data = {
		listing: {}
	};

	// Load the current listing
	view.on('init', function(next) {

		var q = keystone.list('Listing').model.findOne({
			state: 'published',
			slug: locals.filters.listing
		}).populate('author categories');

		q.exec(function(err, result) {

			locals.data.listing = result;
			if (result && result.author.password) {
				locals.data.listing.author.password = '******';
			}
			next(err);
		});

	});

	// Render the view
	view.render('listing');

};
