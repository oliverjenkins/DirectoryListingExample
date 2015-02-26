var keystone = require('keystone'),
	 Paypal = require('paypal-recurring'),
	 User = keystone.list('User');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals,
		hasRedirected = false;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'account';

	// Render the view
	view.on('init', function(next) {
		var paypal = new Paypal({
			username:  process.env.PAYPAL_API_USERNAME,
			password:  process.env.PAYPAL_API_PASSWORD,
			signature: process.env.PAYPAL_API_SIGNATURE,
		});

		if (req.params.method) {
			if (req.params.method === 'success') {
				// User has comeback from paypal. We should have a token to look up a user against
				// Save this and its associated PayerID against the account which previously had the token assigned to it
				// then redirect to the account home page, which will see if the current user has been authenticated
				keystone.list('User').model.findOneAndUpdate(
					{
						token: req.query.token
					},
					{
						hasSubscription: true,
						payerID: req.query.PayerID
					},
					{ new: true },
					function(err,updatedUser) {
						console.log('updatedUser', updatedUser);
						req.user = updatedUser;
						res.redirect('/account');
						hasRedirected = true;
					});
			} else {
				next();
			}

		} else {
			// We are going to authenticate this user with paypal
			paypal.authenticate({
				RETURNURL:                      process.env.PAYPAL_CALLBACK_OK,
				CANCELURL:                      process.env.PAYPAL_CALLBACK_CANCEL,
				PAYMENTREQUEST_0_AMT:           process.env.PAYPAL_AMOUNT,
				L_BILLINGAGREEMENTDESCRIPTION0: process.env.PAYPAL_MESSAGE
			}, function(err, data, url) {

				if (err) {
					req.flash('error', err);
				} else {
					// Store the generated data.token against the current users account
					req.user.token = data.TOKEN;

					req.user.save(function(err) {
						if (!err) {
							console.log('save user errr',err);
							res.redirect(302, url);
							hasRedirected = true;
						} else {
							req.flash('error', err);
						}
					})
				}
			});
		}
	});

	if (hasRedirected === false) {
		view.render('account/home');
	}
};
