var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var YahooExchange = require('./yahoo-exchange.js');
var MongoDB       = require('mongodb');

var Animation = module.exports = function(matrix) {

	var _symbols = [];
	var _timer = new Timer();

	function getSymbols() {

		if (_symbols.length > 0)
			return Promise.resolve(_symbols);

		return new Promise(function(resolve, reject) {

			MongoDB.connect('mongodb://app-o.se:27017/ljuset').then(function(db) {
				console.log('Fetching stock rates...');

				db.collection('config').findOne({type:'exchange'}).then(function(item) {
					db.close();

					// Invalidate after a while
					_timer.setTimer(1000*60*60, function() {
						_symbols = [];
					});

					resolve(_symbols = item.symbols);

				})
				.catch(function(error) {
					throw error;
				});
			})
			.catch(function (error) {
				reject(error);
			});
		});

	}

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			getSymbols().then(function(symbols) {
				var yahoo = new YahooExchange();

				var list = symbols.map(function(symbol) {
					return symbol.symbol;
				});

				yahoo.fetch(list).then(function(rows) {
					var map = {};

					rows.forEach(function(row) {
						map[row.symbol] = row;
					});

					matrix.emit('emoji', {id:543, priority:priority});

					symbols.forEach(function(symbol) {
						var text = sprintf('%s  %.02f', symbol.name, map[symbol.symbol].price);
						matrix.emit('text', {text:text, textColor:'blue'});
					});

					resolve();

				})

				.catch(function(error) {
					throw error;
				});

			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inget valutor tillgängliga'});
				console.log('Error fetching exchange.');
				console.log(error.stack);
				resolve();
			});
		});


	};
};
