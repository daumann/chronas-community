var keystone = require('keystone');

var Thread = keystone.list('Thread');
var	ThreadComment = keystone.list('ThreadComment');
var User = keystone.list('User');

var log4js = require('log4js');
var logger = log4js.getLogger();

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	// Init locals
	locals.section = 'talk';
	locals.filters = {
		thread: req.params.thread
	};
	
	view.on('init', function(next) {
		Thread.model.findOne()
			.where('slug', locals.filters.thread)
			.populate('author categories')
			.exec(function(err, thread) {
				
				if (err) return res.err(err);
				if (!thread) return res.notfound('Thread not found');
				
				// Allow admins or the author to see draft threads
				if (thread.state == 'published' || (req.user && req.user.isAdmin) || (req.user && thread.author && (req.user.id == thread.author.id))) {
                 /*   
                    thread.comments.sort(function(a, b){
                        return b.rating-a.rating
                    });
                 */
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
	
	// Load recent threads
	view.query('data.threads',
		Thread.model.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author')
			.limit('4')
	);

    
	view.on('post', { action: 'create-comment' }, function(next) {

        var userQuery = User.model.findById(req.user._id).select();
        
		// handle form
		var newThreadComment = new ThreadComment.model({
                rating: 1,
				thread: locals.thread.id,
				author: locals.user.id
			}),
			updater = newThreadComment.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your comment:'
			});
			
		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'content'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {

                userQuery.exec(function(err, myUser) {

                    if (!myUser) {
                        req.flash('error', 'User could not be found.');
                        return res.redirect('/talk/thread/' + locals.thread.slug);
                    } else {
                        
                        req.body.commentsCount = myUser.commentsCount+1;
                        myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'commentsCount' }, function(err) {
                        });
                        
                    }});
				req.flash('success', 'Your comment has been added successfully.');
				return res.redirect('/talk/thread/' + locals.thread.slug);
			}
            next();
		});

	});

    view.on('post', { action: 'upvote-thread' }, function() {

        //logger.info("    upper   ")
        if(req.user !== undefined){

        var itemQuery = Thread.model.findById(req.body.tid).select();
        var userQuery = User.model.findById(req.user._id).select();

        itemQuery.exec(function(err, item) {
            userQuery.exec(function(err, myUser) {

                if (!myUser) {
                    req.flash('error', 'User could not be found.');
                    return res.redirect('/talk/thread/' + locals.thread.slug);
                } else {
                    if (!item) {
                        req.flash('error', 'Item ' + req.params.item + ' could not be found.');
                        return res.redirect('/talk/thread/' + locals.thread.slug);
                    } else {
                        //logger.info("loaded item: ", item)
                        req.body.rating = item.rating+1;
                        req.body.ratingsCount = myUser.ratingsCount+1;

                        if (myUser.idParticipated.indexOf(item._id + "UP") !== -1){
                            // UP is already pressed! Do nothing
                            
                        }
                        else {
                            // UP is not yet pressed, proceed.

                            if (myUser.idParticipated.indexOf(item._id + "DOWN") == -1){
                                req.body.idParticipated = myUser.idParticipated+item._id + "UP";
                            }
                            else{
                                myUser.idParticipated = myUser.idParticipated.replace(item._id + "DOWN","")
                            }
                            
                            item.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'rating' }, function(err) {
                                myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'ratingsCount,idParticipated' }, function(err) {
                                    if (err) {
                                        req.flash('error', 'Item ' + item + ' could not be found.');
                                    }
                                    req.flash('success', 'Up-vote successful. Your personal rating count has been incremented.');
                                    return res.redirect('/talk/thread/' + locals.thread.slug);
                                });
                            });
                        }
                    }
                }
            });
        });

        } else {
            return res.redirect('/talk/thread/' + locals.thread.slug);
        }
    });

    view.on('post', { action: 'downvote-thread'}, function() {

        if (req.user !== undefined){

        var itemQuery = Thread.model.findById(req.body.tid).select();
        var userQuery = User.model.findById(req.user._id).select();

        itemQuery.exec(function(err, item) {
            userQuery.exec(function(err, myUser) {

                if (!myUser) {
                    req.flash('error', 'User could not be found.');
                    return res.redirect('/talk/thread/' + locals.thread.slug);
                } else {
                    if (!item) {
                        req.flash('error', 'Item ' + req.params.item + ' could not be found.');
                        return res.redirect('/talk/thread/' + locals.thread.slug);
                    } else {
                        //logger.info("loaded item: ", item)
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
                                    if (err) {
                                        req.flash('error', 'Item ' + item + ' could not be found.');
                                    }
                                    req.flash('success', 'Down-vote successful. Your personal rating count has been incremented.');
                                    return res.redirect('/talk/thread/' + locals.thread.slug);
                                });
                            });
                        }
                    }
                }
            });
        });

        } else {
            return res.redirect('/talk/thread/' + locals.thread.slug);
        }
    });

    view.on('post', { action: 'upvote-comment' }, function() {
       // logger.info("       ******    in that: ", locals,"\n\t\n\n",req.params)
       // locals.thread.comments[0].rating
        //logger.info("    upper   ")

        if (req.user !== undefined){

        var itemQuery = ThreadComment.model.findById(req.body.cid).select();
        var userQuery = User.model.findById(req.user._id).select();
    
        itemQuery.exec(function(err, item) {
            userQuery.exec(function(err, myUser) {

                if (!myUser) {
                    req.flash('error', 'User could not be found.');
                    return res.redirect('/talk/thread/' + locals.thread.slug);
                } else {
                    if (!item) {
                        req.flash('error', 'Item ' + req.params.item + ' could not be found.');
                        return res.redirect('/talk/thread/' + locals.thread.slug);
                    } else {
                        //logger.info("loaded item: ", item)
                        req.body.rating = item.rating+1;
                        req.body.ratingsCount = myUser.ratingsCount+1;

                        if (myUser.idParticipated.indexOf(item._id + "UP") !== -1){
                            // UP is already pressed! Do nothing

                        }
                        else {
                            // UP is not yet pressed, proceed.

                            if (myUser.idParticipated.indexOf(item._id + "DOWN") == -1){
                                req.body.idParticipated = myUser.idParticipated+item._id + "UP";
                            }
                            else{
                                myUser.idParticipated = myUser.idParticipated.replace(item._id + "DOWN","")
                            }
                            
                            item.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'rating' }, function(err) {
                                myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'ratingsCount,idParticipated' }, function(err) {
                                    if (err) {
                                        req.flash('error', 'Item ' + item + ' could not be found.');
                                    }
                                    req.flash('success', 'Up-vote successful. Your personal rating count has been incremented.');
                                    return res.redirect('/talk/thread/' + locals.thread.slug);
                                });
                            });
                        }
                    }
                }
            });
        });

        } else {
            return res.redirect('/talk/thread/' + locals.thread.slug);
        }
        
    });

    view.on('post', { action: 'downvote-comment'}, function() {

        //logger.info("    lower   ")

        if (req.user !== undefined){

        var itemQuery = ThreadComment.model.findById(req.body.cid).select();
        var userQuery = User.model.findById(req.user._id).select();
        
        itemQuery.exec(function(err, item) {
            userQuery.exec(function(err, myUser) {

                if (!myUser) {
                    req.flash('error', 'User could not be found.');
                    return res.redirect('/talk/thread/' + locals.thread.slug);
                } else {                    
                    if (!item) {
                        req.flash('error', 'Item ' + req.params.item + ' could not be found.');
                        return res.redirect('/talk/thread/' + locals.thread.slug);
                    } else {
                        //logger.info("loaded item: ", item)
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
                                    if (err) {
                                        req.flash('error', 'Item ' + item + ' could not be found.');
                                    }
                                    req.flash('success', 'Down-vote successful. Your personal rating count has been incremented.');
                                    return res.redirect('/talk/thread/' + locals.thread.slug);
                                });
                            });
                        }
                    }   
                }
            });
        });
        } else {
            return res.redirect('/talk/thread/' + locals.thread.slug);
        }
    });

	// Render the view
	view.render('site/thread');
	
}
