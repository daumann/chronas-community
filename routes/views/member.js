var keystone = require('keystone'),
	moment = require('moment');

var User = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'members';
	locals.moment = moment;


	// Load the Member

	view.on('init', function(next) {
		User.model.findOne()
		.where('key', req.params.member)
		.exec(function(err, member) {
			if (err) return res.err(err);
			if (!member) {
				req.flash('info', 'Sorry, we couldn\'t find a matching member');
				return res.redirect('/members')
			}
			locals.member = member;

			locals.badgeList = [];

			// TODO: calculate badges and add them here!
			// Either presavelist or calculate!

				console.log("info:",locals.member);

				if (locals.member.mentoring["free"]){
					locals.badgeList.push({src: '/images/badges/cModerator.png', title: 'Interested in Community Moderating'});
				}
				if (locals.member.mentoring["paid"]){
					locals.badgeList.push({src: '/images/badges/hModerator.png', title: 'Interested in History Moderating'});
				}


//#C0B954 GOLD
//#C09454 BRONZE
//#A6A6A6 SILVER
//				$("#progress-bar").css("width", "50%");
				/*Math.round(num * 100) / 100
				 Total Logins
				 p= member.loginCount
				 */
				var goldColor = "#C0B954";
				var silverColor = "#A6A6A6";
				var bronzeColor = "#C09454";


				var loginCount = member.loginCount;
				if (loginCount < 10){
					var full=10; var start=0;
					//$("#mTotalLogins").find(".loadText").html(Math.round(loginCount/10 * 00100) / 100  + "%");
					//$("#mTotalLogins").find(".progress-bar").css("background-color",bronzeColor);
					locals.mTotalLoginsText=Math.round((loginCount-start)/full * 10000) / 100  + "%";
					locals.mTotalLoginsColor=bronzeColor;
				}
				else if (loginCount < 20){
					locals.badgeList.push({src: '/images/badges/b_login.png', title: 'Bronze Login Count: '+loginCount});
					var full=20; var start=10;
					//$("#mTotalLogins").find(".loadText").html(Math.round((loginCount-start)/full * 10000) / 100  +
					// "%");
					//$("#mTotalLogins").find(".progress-bar").css("background-color",silverColor);

					locals.mTotalLoginsText=Math.round((loginCount-start)/full * 10000) / 100  + "%";
					locals.mTotalLoginsColor=silverColor;
				}
				else if (loginCount < 100){
					locals.badgeList.push({src: '/images/badges/s_login.png', title: 'Silver Login Count: '+loginCount});
					var full=100; var start=20;
					//$("#mTotalLogins").find(".loadText").html(Math.round((loginCount-start)/full * 10000) / 100  +
					// "%");
					//$("#mTotalLogins").find(".progress-bar").css("background-color",goldColor);
					locals.mTotalLoginsText=Math.round((loginCount-start)/full * 10000) / 100  + "%";
					locals.mTotalLoginsColor=goldColor;
				}
				else if (loginCount >= 100){
					locals.badgeList.push({src: '/images/badges/g_login.png', title: 'Gold Login Count: '+loginCount});
					locals.mTotalLoginsText="100%";
					locals.mTotalLoginsColor=goldColor;
				}
				/*
				 Time spent in history
				 p= member.c_timeSpent + " min"
				 */

				var c_timeSpent = member.c_timeSpent;
				if (c_timeSpent < 10){
					var full=10; var start=0;
					locals.mTimeSpentText=Math.round((c_timeSpent-start)/full * 10000) / 100  + "%";
					locals.mTimeSpentColor=bronzeColor;
				}
				else if (c_timeSpent < 20){
					locals.badgeList.push({src: '/images/badges/b_timeSpent.png', title: 'Bronze Time Spent in History: '+c_timeSpent});
					var full=20; var start=10;
					locals.mTimeSpentText=Math.round((c_timeSpent-start)/full * 10000) / 100  + "%";
					locals.mTimeSpentColor=silverColor;
				}
				else if (c_timeSpent < 100){
					locals.badgeList.push({src: '/images/badges/s_timeSpent.png', title: 'Silver Time Spent in History: '+c_timeSpent});
					var full=100; var start=20;
					locals.mTimeSpentText=Math.round((c_timeSpent-start)/full * 10000) / 100  + "%";
					locals.mTimeSpentColor=goldColor;
				}
				else if (c_timeSpent >= 100){
					locals.badgeList.push({src: '/images/badges/g_timeSpent.png', title: 'Gold Time Spent in History: '+c_timeSpent});
					locals.mTimeSpentText="100%";
					locals.mTimeSpentColor=goldColor;
				}

				/*
				 Rated threads and comments
				 p= member.ratingsCount
				 */

				var ratingsCount = member.ratingsCount;
				if (ratingsCount < 10){
					var full=10; var start=0;
					locals.mRaterText=Math.round((ratingsCount-start)/full * 10000) / 100  + "%";
					locals.mRaterColor=bronzeColor;
				}
				else if (ratingsCount < 20){
					locals.badgeList.push({src: '/images/badges/b_judge.png', title: 'Bronze Judge: '+ratingsCount});
					var full=20; var start=10;
					locals.mRaterText=Math.round((ratingsCount-start)/full * 10000) / 100  + "%";
					locals.mRaterColor=silverColor;
				}
				else if (ratingsCount < 100){
					locals.badgeList.push({src: '/images/badges/s_judge.png', title: 'Silver Judge: '+ratingsCount});
					var full=100; var start=20;
					locals.mRaterText=Math.round((ratingsCount-start)/full * 10000) / 100  + "%";
					locals.mRaterColor=goldColor;
				}
				else if (ratingsCount >= 100){
					locals.badgeList.push({src: '/images/badges/g_judge.png', title: 'Gold Judge: '+ratingsCount});
					locals.mRaterText="100%";
					locals.mRaterColor=goldColor;
				}
				

				/*
				 Created threads and comments
				 p= member.threadCount + " and " + member
				 */

				var creatorCount = member.threadCount + member.commentsCount;
				if (creatorCount < 10){
					var full=10; var start=0;
					locals.mCreaterText=Math.round((creatorCount-start)/full * 10000) / 100  + "%";
					locals.mCreaterColor=bronzeColor;
				}
				else if (creatorCount < 20){
					locals.badgeList.push({src: '/images/badges/b_creator.png', title: 'Bronze Creator: '+creatorCount});
					var full=20; var start=10;
					locals.mCreaterText=Math.round((creatorCount-start)/full * 10000) / 100  + "%";
					locals.mCreaterColor=silverColor;
				}
				else if (creatorCount < 100){
					locals.badgeList.push({src: '/images/badges/s_creator.png', title: 'Silver Creator: '+creatorCount});
					var full=100; var start=20;
					locals.mCreaterText=Math.round((creatorCount-start)/full * 10000) / 100  + "%";
					locals.mCreaterColor=goldColor;
				}
				else if (creatorCount >= 100){
					locals.badgeList.push({src: '/images/badges/g_creator.png', title: 'Gold Creator: '+creatorCount});
					locals.mCreaterText="100%";
					locals.mCreaterColor=goldColor;
				}


			next();
		});
	});

	
	// Set the page title and populate related documents
	
	view.on('render', function(next) {
		if (locals.member) {
			locals.page.title = locals.member.name.full + ' is Chronas';
			locals.member.populateRelated('posts talks[meetup]', next);
		}
	});
	
	view.render('site/member');

}
