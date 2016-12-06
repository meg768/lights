var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var Timer      = require('yow/timer');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var MongoDB    = require('mongodb');



var WeatherAnimation = module.exports = function(matrix) {

	var _locations = [];
	var _timer = new Timer();



	function getLocations() {

		if (_locations.length > 0)
			return Promise.resolve(_locations);

		return new Promise(function(resolve, reject) {

			MongoDB.connect('mongodb://app-o.se:27017/ljuset').then(function(db) {

				db.collection('config').findOne({type:'weather'}).then(function(item) {

					db.close();

					// Invalidate after a while
					_timer.setTimer(1000*60*60, function() {
						_locations = [];
					});

					resolve(_locations = item.locations);
				})
				.catch(function (error) {
					throw error;
				});
			})
			.catch(function (error) {
				reject(error);
			});
		});

	}

	function fetchWeather(location) {

		return new Promise(function(resolve, reject) {

			try {
				var weather = require('weather-js');

				weather.find({search: location, degreeType: 'C'}, function(error, result) {

					if (error)
						reject(error);
					else
						resolve(result);
				});

			}
			catch(error) {
				reject(error);
			}

		});
	}


	function displayWeather(location) {

		function translateSkyText(text) {
			var skyText = {
				'Cloudy'        : 'Molnigt',
				'Mostly Cloudy' : 'Mestadels molnigt',
				'Partly Cloudy' : 'Delvis molnigt',

				'Rain'          : 'Regnigt',
				'Light Rain'    : 'Lätt regn',
				'Rain Showers'  : 'Regnskurar',

				'Sunny'         : 'Soligt',
				'Partly Sunny'  : 'Delvis soligt',
				'Mostly Sunny'  : 'Mestadels sol',

				'Snow'          : 'Snöigt',
				'Light Snow'    : 'Lätt snöfall',
				'T-Storms'      : 'Åska',

				'Fog'           : 'Dimmigt',
				'Clear'         : 'Klart',
				'Mostly Clear'  : 'Mestadels klart'
			};

			if (!skyText[text])
				console.log(sprintf('Weather condition \'%s\' not defined in swedish.', text));

			return skyText[text] ? skyText[text] : text;
		}


		return new Promise(function(resolve, reject) {

			fetchWeather(location.key).then(function(weather) {

				if (isArray(weather))
					weather = weather[0];

				var current  = weather.current;
				var forecast = undefined;
				var today    = new Date(current.date);
				var tomorrow = new Date(today);

				tomorrow.setDate(today.getDate() + 1);

				weather.forecast.forEach(function(day) {
					var date = new Date(day.date);

					// Just for debugging
					translateSkyText(day.skytextday);

					if (date.valueOf() == tomorrow.valueOf()) {
						forecast = day;
					}
				});

				var text = '';
				text += sprintf('%s - %s, %s°', location.name, translateSkyText(current.skytext).toLowerCase(), current.temperature);

				if (forecast)
					text += sprintf(' - i morgon %s, %s° (%s°)', translateSkyText(forecast.skytextday).toLowerCase(), forecast.high, forecast.low);

				matrix.emit('text', {text:text, textColor:'blue'});

				resolve();
			})
			.catch(function(error) {
				reject(error);
			});
		});
	};

	function displayWeatherLocations(locations) {
		return new Promise(function(resolve, reject) {

			var promise = Promise.resolve();

			locations.forEach(function(location) {
				promise = promise.then(function() {
					return displayWeather(location);
				})
			});

			promise.then(function() {
				resolve();
			})

			.catch(function(error) {
				reject(error);
			});
		});
	};

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			getLocations().then(function(locations) {
				matrix.emit('emoji', {id:616, priority:priority});

				return displayWeatherLocations(locations);
			})
			.then(function() {
				resolve();
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inget väder tillgängligt'});
				reject(error);
			});
		});

	};

};
