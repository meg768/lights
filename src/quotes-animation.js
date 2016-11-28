var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var YahooQuotes = require('yow/yahoo-quotes');

var QuotesAnimation = module.exports = function(matrix) {

	function connectToMySQL() {

		return new Promise(function(resolve, reject) {
			var MySQL = require('mysql');

			var connection = MySQL.createConnection({
				host     : 'app-o.se',
				user     : 'root',
				password : 'potatismos',
				database : 'ljuset'
			});

			connection.connect(function(error) {
				if (error)
					reject(error);
				else
					resolve(connection);
			});

		});

	}

	// Gör om en mysql-fråga till en promise för att slippa callbacks/results/errors
	function runQuery(db, sql, options) {

		return new Promise(function(resolve, reject) {

			var query = db.query(sql, options, function(error, result) {
				if (error)
					reject(error);
				else
					resolve(result);
			});

			// Skriver ut frågan helt enkelt i klartext
			console.log(query.sql);

		});

	}

	function displayStocks(stocks) {

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
			connectToMySQL().then(function(db) {
				return runQuery(db, 'SELECT * FROM stocks order by `order`');
			})
			.then(function(stocks) {
				return displayStocks(stocks);
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
