var keystone = require('keystone'),
	Listing = keystone.list('Listing');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		hasRedirected = false,
		locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'directory';
	locals.formData = req.body || {};
	locals.validationErrors = {};

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'newlisting' }, function(next) {
		console.log(req.body);
		var newListing = new Listing.model({
			author: req.user,
			content: { brief: req.body['content.brief'] },
			state:	'published'
		});

		newListing.getUpdateHandler(req,res).process(req.body, {
			flashErrors: true,
			fields: 'title',
			errorMessage: 'There was a problem submitting your listing:'
		}, function(err,listing) {
			if (err) {
				console.log(err);
				locals.validationErrors = err.errors;
			} else {
				console.log(listing);
				hasRedirected = true;
				res.redirect('/directory/listing/' + listing.slug);
			}
			next();
		});

	});

	// Render the view
	if (hasRedirected === false) {
		view.render('newListing');
	}
};
