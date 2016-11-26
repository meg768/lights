var sprintf    = require('yow/sprintf');
var random     = require('yow/random');

var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var QuotesAnimation = module.exports = function(matrix) {

	var _feeds = [

		{symbol: '^OMXS30',   name: 'OMX'},
		{symbol: '^GSPC',     name: 'S&P500'},
		{symbol: '^GDAXI',    name: 'DAX'},
		{symbol: '^FTSE',     name: 'FTSE'},
		{symbol: '^HSI',      name: 'Hang Seng'},
		{symbol: '^N225',     name: 'Nikkei'},
		{symbol: 'PHI.ST',    name: 'PHI'},
		{symbol: 'GC=F',      name: 'Guld'},
		{symbol: 'CL=F',      name: 'Olja'},

	];

	function fetchQuotes(tickers) {

		return new Promise(function(resolve, reject) {
			var Gopher = require('yow/gopher');
			var yahoo  = new Gopher('https://query.yahooapis.com');

			var symbols = tickers;

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


		return new Promise(function(resolve, reject) {

			if (!priority)
				priority = 'normal';

			var symbols = _feeds.map(function(item) {
				return item.symbol;
			})

			fetchQuotes(symbols).then(function(quotes) {

				console.log('Displaying stock quotes...');

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
				matrix.emit('text', {text:'Inga aktiekurser tillgängliga'});
				console.log('Error fetching quotes.', error);
				resolve();
			});

		});

	};

};
