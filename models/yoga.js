
var mongoose = require('mongoose');
var request = require('request');
// mongoose.connect('mongodb://localhost:27017/yoga');
// mongoose.connection.on('error', function() {
//   console.error('MongoDB Connection Error. Make sure MongoDB is running.');
// });
var conn = mongoose.createConnection('mongodb://localhost:27017/data');
conn.model('Yoga', new Schema({time: String,_class: String,teacher: String}));

var yogaSchema = new mongoose.Schema({
  time: String,
  _class: String,
  room: String,
  teacher: String, 
  // description: String,
  // phone: Array,
  // website: String {type: String, default: '', lowercase: true},
  // url: String

  // profile: {
  //   name: { type: String, default: '' },
  //   gender: { type: String, default: '' },
  //   location: { type: String, default: '' },
  //   website: { type: String, default: '' },
  //   picture: { type: String, default: '' }
  // },

  // resetPasswordToken: String,
  // resetPasswordExpires: Date
});

module.exports = mongoose.model('yoga', yogaSchema);
