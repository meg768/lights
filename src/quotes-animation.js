var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var Animation = module.exports = function(matrix) {

	function getStocks() {
		var stocks = [

			{symbol: '^OMXS30',   name: 'OMX'},
			{symbol: '^GSPC',     name: 'S&P500'},
			{symbol: '^GDAXI',    name: 'DAX'},
			{symbol: '^FTSE',     name: 'FTSE'},
			{symbol: '^HSI',      name: 'Hang Seng'},
			{symbol: '^N225',     name: 'Nikkei'},
			{symbol: 'PHI.ST',    name: 'PHI'},
			{symbol: 'GC=F',      name: 'Guld'},
			{symbol: 'CL=F',      name: 'Olja'}

		];

		return Promise.resolve(stocks);
	}

	function fetchQuotes(symbols) {
		var yahoo = require('yahoo-finance');

		return new Promise(function(resolve, reject) {
			yahoo.snapshot({symbols: symbols, fields: ['s', 'n', 'l1', 'p2']}, function(error, snapshot) {
				if (error)
					reject(error);
				else
					resolve(snapshot);
			});
		});
	}


	function displayStocks(priority, stocks) {

		return new Promise(function(resolve, reject) {

			var stockNames = {};

			var symbols = stocks.map(function(stock) {
				return stock.symbol;
			});

			stocks.forEach(function(stock) {
				stockNames[stock.symbol] = stock.name;
			});

			fetchQuotes(symbols).then(function(quotes) {

				var snapshot = {};

				quotes.forEach(function(quote) {
					snapshot[quote.symbol] = quote;
				});

				matrix.emit('emoji', {id:769, priority:priority});

				stocks.forEach(function(stock) {
					var quote  = snapshot[stock.symbol];
					var name   = stockNames[stock.symbol];
					var change = parseFloat(quote.changeInPercent) * 100;
					var text   = sprintf('%s%.01f%%', change > 0 ? '+' : '', change);
					var color  = change >= 0 ? 'blue' : 'red';

					matrix.emit('text', {text:name + '  ' + text, textColor:color});
				});

				resolve();
			})
			.catch(function(error) {
				reject(error);
			});

		});

	};

	this.run = function(priority) {
		return new Promise(function(resolve, reject) {

			getStocks().then(function(stocks) {
				return displayStocks(priority, stocks);
			})
			.then(function() {
				resolve();
			})
			.catch(function(error) {
				console.log('Error fetching quotes.');
				matrix.emit('text', {text:'Inga aktiekurser tillgängliga'});
				reject(error);
			});

		});
	}


};
