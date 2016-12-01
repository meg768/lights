var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var YahooWeather = require('./yahoo-weather.js');


var WeatherAnimation = module.exports = function(matrix) {


	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			var yahoo = new YahooWeather();

			matrix.emit('emoji', {id:78, priority:priority});

			yahoo.fetch().then(function(weather) {
				matrix.emit('text', {text:sprintf('Idag %s°', weather.condition.temp), textColor:'blue'});
				matrix.emit('text', {text:sprintf('I morgon %s°/%s°', weather.forecast[1].low, weather.forecast[1].high), textColor:'blue'});

				resolve();
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inget väder tillgängligt'});
				console.log('Error fetching weather.');
				console.log(error);
				resolve();
			});
		});


	};
};
