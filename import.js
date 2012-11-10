var env = require('./config/environment'),
    url = require('url'),
    feedparser = require('feedparser'),
    mongoose = require('mongoose'),
    prompt = require('prompt'),
    _ = require('underscore'),
    geocoder = require('geocoder');

var Country = env.Country;
var NewsEntry = env.NewsEntry;

function processEntries() {
  var entry = entries.shift();
  NewsEntry.count({guid: entry.guid}, function(err, c)
    {
         if(c == 0) {
           console.log("Title: " + entry.title);
           console.log("Description: " + entry.description);
           prompt.start();
           prompt.get(['location'], function (err, result) {
             console.log('Command-line input received:');
             console.log('location: ' + result.location);
             geocoder.geocode(result.location, function ( err, data ) {
               var thumbnail = _.chain(entry.enclosures).pluck('url').filter(function(u) {
                   return /jpg$/.test(u);
               }).value()[0];
               latlng = data.results.shift();
               e = new NewsEntry({
                 guid : entry.guid,
                 title : entry.title,
                 description : entry.description,
                 created_at : entry.pubdate,
                 story_url : entry.link,
                 thumb_url: thumbnail,
                 source_feed : 'http://www.nytimes.com/services/xml/rss/nyt/World.xml',
                 formatted_address : data.formatted_address,
                 location : [latlng.geometry.location.lat, latlng.geometry.location.lng]
               });
               e.save(function (err) {
                 if (err) throw err;
                 console.log('Entry saved: ' + JSON.stringify(e));
               });
               if (entries.length > 0) processEntries()
             });
           });
         } else {
           processEntries()
         }
    });
}

var entries = []

feedparser.parseUrl("http://www.nytimes.com/services/xml/rss/nyt/World.xml")
  .on('article', function(entry) {
    entries.push(entry);
    //console.log(JSON.stringify(entry));
  })
  .on('complete', function(meta, articles) {
    //console.log(JSON.stringify(articles));
    entries = articles;
    processEntries();
  });
