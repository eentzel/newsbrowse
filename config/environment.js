var mongoose = require('mongoose');

var mongoUri = 'mongodb://user:password@host:27017/database';

//mongoose.set('debug', true);
mongoose.connect(mongoUri, function(err) {
  if (err) throw err;
});

exports.City = require('../lib/models/city').City;
exports.Country = require('../lib/models/country').Country;
exports.NewsEntry = require('../lib/models/news_entry').NewsEntry;