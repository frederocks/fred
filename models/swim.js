var mongoose = require("mongoose");


var swimSchema = new mongoose.Schema ({
	_id: String,
    address:{
    building:{type: String}, 
    coord:Array, 
    street:String,
    zipcode:String	
    },
    borough: String,
    cuisine: String,
    grade: [
    {
    	date: Date, 
    	grade: String, 
    	score:Number
    }
    ], 
    name: String, 
    restaurant_id: String
});

module.exports = mongoose.model('restaurant', swimSchema);

