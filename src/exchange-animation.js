var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var Animation = module.exports = function(matrix) {

	function getSymbols() {

		var symbols = [
			{symbol: 'USDSEK', name:'USD'},
			{symbol: 'EURSEK', name:'EUR'}

		];

		return Promise.resolve(symbols);
	}

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
