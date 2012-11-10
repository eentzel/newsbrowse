var mongoose = require("mongoose");

var newsEntrySchema = new mongoose.Schema({
    guid : String,
    title: String,
    topic: String,
    description: String,
    created_at: Date,
    story_url: String,
    source_feed: String,
    weighting: Number,
    formatted_address: String,
    location :  Array
});
var NewsEntry = mongoose.model('NewsEntry', newsEntrySchema);

exports.NewsEntry = NewsEntry;
