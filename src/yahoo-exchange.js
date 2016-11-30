var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var Gopher     = require('yow/gopher');

var Module = module.exports = function() {

	var _this = this;

	_this.fetch = function(symbols) {

		return new Promise(function(resolve, reject) {
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

		});

	}
};
