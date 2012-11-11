var env = require('./config/environment'),
    url = require('url'),
    feedparser = require('feedparser'),
    mongoose = require('mongoose'),
    prompt = require('prompt'),
    _ = require('underscore'),
    geocoder = require('geocoder');

var Country = env.Country;
var NewsEntry = env.NewsEntry;

var feeds = ['http://feeds.bbci.co.uk/news/world/rss.xml', 
'http://www.nytimes.com/services/xml/rss/nyt/World.xml', 'http://feeds.washingtonpost.com/rss/politics'];

//var source_feed = 'http://feeds.bbci.co.uk/news/world/rss.xml';

function toEntry(entry, loc) {
  var thumbnail = _.chain(entry.enclosures).pluck('url').filter(function(u) {
                    return /jpg$/.test(u);
                  }).value()[0];
  e = {
    guid : entry.guid,
    title : entry.title,
    description : entry.description.replace(/<[^>]*>/g, '').trim(),
    created_at : entry.pubdate,
    story_url : entry.link,
    thumb_url: thumbnail || "",
  };
  if(loc.location) {
    e['location'] = loc.location;
    e['formatted_address'] = loc.name;
  }
  return e;
}

function saveEntry(e) {
  NewsEntry.update({ guid : e.guid }, { $set: e }, {upsert: true}, function (err, numberAffected, raw) {
    if (err) throw(err);
    //console.log('The number of updated documents was %d', numberAffected);
    //console.log('The raw response from Mongo was ', raw);
    console.log('Entry saved: ' + JSON.stringify(e.guid));
  });
}


function handleEntry(entry) {
  var content = entry.title + " - " + entry.description + " - " + entry.summary;
  console.log(entry.title);
  countries.every(function(country) {
    //console.log(content.search(new RegExp(country.name, "i")));
    if(content.search(new RegExp(country.name, "i"))>0) {
      console.log(country.name + " => " + content);
      e = toEntry(entry, country);
      saveEntry(e);
      return false;
    } else {
      //console.log(country.name);
      return true;
    }
  });
}

function callbackCountries(err,data) {
  countries = data;
  _.each(feeds, function(s) {
    var source_feed = s;
    feedparser.parseUrl(source_feed)
    .on('article', handleEntry);
  });
}

Country.find({}).execFind(callbackCountries);