var mongoose = require("mongoose");

var citySchema = new mongoose.Schema({
	"geonameid" : String,
	"name" : String,
	"asciiname" : String,
	"alternatenames" : Array,
	"latitude" : Number,
	"longitude" : Number,
	"feature_class" : String,
	"feature_code" : String,
	"country_code" : String,
	"cc2" : String,
	"admin1_code" : String,
	"admin2_code" : String,
	"admin3_code" : String,
	"admin4_code" : String,
	"population" : Number,
	"elevation" : String,
	"dem" : String,
	"timezone" : String,
	"modification_date" : String
});
var City = mongoose.model('City', citySchema);
exports.City = City;
