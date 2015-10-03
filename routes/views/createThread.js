var keystone = require('keystone'),
	Thread = keystone.list('Thread');

var User = keystone.list('User');

var log4js = require('log4js');
var logger = log4js.getLogger();


//logger.info("inside createThread")

exports = module.exports = function(req, res) {
/*
    $(".dropdown-menu li a").click(function(){
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    });
    */
 
    //logger.info("inside createThread export")
    
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'me';
	locals.page.title = 'Chronas: Create Thread';
	
	view.on('post', { action: 'create-thread' }, function(next) {

        var userQuery = User.model.findById(locals.user._id).select();
		// handle form
		var newThread = new Thread.model({
                rating: 1,
				author: locals.user.id,
				publishedDate: new Date()
			}),

			updater = newThread.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your new thread:'
			});
		
		// automatically pubish threads by admin users
		if (locals.user.isAdmin) {
			newThread.state = 'published';
		}

        //logger.info("before the updater",newThread,"and req body is" , req.body)
        
        
		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'title, image, content.extended, categories'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {

                userQuery.exec(function(err, myUser) {
                    if (myUser) {
                        req.body.threadCount = myUser.threadCount+1;
                        myUser.getUpdateHandler(req).process(req.body, { flashErrors: true, fields: 'threadCount' }, function(err) {
                        });
                    } 
                });
                
                
                
				newThread.notifyAdmins();
				req.flash('success', 'Your thread has been added' + ((newThread.state == 'draft') ? ' and will appear on the site once it\'s been approved' : '') + '.');
				return res.redirect('/talk/thread/' + newThread.slug);
			}
			next();
		});

	});
	
	view.render('site/createThread');
	
}
