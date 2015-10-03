var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Thread Categories Model
 * =====================
 */

var ThreadCategory = new keystone.List('ThreadCategory', {
	track: true,
	autokey: { from: 'name', path: 'key', unique: true }
});

ThreadCategory.add({
	name: { type: String, required: true }
});


/**
 * Relationships
 * =============
 */

ThreadCategory.relationship({ ref: 'Thread', refPath: 'categories', path: 'threads' });


/**
 * Registration
 * ============
 */

ThreadCategory.register();
