var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;



var WeatherAnimation = module.exports = function(matrix) {

	function fetchWeather() {

		return new Promise(function(resolve, reject) {

			try {
				var weather = require('weather-js');

				weather.find({search: 'Lund', degreeType: 'C'}, function(error, result) {
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

			'Clear'         : 'Klart',
			'Mostly Clear'  : 'Mestadels klart'
		};

		if (!skyText[text])
			console.log(sprintf('Weather condition \'%s\' not defined in swedish.', text));

		return skyText[text] ? skyText[text] : text;
	}

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			matrix.emit('text', {text:'Väder', textColor:'blue'});

			fetchWeather().then(function(weather) {

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
				text += sprintf('Nu %s, %s°', translateSkyText(current.skytext).toLowerCase(), current.temperature);

				if (forecast)
					text += sprintf(' - i morgon %s, %s° (%s°)', translateSkyText(forecast.skytextday).toLowerCase(), forecast.high, forecast.low);

				matrix.emit('text', {text:text, textColor:'blue'});

				resolve();
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inget väder tillgängligt'});
				console.log('Error fetching weather.');
				console.log(error.stack);
				resolve();
			});
		});


	};

};
