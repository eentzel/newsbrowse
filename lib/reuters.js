var env = require('../config/environment'),
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

var feeds = ['http://feeds.reuters.com/Reuters/worldNews', 'http://feeds.reuters.com/Reuters/domesticNews',
'http://mf.feeds.reuters.com/reuters/UKWorldNews', 'http://mf.feeds.reuters.com/reuters/UKdomesticNews'];

function cleanDescription(desc) {
  return desc.replace(/<[^>]*>/g, '').replace(/Related Stories.*/, '').trim();
}

function toEntry(entry, loc, callback) {
  var story_image;
  var e = {
    guid : entry.guid,
    title : entry.title.replace(/"/g, "'"),
    description : cleanDescription(entry.description),
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
    }
    callback(e);
  });
}

function saveEntry(e) {
  NewsEntry.update({ title : e.title }, { $set: e }, {upsert: true}, function (err, numberAffected, raw) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Entry saved: ' + JSON.stringify(e.guid));
    }
  });
}


function handleEntry(entry) {
  //var content = _.str.stripTags(entry.title + " - " + entry.description + " - " + entry.summary);
  //var firstCountry = findCountry(content);
  // var aboutCities = _.map(aboutCountries, function(country) {
  //   return [country, findCity(content, country)];
  // });
  //var firstCountry = _.first(aboutCountries);
  //console.log(firstCountry);
  //if(firstCountry==undefined) return false;
  if(entry.description.search('(Reuters)')>0) {
    var result = _.str.strip(_.first(_.str.words(entry.description, '(Reuters)')));
    var city  = _.first(_.first(result.split(',')).split('/'));
    findCity(entry, city);
  }
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

function findCityWithCountry(entry, content, country) {
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

function findCity(entry, cityname) {
  //.where('asciiname').equals(/^New/)
  City.find({asciiname : new RegExp(cityname, "i")}).sort('-population').execFind(function(err, cities) {
    var firstCity = _.first(cities);
    if(firstCity) {
      toEntry(entry, firstCity, function(e) {
          saveEntry(e);
      });
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

function fetchFeeds() {
  Country.find({}).execFind(callbackCountries);
}

module.exports.fetchFeeds = fetchFeeds;
  