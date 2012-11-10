var mongoose = require('mongoose');
var mongoUri = 'mongodb://user:password@host:27017/database';

mongoose.connect(mongoUri, function(err) {
  if (err) throw err;
  console.log('Connected')
});

var newsEntrySchema = new mongoose.Schema({
    title: String,
    topic: String,
    weighting: Number,
    loc : {lat: Number,  lng: Number },
});
var NewsEntry = mongoose.model('NewsEntry', newsEntrySchema);


var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  NewsEntry.find({}).limit(1).execFind(function (err,data) {
    res.end(JSON.stringify(data));
  });
}).listen(8000);

console.log('Server running at http://0.0.0.0:8000/');
