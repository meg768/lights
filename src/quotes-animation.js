var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var YahooQuotes = require('./yahoo-quotes.js');
var MongoDB     = require('mongodb');

var Animation = module.exports = function(matrix) {

	var _stocks = [];
	var _timer = new Timer();

	function getStocks() {

		if (_stocks.length > 0)
			return Promise.resolve(_stocks);

		return new Promise(function(resolve, reject) {

			MongoDB.connect('mongodb://app-o.se:27017/ljuset').then(function(db) {
				console.log('Fetching stock symbols...');
				return db.collection('config').findOne({type:'quotes'});
			})
			.then(function(item) {

				// Invalidate after a while
				_timer.setTimer(1000*60*60, function() {
					_stocks = [];
				});

				resolve(_stocks = item.stocks);
			})
			.catch(function (error) {
				reject(error);
			});
		});

	}



	function displayStocks(priority, stocks) {

		return new Promise(function(resolve, reject) {

			var yahooQuotes = new YahooQuotes();
			var stockNames = {};

			var symbols = stocks.map(function(stock) {
				return stock.symbol;
			});

			stocks.forEach(function(stock) {
				stockNames[stock.symbol] = stock.name;
			});

			yahooQuotes.fetch(symbols).then(function(quotes) {

				try {

					matrix.emit('emoji', {id:769, priority:priority});

					symbols.forEach(function(symbol) {

						var quote  = quotes[symbol];
						var name   = stockNames[symbol];
						var change = sprintf('%s%.01f%%', quote.change > 0 ? '+' : '', quote.change);
						var color  = quote.change >= 0 ? 'blue' : 'red';

						matrix.emit('text', {text:name + '   ' + change, textColor:color});
					});

					resolve();

				}
				catch(error) {
					console.log(error.stack);
				}
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inga aktiekurser tillgängliga'});
				console.log('Error fetching quotes.', error);
				resolve();
			});

		});

	};


	this.run = function(priority) {
		return new Promise(function(resolve, reject) {

			getStocks().then(function(stocks) {
				return displayStocks(priority, stocks);
			})
			.catch(function(error) {
				try {
					console.log('Error fetching quotes.', error);
					resolve();
					matrix.emit('text', {text:'Inga aktiekurser tillgängliga'});

				}
				catch(error) {
					console.log('Error fetching quotes.', error.stack);
					resolve();
				}
			});

		});
	}


};
