var keystone = require('keystone');

/**
 * ListingCategory Model
 * ==================
 */

var ListingCategory = new keystone.List('ListingCategory', {
	autokey: { from: 'name', path: 'key', unique: true }
});

ListingCategory.add({
	name: { type: String, required: true }
});

ListingCategory.relationship({ ref: 'Listing', path: 'categories' });

ListingCategory.register();
