var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    mongoose = require('mongoose');

var app = express();

// Database
var mongoUri = 'mongodb://user:password@host:27017/database';

mongoose.connect(mongoUri, function(err) {
  if (err) throw err;
});

var newsEntrySchema = new mongoose.Schema({
    title: String,
    topic: String,
    weighting: Number,
    loc : {lat: Number,  lng: Number },
});
var NewsEntry = mongoose.model('NewsEntry', newsEntrySchema);

// Config

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function (req, res) {
  NewsEntry.find({}).limit(1).execFind(function (err,data) {
    res.send(JSON.stringify(data));
  });
});

app.listen(8000);

console.log('Server running at http://0.0.0.0:8000/');
