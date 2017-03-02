var keystone = require('keystone'),
    moment = require('moment'),
    _ = require('underscore');

var log4js = require('log4js');
var logger = log4js.getLogger();

var Meetup = keystone.list('Meetup'),
    Post = keystone.list('Post'),
    RSVP = keystone.list('RSVP'),
    User = keystone.list('User');

exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res),
        locals = res.locals;
    
    locals.section = 'home';
    locals.meetup = {};
    locals.page.title = 'Chronas';
    
    locals.rsvpStatus = {};

    locals.user = req.user;
    
    // Load the first, NEXT meetup
    
    view.on('init', function(next) {

        Meetup.model.findOne()
            .where('state', 'active')
            .sort('-startDate')
            .exec(function(err, activeMeetup) {
                locals.activeMeetup = activeMeetup;
                next();
            });
            
    });
    
    
    // Load the first, PAST meetup
    
    view.on('init', function(next) {
        Meetup.model.findOne()
            .where('state', 'past')
            .sort('-startDate')
            .exec(function(err, pastMeetup) {
                locals.pastMeetup = pastMeetup;
                next();
            });
            
    });



    // Load Organisers
    view.on('init', function(next) {
        User.model.find()
            .sort('name.first')
            .where('isPublic', true)
            .where('isOrganiser', true)
            .exec(function(err, organisers) {
                if (err) res.err(err);
                locals.organisers = organisers;
                next();
            });
    });


    // Load Speakers

    view.on('init', function(next) {
        User.model.find()
            .sort('-talkCount name.first')
            .where('isPublic', true)
            .where('talkCount').gt(0)
            .exec(function(err, speakers) {
                if (err) res.err(err);
                locals.speakers = speakers;
                next();
            });
    });


    // Pluck IDs for filtering Community

    view.on('init', function(next) {
        locals.organiserIDs = _.pluck(locals.organisers, 'id');
        locals.speakerIDs = _.pluck(locals.speakers, 'id');
        //logger.info("prepared locals: ", locals)
        next();
    });
    
    // Load Community

    view.on('init', function(next) {
        User.model.find()
            .sort('-lastRSVP')
            .where('isPublic', true)
            .where('_id').nin(locals.organiserIDs)
            .where('_id').nin(locals.speakerIDs)
            .exec(function(err, community) {
				if (err) res.err(err);
				locals.community = community;
				var moderatorCount = 0;
				for (var i=0; i < community.length; i++){
					if (community[i].mentoring["available"]) moderatorCount++;
				}
				
				locals.moderatorLength = moderatorCount;
				next();
            });
    });



    // Load an RSVP
    
    view.on('init', function(next) {

        if (!req.user || !locals.activeMeetup) return next();
        
        RSVP.model.findOne()
            .where('who', req.user._id)
            .where('meetup', locals.activeMeetup)
            .exec(function(err, rsvp) {
                locals.rsvpStatus = {
                    rsvped: rsvp ? true : false,
                    attending: rsvp && rsvp.attending ? true : false
                }
                return next();
            });
            
    });
    
    // Decide which to render
    
    view.on('render', function(next) {
        
        locals.meetup = locals.activeMeetup || locals.pastMeetup;
        if (locals.meetup) {
            locals.meetup.populateRelated('talks[who] rsvps[who]', next);
        } else {
            next();
        }
        
    });


    view.render('site/index');
    
}
