var FETCH_FREQUENCY=process.env.FETCH_FREQUENCY || 300000;
var FIRST_PUSH_SIZE=process.env.FIRST_PUSH_SIZE || 100;
var PUSH_SIZE=process.env.PUSH_SIZE || 20;
var PUSH_FREQUENCY=process.env.PUSH_FREQUENCY || 5000;

var application_root = __dirname,
    express = require("express"),
    path = require("path");
var io = require('socket.io');
var env = require('./config/environment');

var app = express(),
   server = require('http').createServer(app),
   io = io.listen(server);

var Country = env.Country;
var NewsEntry = env.NewsEntry;

var reuters = require('./lib/reuters');

// Config

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: path.join(application_root, "public") }));
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/api/v1/stories/top', function (req, res) {
  NewsEntry.find({}).limit(50).execFind(function (err,data) {
    res.json(data);
  });
});

app.get('/api/v1/stories/near', function (req, res) {
  var lat = parseFloat(req.query["lat"] || '-37.860283');
  var lng = parseFloat(req.query["lng"] || '145.079616');
  var maxDistance = parseFloat(req.query["max_distance"] || '0.1');
  NewsEntry.find({location: { "$nearSphere" : [lat, lng], "$maxDistance" : maxDistance } }).limit(50).execFind(function (err,data) {
    res.json(data);
  });
});

app.get('/api/v1/stories/within', function (req, res) {
  var bottomleftlat = parseFloat(req.query["bottomleftlat"] || '-37.860283');
  var bottomleftlng = parseFloat(req.query["bottomleftlng"] || '145.079616');
  var toprightlat = parseFloat(req.query["toprightlat"] || '-37.860283');
  var toprightlng = parseFloat(req.query["toprightlng"] || '145.079616');
  NewsEntry.find({location: { "$within" : { "$box" : [[bottomleftlat, bottomleftlng],[toprightlat, toprightlng]] } } }).limit(50).execFind(function (err,data) {
    res.json(data);
  });
});

server.listen(8000);

io.sockets.on('connection', function (socket) {
  var offset = 0;
  var push = function(limit) {
    limit = (typeof limit === "undefined") ? PUSH_SIZE : limit;
    NewsEntry.find({}).skip(offset).limit(limit).execFind(function (err,data) {
      socket.emit('news', data);
      offset += data.length;
    });
  };

  push(FIRST_PUSH_SIZE);
  var tick = setInterval(push, PUSH_FREQUENCY);

  socket.on('disconnect', function () {
    clearInterval(tick);
  });
});

reuters.fetchFeeds();
setInterval(function() {
  reuters.fetchFeeds();
}, FETCH_FREQUENCY);

console.log('Server running at http://0.0.0.0:8000/');
