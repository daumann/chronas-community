var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types;

/**
 * Threads Model
 * ===========
 */

var Thread = new keystone.List('Thread', {
	map: { name: 'title' },
	track: true,
	autokey: { path: 'slug', from: 'title', unique: true }
});

Thread.add({
    rating: { type: Types.Number},
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true },
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	categories: { type: Types.Relationship, ref: 'ThreadCategory', many: true }
});

/**
 * Virtuals
 * ========
 */

Thread.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});


/**
 * Relationships
 * =============
 */

Thread.relationship({ ref: 'ThreadComment', refPath: 'thread', path: 'comments' });


/**
 * Notifications
 * =============
 */

Thread.schema.methods.notifyAdmins = function(callback) {
	
	var thread = this;
	
	// Method to send the notification email after data has been loaded
	var sendEmail = function(err, results) {
		
		if (err) return callback(err);
		
		async.each(results.admins, function(admin, done) {
			
			new keystone.Email('admin-notification-new-thread').send({
				admin: admin.name.first || admin.name.full,
				author: results.author ? results.author.name.full : 'Somebody',
				title: thread.title,
				keystoneURL: 'http://www.chronas.org/keystone/thread/' + thread.id,
				subject: 'New Thread to Chronas'
			}, {
				to: admin,
				from: {
					name: 'Chronas',
					email: 'noreply@chronas.com'
				}
			}, done);
			
		}, callback);
		
	}
	
	// Query data in parallel
	async.parallel({
		author: function(next) {
			if (!thread.author) return next();
			keystone.list('User').model.findById(thread.author).exec(next);
		},
		admins: function(next) {
			keystone.list('User').model.find().where('isAdmin', true).exec(next)
		}
	}, sendEmail);
	
}


/**
 * Registration
 * ============
 */

Thread.defaultSort = '-publishedDate';
Thread.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Thread.register();
