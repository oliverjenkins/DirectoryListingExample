var keystone = require('keystone');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;
	locals.data = {
		title: 'Signed out'
	};
	locals.section = 'account';
	locals.form = req.body;

	view.on('init',function(next) {
		keystone.session.signout();
		next();
	});

	keystone.session.signout(req, res, function() {
		req.flash('error', 'You\'ve been signed out');

		res.redirect('/account/signin');
	});

};
