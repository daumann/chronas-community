var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'spinoff';
	locals.page.title = 'Chronas: Sub Apps';

	view.render('site/spinoff');
	
}
