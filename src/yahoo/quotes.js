var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var Quotes = module.exports = function() {

	var _this = this;

	_this.fetch(symbols) {

		return new Promise(function(resolve, reject) {
			var Gopher = require('yow/gopher');
			var yahoo  = new Gopher('https://query.yahooapis.com');

			if (isString(symbols))
				symbols = [symbols];

			symbols = symbols.map(function(symbol) {
				return '\'' + symbol + '\'';
			});

			var query = {};

			query.q        = 'select * from yahoo.finance.quotes where symbol IN (' + symbols.join(',') + ')';
			query.format   = 'json';
			query.env      = 'store://datatables.org/alltableswithkeys';
			query.callback = '';

			yahoo.get('v1/public/yql', {query:query}).then(function(data) {
				var items = data.query.results.quote;

				if (!isArray(items))
					items = [items];

				resolve(quotes);

			})

			.catch (function(error) {
				reject(error);
			});

		});

	}
};
