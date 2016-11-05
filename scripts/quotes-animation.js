var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var tellstick  = require('./tellstick.js');

var QuotesAnimation = module.exports = function(matrix) {

	var _feeds = [

		{symbol: '^OMXS30',   name: 'OMX'},
		{symbol: '^GSPC',     name: 'S&P500'},
		{symbol: '^GDAXI',    name: 'DAX'},
		{symbol: '^FTSE',     name: 'FTSE'},
		{symbol: '^HSI',      name: 'Hang Seng'},
		{symbol: '^N225',     name: 'Nikkei'},
		{symbol: 'GC=F',      name: 'Guld'},
		{symbol: 'CL=F',      name: 'Olja'},

	];

	function fetchQuotes(tickers) {


		return new Promise(function(resolve, reject) {
			var RequestAPI = require('rest-request');
			var yahoo      = new RequestAPI('https://query.yahooapis.com');

			var symbols = tickers;

			if (isString(symbols))
				symbols = [symbols];

			symbols = symbols.map(function(symbol) {
				return '\'' + symbol + '\'';
			});

			var options = {};

			options.q        = 'select * from yahoo.finance.quotes where symbol IN (' + symbols.join(',') + ')';
			options.format   = 'json';
			options.env      = 'store://datatables.org/alltableswithkeys';
			options.callback = '';

			yahoo.get('v1/public/yql', options).then(function(data) {
				var items = data.query.results.quote;
				var quotes = {};

				if (!isArray(items))
					items = [items];

				items.forEach(function(item) {

					var quote = {};
					quote.price     = item.LastTradePriceOnly != null ? parseFloat(item.LastTradePriceOnly) : null;
					quote.change    = item.PercentChange != null ? parseFloat(item.PercentChange) : null;
					quote.volume    = item.Volume != null ? parseInt(item.Volume) : null;
					quote.symbol    = item.symbol;
					quote.name      = item.Name;

					quotes[item.symbol] = quote;
				});

				resolve(quotes);

			})

			.catch (function(error) {
				reject(error);
			});

		});

	}


	this.run = function(priority) {

		if (!priority)
			priority = 'normal';


		return new Promise(function(resolve, reject) {

			var symbols = _feeds.map(function(item) {
				return item.symbol;
			})

			fetchQuotes(symbols).then(function(quotes) {

				matrix.emit('emoji', {id:769, priority:priority});

				_feeds.forEach(function(feed) {
					var quote  = quotes[feed.symbol];
					var name   = feed.name;
					var change = sprintf('%s%.01f%%', quote.change > 0 ? '+' : '', quote.change);
					var color  = quote.change >= 0 ? 'blue' : 'red';

					matrix.emit('text', {text:name + '   ' + change, textColor:color});
				});

				resolve();
			})
			.catch(function(error) {
				console.log('Error fetching quotes', error);
				resolve();
			});

		});

	};

};
