var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var Colors     = require('color-convert');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var Avanza     = require('avanza-mobile-client');

var Animation = module.exports = function(matrix) {

	var _avanza = new Avanza();
	var _index = 0;
	var _watchLists = [
		{name: 'Valutor', emoji:534},
		{name: 'Index', emoji:188},
		{name: 'Aktier', emoji:314},
		{name: 'Fonder', emoji:546}
	];

	function login() {
		if (_avanza.session.username == undefined) {
			return _avanza.login();
		}
		else {
			return Promise.resolve();
		}
	}

	function getPrice(id) {
		return new Promise(function(resolve, reject) {
			_avanza.get(sprintf('/_mobile/market/index/%s', id)).then(function(result) {
				resolve({name:result.name, price:result.lastPrice, change:result.changePercent});
			})
			.catch(function(error) {
				reject(error);
			});
		})
	}

	function getPrices(ids) {
		return new Promise(function(resolve, reject) {

			var promise = Promise.resolve();
			var result = [];

			ids.forEach(function(id) {
				promise = promise.then(function() {
					return getPrice(id).then(function(item) {
						result.push(item);
					});
				});
			});

			promise.then(function() {
				resolve(result);
			})
			.catch(function(error) {
				reject(error);
			})

		})

	}



	function displayText(text, color = 'red') {
		var options = {};
		options.textColor   = color;
		options.fontSize    = 18;
		options.priority    = _priority;
		options.iterations  = 1;
		options.text        = text;

		matrix.emit('text', options);
	}


	function getWatchList(name) {
		return new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				return _avanza.get('/_mobile/usercontent/watchlist');
			})
			.then(function(watchlist) {
				return watchlist.find(function(item) {
					return item.name == name;
				});
			})
			.then(function(result) {
				if (result == undefined)
					throw new Error('No such thing.');

				return result.orderbooks;
			})
			.then(function(result) {
				return getPrices(result);
			})

			.then(function(result) {
				resolve(result);
			})
			.catch(function(error) {
				reject(error);

			});

		});

	}



	function displayWatchlist(watchList) {


		return new Promise(function(resolve, reject) {
			getWatchList(watchList.name).then(function(reply) {


				matrix.emit('emoji', {id:watchList.emoji, priority:_priority});

				reply.forEach(function(item) {

					item.change = parseFloat(item.change);
					item.price  = parseFloat(item.price);

					if (item.price < 100)
						item.price = sprintf('%.2f', parseFloat(item.price));
					else
						item.price = sprintf('%.0f', parseFloat(item.price));

					var color = item.change >= 0 ? 'blue' : 'red';

					displayText(sprintf('%s     %s (%s%.01f%%)', item.name, item.price, item.change > 0 ? '+' : '', item.change), color);


				});

				resolve();

			})
			.catch(function(error) {
				reject(error);
			})
		});
	}

	this.run = function(priority) {

		var watchList = _watchLists[_index];

		_index = (_index + 1) % _watchLists.length;
		_priority = priority || 'normal'

		return new Promise(function(resolve, reject) {

			login().then(function() {
				return displayWatchlist(watchList);
			})

			.then(function() {
				resolve();
			})

			.catch(function(error) {
				console.log(error);
				reject(error);
			})
		});
	};


};
