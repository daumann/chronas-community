var keystone = require('keystone');
var User = keystone.list('User');

var log4js = require('log4js');
var logger = log4js.getLogger();

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.section = 'history';

    view.render('site/history');

}
