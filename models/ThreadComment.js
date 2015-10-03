var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Post Comments Model
 * ===================
 */

var ThreadComment = new keystone.List('ThreadComment', {
	nocreate: true
});

ThreadComment.add({
    rating: { type: Types.Number},
	thread: { type: Types.Relationship, ref: 'Thread', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	date: { type: Types.Date, default: Date.now, index: true },
	content: { type: Types.Markdown }
});


/**
 * Registration
 * ============
 */

ThreadComment.defaultColumns = 'rating, post, author, date|20%';
ThreadComment.register();
