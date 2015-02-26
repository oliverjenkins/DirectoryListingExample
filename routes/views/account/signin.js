var keystone = require('keystone'),
	Enquiry = keystone.list('Enquiry');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		hasRedirected = false,
		locals = res.locals;

	// Set locals
	locals.section = 'account';
	locals.formData = req.body || {};
	locals.validationErrors = {};

	// On POST requests, try to sign in the user
	view.on('post', { action: 'signin' }, function(next) {
		if (!req.body.email || !req.body.password) {
			req.flash('error', 'Please enter your username and password.');
			return next();
		}

		var order = req.session.order_id;
		var onSuccess = function() {
			res.redirect('/account');
			hasRedirected = true;
		};

		var onFail = function() {
			req.flash('error', 'Your username or password are incorrect, please try again.');
			view.render('account/signin');
			next();
		};

		keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
	});

	if (hasRedirected === false ) {
		view.render('account/signin');
	}

};
