var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Listing Model
 * ==========
 */

var Listing = new keystone.List('Listing', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Listing.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Datetime, default: Date.now, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	categories: { type: Types.Relationship, ref: 'ListingCategory', many: true }
});

Listing.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});

Listing.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Listing.register();
