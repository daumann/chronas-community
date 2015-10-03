var _ = require('underscore');
var async = require('async');
var keystone = require('keystone');
var Meetup = keystone.list('Meetup');
var RSVP = keystone.list('RSVP');
var User = keystone.list('User');

var log4js = require('log4js');
var logger = log4js.getLogger();

exports = module.exports = function(req, res) {

	logger.info("!    re1q0   !");
	logger.info(res.locals.user._id + " spent 1min");
	logger.info("!    req1   !");

	var userQuery = User.model.findById(res.locals.user._id).select();

	userQuery.exec(function(err, myUser) {
		if (!myUser) {
		} else {
			req.body.c_timeSpent = myUser.c_timeSpent+1;
			myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'c_timeSpent' }, function(err) {});
		}
	});
	return res.apiResponse({ success: true });
}