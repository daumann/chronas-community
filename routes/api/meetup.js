var _ = require('underscore');
var async = require('async');
var keystone = require('keystone');
var Meetup = keystone.list('Meetup');
var RSVP = keystone.list('RSVP');
var User = keystone.list('User');


exports = module.exports = function(req, res) {

	var meetupId = req.params.id;

	var rtn = {
		meetup: {},
		attendees: [],
		rsvp: {
			exists: false,
			attending: false
		}
	};

	async.series([

		function(next) {
			keystone.list('Meetup').model.findById(meetupId, function(err, meetup) {
				if (err) {
					console.log('Error finding meetup: ', err)
				}
				
				
				
				rtn.meetup = meetup;
				return next();
			});
		},

		function(next) {
			if (!rtn.meetup || !req.user) return next();
			keystone.list('RSVP').model.findOne()
				.where('who', req.user.id)
				.where('meetup', rtn.meetup.id)
				.exec(function(err, rsvp) {
					if (err) {
						console.log('Error finding current user RSVP', err);
					}
					if (rsvp) {
						rtn.rsvp.exists = true;
						rtn.rsvp.attending = rsvp.attending;
					}
					return next(err);
				});
		},

		function(next) {
			//if (!rtn.meetup) return next();
			keystone.list('User').model.find()
				.sort('-lastRSVP')
				.where('isPublic', true)
				.exec(function(err, results) {
					if (err) {
						//console.log('Error loading attendee RSVPs', err);
					}
					if (results) {
						//console.log('ATTENDEEEE SUCCESS', results);
						rtn.attendees = _.compact(results.map(function(rsvp) {
							//if (!rsvp.who) return;
							return {
								url: rsvp.isPublic ? rsvp.url : false,
								photo: rsvp.photo.exists ? rsvp._.photo.thumbnail(80,80) : rsvp.avatarUrl || '/images/avatar.png',
								name: rsvp.name
							};
						}));
					}
					return next();
				});
		},

	], function(err) {
		if (err) {
			rtn.err = err;
		}
		res.json(rtn);
	});
}
