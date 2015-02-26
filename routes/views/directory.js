var keystone = require('keystone');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Set locals
	locals.section = 'directory';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		listings: []
	};


	view.on('init', function(next) {
		keystone.list('ListingCategory').model.findOne({
			key: locals.filters.category
		}).exec(function(err,result) {
			locals.data.category = result;
			next(err);
		});

	});


	// Load directory listings
	view.on('init', function(next) {

		var q = keystone.list('Listing').paginate();
		if (locals.filters.category) {
			console.log('adding category filter');

			q.where('categories').in([locals.data.category])

		}
		q.where('state', 'published').sort('-publishedDate').populate('author').limit('4');

		q.exec(function(err, results) {
			console.log(err,results);
			locals.data.listings = results;
			next(err);
		});
	});

	// Render the view
	view.render('listing');

};
