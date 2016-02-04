var keystone = require('keystone'),
	async = require('async');

var Thread = keystone.list('Thread');
var User = keystone.list('User');

var log4js = require('log4js');
var logger = log4js.getLogger();

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	// Init locals
	locals.section = 'talk';
	locals.page.title = 'Chronas Community';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		threads: [],
		categories: []
	};
	
	// Load all categories
	view.on('init', function(next) {
		
		keystone.list('ThreadCategory').model.find().sort('name').exec(function(err, results) {
			
			if (err || !results.length) {
				return next(err);
			}
			
			locals.data.categories = results;
			
			// Load the counts for each category
			async.each(locals.data.categories, function(category, next) {
				
				keystone.list('Thread').model.count().where('category').in([category.id]).exec(function(err, count) {
					category.threadCount = count;
					next(err);
				});
				
			}, function(err) {
				next(err);
			});
			
		});
		
	});
	
	// Load the current category filter
	view.on('init', function(next) {
		
		if (req.params.category) {
			keystone.list('ThreadCategory').model.findOne({ key: locals.filters.category }).exec(function(err, result) {
				locals.data.category = result;
				next(err);
			});
		} else {
			next();
		}
		
	});
	
	// Load the threads
	view.on('init', function(next) {
		
		var q = keystone.list('Thread').model.find().where('state', 'published').sort('-publishedDate').populate('author categories');
		
		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}
		
		q.exec(function(err, results) {
            //logger.info("results in:", results)
            results.sort(function(a, b){
                return b.rating-a.rating
            });
            //logger.info("results out:", results)
			locals.data.threads = results;

            var iter = 0;
            for (var i=0; i<locals.data.threads.length; i++)  (function(i,length,errr){

                locals.data.threads[i].populateRelated('comments[author]', function () {
                    locals.data.threads[i].commentCount = locals.data.threads[i].comments.length;
                    iter++;
                    if ((iter) === length){
                        next(errr);
                    }
                });

            }) (i,locals.data.threads.length,err);

		});
		
	});

/*
    // Load all thread s for comment length
    view.on('init', function(next) {

        Thread.model.find()
            .where('state', 'published')
            .populate('author categories')
            .exec(function(err, thread) {

                if (err) return res.err(err);

                if (thread.state == 'published' || (req.user && req.user.isAdmin) || (req.user && thread.author && (req.user.id == thread.author.id))) {

                    logger.info("comments",thread)

                    locals.thread = thread;
                    locals.thread.populateRelated('comments[author]', function () {
                        locals.thread.comments.sort(function(a, b){
                            return b.rating-a.rating
                        });
                        next();
                    });
                    locals.page.title = 'Chronas: ' + thread.title;


                } else {
                    return res.notfound('Thread not found');
                }

            });

    });
*/
    view.on('post', { action: 'upvote-thread' }, function() {

        if(req.user !== undefined){
            var itemQuery = Thread.model.findById(req.body.tid).select();
            var userQuery = User.model.findById(req.user._id).select();

            itemQuery.exec(function(err, item) {
                userQuery.exec(function(err, myUser) {

                    if (!myUser) {
                        return res.redirect('/talk');
                    } else {
                        if (!item) {
                            return res.redirect('/talk');
                        } else {
                            req.body.rating = item.rating+1;
                            req.body.ratingsCount = myUser.ratingsCount+1;

                            if (myUser.idParticipated.indexOf(item._id + "UP") !== -1){
                                // UP is already pressed! Do nothing

                            }
                            else {
                                // UP is not yet pressed, proceed.

                                req.body.idParticipated = myUser.idParticipated+item._id + "UP";

                                if (myUser.idParticipated.indexOf(item._id + "DOWN") == -1){
                                    req.body.idParticipated = myUser.idParticipated+item._id + "UP";
                                }
                                else{
                                    myUser.idParticipated = myUser.idParticipated.replace(item._id + "DOWN","")
                                }


                                item.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'rating' }, function(err) {
                                    myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'ratingsCount,idParticipated' }, function(err) {
                                        return res.redirect('/talk');
                                    });
                                });
                            }
                        }
                    }
                });
            });
        }
        else {
            return res.redirect('/talk');
        }


    });

    view.on('post', { action: 'downvote-thread'}, function() {

        if(req.user !== undefined){
            var itemQuery = Thread.model.findById(req.body.tid).select();
            var userQuery = User.model.findById(req.user._id).select();

            itemQuery.exec(function(err, item) {
                userQuery.exec(function(err, myUser) {

                    if (!myUser) {
                        return res.redirect('/talk');
                    } else {
                        if (!item) {
                            return res.redirect('/talk');
                        } else {
                            req.body.rating = item.rating-1;
                            req.body.ratingsCount = myUser.ratingsCount+1;

                            if (myUser.idParticipated.indexOf(item._id + "DOWN") !== -1){
                                // DOWN is already pressed! Do nothing

                            }
                            else {
                                // DOWN is not yet pressed, proceed.

                                if (myUser.idParticipated.indexOf(item._id + "UP") == -1){
                                    req.body.idParticipated = myUser.idParticipated+item._id + "DOWN";
                                }
                                else{
                                    myUser.idParticipated = myUser.idParticipated.replace(item._id + "UP","")
                                }

                                item.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'rating' }, function(err) {
                                    myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'ratingsCount,idParticipated' }, function(err) {
                                        return res.redirect('/talk');
                                    });
                                });
                            }
                        }
                    }
                });
            });
        }
        else {
            return res.redirect('/talk');
        }
    });

    // Render the view
	view.render('site/talk');
	
}
