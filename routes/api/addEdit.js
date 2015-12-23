var _ = require('underscore');
var async = require('async');
var keystone = require('keystone');
var Meetup = keystone.list('Meetup');
var RSVP = keystone.list('RSVP');
var User = keystone.list('User');

var log4js = require('log4js');
var logger = log4js.getLogger();

exports = module.exports = function(req, res) {

    var userId = req.params.id;
    var addAmount = req.params.am;

    if (userId !== undefined && !isNaN(addAmount)) {
        var userQuery = User.model.findOne({ email: userId }, function(err, myUser) {

            if (!myUser) {
            } else {
                req.body.c_modCount = myUser.c_modCount+parseInt(addAmount);
                myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'c_modCount' }, function(err) {});
            }

        });


    /*.model.findById(userId).select();

        userQuery.exec(function(err, myUser) {
            if (!myUser) {
            } else {
                req.body.c_modCount = myUser.c_modCount+1;
                myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'c_modCount' }, function(err) {});
            }
        });
        */

    }
    return res.apiResponse({ success: true });
}
