
var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  name: String,
  date: Date, 
  time: String,
  location: { lat: String, default: '', lng:String, default:'' },
  cat: String,
  details: {
    calsHr: { type: Number, default: '' },
    familyFriendly: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }, 
    experience: { type: String, default: '' }, 
    activityLevel:{ type: String, default: '' }, 
  },
  teacher: { type: String, default: 'Guest' },
   dateAdded: { type: Date, default: Date.now }

});


module.exports = mongoose.model('Event', eventSchema);
