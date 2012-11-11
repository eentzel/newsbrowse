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
  NewsEntry.find({}).limit(5).execFind(function (err,data) {
    socket.emit('news', data);
  });

  var offset = 5;
  var tick = setInterval(function() {
    NewsEntry.find({}).skip(offset).limit(5).execFind(function (err,data) {
      socket.emit('news', data);
      offset += data.length;
    });
  }, 5000);

  socket.on('disconnect', function () {
    clearInterval(tick);
  });
});

console.log('Server running at http://0.0.0.0:8000/');
