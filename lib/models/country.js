var mongoose = require("mongoose");

var countrySchema = new mongoose.Schema({
    name : String,
    iso_code : String,
    location : Array
});
var Country = mongoose.model('Country', countrySchema);
exports.Country = Country;
