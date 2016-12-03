var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var MongoDB    = require('mongodb');

var Animation = module.exports = function(matrix) {

	var _symbols = [];
	var _timer = new Timer();

	function fetchExchange(symbols) {

		return new Promise(function(resolve, reject) {
			var Gopher = require('yow/gopher');
			var yahoo  = new Gopher('https://query.yahooapis.com');

			if (!isArray(symbols))
				symbols = [symbols];

			symbols = symbols.map(function(symbol) {
				return '\'' + symbol + '\'';
			});
			var query = {};

			query.q        = 'select * from yahoo.finance.xchange where pair in (' + symbols.join(',') + ')';
			query.format   = 'json';
			query.env      = 'store://datatables.org/alltableswithkeys';
			query.callback = '';

			yahoo.get('v1/public/yql', {query:query}).then(function(data) {
				var items = data.query.results.rate;
				var rates = [];

				if (!isArray(items))
					items = [items];

				items.forEach(function(item) {

					var rate = {};
					rate.symbol    = item.id;
					rate.price     = parseFloat(item.Ask);
					rate.name      = item.Name;

					rates.push(rate);
				});

				resolve(rates);

			})
			.catch(function(error) {
				reject(error);
			});


		});

	}

	function getSymbols() {

		if (_symbols.length > 0)
			return Promise.resolve(_symbols);

		return new Promise(function(resolve, reject) {

			MongoDB.connect('mongodb://app-o.se:27017/ljuset').then(function(db) {

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

			function fail(error) {
				matrix.emit('text', {text:'Inga valutor tillgängliga'});
				console.log('Error fetching exchange.');
				reject(error);
			}

			getSymbols().then(function(symbols) {

				var list = symbols.map(function(symbol) {
					return symbol.symbol;
				});

				fetchExchange(list).then(function(rows) {
					var map = {};

					rows.forEach(function(row) {
						map[row.symbol] = row;
					});

					matrix.emit('emoji', {id:534, priority:priority});

					symbols.forEach(function(symbol) {
						var text = sprintf('%s  %.02f', symbol.name, map[symbol.symbol].price);
						matrix.emit('text', {text:text, textColor:'blue'});
					});

					resolve();

				})
				.catch(function(error) {
					fail(error);
				});
			})
			.catch(function(error) {
				fail(error);
			});
		});


	};
};
