var sprintf    = require('yow').sprintf;
var suncalc    = require('suncalc');

var Module = function(now, longitude, lattitude) {

	if (longitude == undefined)
		longitude = 55.7;


	if (lattitude == undefined)
		lattitude = 13.1833333;

	if (now == undefined)
		now = new Date();

	this.getTime = function(name, offset) {
		var times = suncalc.getTimes(now, longitude, lattitude);
		var time  = times[name].getTime();

		if (offset == undefined)
			offset = 0;

		if (offset != undefined)
			time = new Date(time + 1000 * 60 * offset);

		return time;

	};

	this.sunset = function(offset) {
		return this.getTime('sunset', offset);
	}

	this.sunrise = function(offset) {
		return this.getTime('sunrise', offset);
	}

	this.dusk = function(offset) {
		return this.getTime('dusk', offset);
	}

	this.dawn = function(offset) {
		return this.getTime('dawn', offset);
	}


	console.log('sunset', this.sunset());
	console.log('sunrise', this.sunrise());
	console.log('dusk', this.dusk());
	console.log('dawn', this.dawn());

}

module.exports = new Module();
