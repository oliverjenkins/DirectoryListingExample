var keystone = require('keystone'),
	User = keystone.list('User');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		hasRedirected = false,
		locals = res.locals;

	// Set locals
	locals.section = 'account';
	locals.formData = req.body || {};
	locals.validationErrors = {};

	view.on('init', function(next) {
		if (req.user) {
			req.flash('error', 'You are already signed in.');
			res.redirect('/account');
			hasRedirected = true;
		}
	});

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

	view.on('post', {action: 'register'}, function(next) {
		//TODO: Fix this embarrassment
		if (!req.body.name || req.body.name.length < 4) {
			locals.validationErrors.name =  { message: 'You must enter your full name' };
		}
		if (!req.body.email || keystone.utils.isEmail(req.body.email) === false) {
			locals.validationErrors.email = { message: 'A valid email is required' } ;
		}
		if (!req.body.password || req.body.password.length < 6) {
			locals.validationErrors.password =  { message: 'You must supply a password of more than 6 characters' } ;
		}
		if (!req.body.password_confirm || req.body.password != req.body.password_confirm) {
			locals.validationErrors.password_confirm =  { message: 'Password confirmation must match the password' } ;
		}

		if (Object.keys(locals.validationErrors).length) {
			req.flash('error', 'Failed to create account');
			next();
		} else {

			// Nothing obvious with the registration fields so just check to see if we can register the account
			keystone.list('User').model.findOne({
					email: req.body.email
			}).exec(function(err,result) {
				if (err || result !== null) {
					if (err) {
						req.flash('error', err);
					} else {
						req.flash('error', 'An account already exists for this email, please login');
						locals.validationErrors.email = { message: 'An account already exists for this email, please login' } ;
					}

					next();
				} else {
					var nameParts = (req.body.name.indexOf(' '))?req.body.name.match(/^(\S+)\s(.*)/).slice(1):[req.body.name,''];

					var User = keystone.list('User').model,
						newUser = new User({
							name: {
								first: nameParts[0],
								last: nameParts[1]
							},
							email: req.body.email,
							password: req.body.password
						});


					newUser.save(function(err) {
						if (err) {
							locals.validationErrors = err.errors;
							next();
						} else {
							var onSuccess = function() {
								res.redirect('/account');
								hasRedirected = true;
							};

							var onFail = function(e) {
								req.flash('error', 'There was a problem creating your account, please try again.');
								next();
							};

							keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
						}
					});
				}
			});
		}
	});

	if (hasRedirected === false ) {
		view.render('account/signin');
	}
};
