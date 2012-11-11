var env = require('./config/environment'),
    url = require('url'),
    feedparser = require('feedparser'),
    mongoose = require('mongoose'),
    request = require('request'),
    cheerio = require('cheerio'),
    prompt = require('prompt'),
    _ = require('underscore'),
    geocoder = require('geocoder');

_.str = require('underscore.string');

var Country = env.Country;
var NewsEntry = env.NewsEntry;
var City = env.City;

var feeds = ['http://feeds.reuters.com/Reuters/worldNews', 'http://feeds.reuters.com/Reuters/domesticNews'];

function toEntry(entry, loc, callback) {
  var story_image;
  var e = {
    guid : entry.guid,
    title : entry.title,
    description : entry.description.replace(/<[^>]*>/g, '').trim(),
    created_at : entry.pubdate,
    story_url : entry.link,
    source_feed: entry.meta.xmlurl
  };
  if(loc['latitude']) {
      e['location'] = [loc.latitude, loc.longitude];
      e['formatted_address'] = loc.name;
  }
  else if(loc['location']) {
    e['location'] = loc.location;
    e['formatted_address'] = loc.name;
  }

  request(e.story_url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      story_image = $('#articleImage img, #image0, #photoFullSize img').attr('src');
    }
    if (story_image) {
      e.main_image = story_image;
      callback(e);
    }
  });
}

function saveEntry(e) {
  NewsEntry.update({ guid : e.guid }, { $set: e }, {upsert: true}, function (err, numberAffected, raw) {
    if (err) throw(err);
    console.log('Entry saved: ' + JSON.stringify(e.guid));
  });
}


function handleEntry(entry) {
  var content = _.str.stripTags(entry.title + " - " + entry.description + " - " + entry.summary);
  var firstCountry = findCountry(content);
  // var aboutCities = _.map(aboutCountries, function(country) {
  //   return [country, findCity(content, country)];
  // });
  //var firstCountry = _.first(aboutCountries);
  console.log(firstCountry);
  if(firstCountry==undefined) return false; 
  findCity(entry, content, firstCountry);
}

function findCountry(content) {
  return _.find(countries, function(country) {
    if(content.search(new RegExp(country.name, "i"))>0) {
      //console.log(country.name + " => " + content);
      return true;
    } else {
      return false;
    }
  });
}

function findCity(entry, content, country) {
  //.where('asciiname').equals(/^New/)
  City.find({country_code : country.iso_code }).sort('-population').execFind(function(err, cities) {
    var mentionedCities = _.find(cities, function(city) {
      names = [city.asciiname].concat(city.alternatenames)
      return _.find(names, function(name) {
        if(content.search(new RegExp(name, "i"))>0) {
          // console.log(name + " => " + content);
          return true;
        } else {
          //console.log(name + " != " + content);
          return false;
        }
      }) ? true : false;
    });
    var firstCity = mentionedCities || country;
    toEntry(entry, firstCity, function(e) {
        saveEntry(e);
    });
  });
}

// Country.find({ iso_code : 'US' }).execFind(function(err, data) {
//   us = data.shift();
//   findCity({}, "This is about New York in the United States", us);
// });

function callbackCountries(err,data) {
  countries = data;
  _.each(feeds, function(s) {
    var source_feed = s;
    feedparser.parseUrl(source_feed)
    .on('article', handleEntry);
  });
}

Country.find({}).execFind(callbackCountries);