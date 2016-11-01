var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;
var Promise    = require('bluebird');
var tellstick  = require('./tellstick.js');
var matrix     = require('socket.io-client')('http://app-o.se:3000/matrix-display');


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
			console.log('Error', error);

		});

	});

}



var QuoteFeed = function() {

	var _feeds = [
		{
			symbol: '^OMXS30',
			name: 'OMX'
		},
		{
			symbol: '^GSPC',
			name: 'S&P500'
		},

		{
			symbol: 'HM-B.ST',
			name: 'H&M'
		},
		{
			symbol: 'ASSA-B.ST',
			name: 'ASSA'
		},
		{
			symbol: 'PHI.ST',
			name: 'PHI'
		},
		{
			symbol: 'AAPL',
			name: 'Apple'
		}
	];

	this.display = function(priority) {

		if (!priority)
			priority = 'normal';

		matrix.emit('emoji', {id:769, priority:priority});

		return new Promise(function(resolve, reject) {

			var symbols = _feeds.map(function(item) {
				return item.symbol;
			})

			fetchQuotes(symbols).then(function(quotes) {

				_feeds.forEach(function(feed) {
					var quote = quotes[feed.symbol];
					var color = quote.change > 0 ? 'blue' : 'red';
					matrix.emit('text', {text:feed.name, textColor:color});
					matrix.emit('text', {text:sprintf('%s%s', quote.change > 0 ? '+' : '', quote.change), textColor:color});
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

function fetchNews(url, path, query) {

	var FeedParser   = require('feedparser');
	var Request      = require('request');
	var URI          = require('urijs');

	return new Promise(function(resolve, reject) {
		var news = [];
		var uri     = new URI(url);
		var parser  = new FeedParser();

		if (path)
			uri.directory(path);

		if (query)
			uri.query(query);

		var request = Request(uri.toString());

		request.on('response', function (result) {

			if (result.statusCode != 200) {
				reject(new Error('Invalid status code'));
			}
			else {
				this.pipe(parser);
			}

		});

		parser.on('error', function(error) {
			reject(error);
		});

		parser.on('end', function() {
			resolve(news);
		});

		parser.on('readable', function() {
			var item = undefined;

			while (item = this.read()) {
				news.push(item);
			}
		});

	});
};


var NewsFeed = function() {

	var _index = 0;

	var _feeds = [
		{
			name: 'Dagens Industri',
			url: 'http://di.se/rss',
			color: 'red',
		},
		{
			name: 'Google',
			url: 'https://news.google.se/news?cf=all&pz=1&ned=sv_se&ict=ln&num=5&output=rss',
			color: 'blue'
		},
		{
			name: 'Sydsvenskan',
			url: 'http://www.sydsvenskan.se/rss.xml',
			color: 'rgb(255, 0, 255)'
		},
		{
			name: 'Veckans Affärer',
			url: 'http://www.vafinans.se/rss/nyheter',
			color: 'green'

		}
	];

	this.display = function(priority) {

		if (!priority)
			priority = 'normal';

		matrix.emit('emoji', {id:123, priority:priority});

		return new Promise(function(resolve, reject) {

			var feed = _feeds[_index++ % _feeds.length];

			fetchNews(feed.url).then(function(news) {

				news = news.splice(0, 3);

				news.forEach(function(item) {
					matrix.emit('text', {text:item.title, textColor:feed.color});
				});

				resolve();
			})
			.catch(function(error) {
				console.log('Error fetching news', error);
				resolve();
			});

		});

	};


};

var AnimationFeed = function() {

};


var Module = module.exports = function() {

	var Colors = require('color-convert');
	var Schedule = require('node-schedule');

	var _lightSensor     = tellstick.getDevice('SR-01');
	var _newsSwitch      = tellstick.getDevice('FK-00-01');
	var _animationSwitch = tellstick.getDevice('FK-00-02');
	var _emojiSwitch     = tellstick.getDevice('FK-00-03');
	var _motionSensor    = tellstick.getDevice('RV-02');

	var _newsFeed        = new NewsFeed();
	var _quoteFeed       = new QuoteFeed();

	function debug(msg) {
		console.log(msg);
	}

	matrix.on('idle', function() {
	});



	function displayNews(priority) {
		_newsFeed.display(priority);
	};

	function scheduleNews() {
		var rule = new Schedule.RecurrenceRule();
		rule.hour   = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		rule.minute = new Schedule.Range(3, 59, 5);

		Schedule.scheduleJob(rule, function() {
			displayNews('high');
		});
	};

	function displayAnimation(priority) {

		function runPerlin() {
			matrix.emit('perlin', {mode:1, priority:priority, duration:60});
		};

		function runRain() {
			matrix.emit('rain', {priority:priority, duration:180});
		};

		function runAnimation() {
			matrix.emit('animation', {priority:priority, duration:60, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
		}

		var animation = random([runPerlin, runRain, runAnimation, runRain]);
		animation();
	}

	function scheduleAnimations() {
		var rule = new Schedule.RecurrenceRule();

		rule.hour   = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		rule.minute = new Schedule.Range(0, 59, 1);
		rule.second = 15;

		Schedule.scheduleJob(rule, function() {
			displayAnimation('low');
		});
	};


	function displayClock(priority) {

		var now   = new Date();
		var hue   = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;
		var color = Colors.hsl.rgb([hue, 100, 50]);

		var options = {};
		options.textColor   = sprintf('rgb(%d, %d, %d)', color[0], color[1], color[2]);
		options.text        = sprintf('%02d:%02d', now.getHours(), now.getMinutes());
		options.fontSize    = 22;
		options.speed       = 0.70;
		options.priority    = priority;

		matrix.emit('text', options);

	};


	function scheduleClock(callback) {
		var rule = new Schedule.RecurrenceRule();
		rule.hour   = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		rule.minute = new Schedule.Range(0, 59, 1);
		rule.second = [0, 30];

		Schedule.scheduleJob(rule, function() {
			displayClock('low');
		});
	}

	function listen() {
//		scheduleClock();
//		scheduleNews();
//		scheduleAnimations();
		displayNews();

		_motionSensor.on('ON', function() {
			_motionSensor.pauseEvents(30000);

			if (random() < 0.75)
				displayAnimation('high');
			else
				displayNews('high');
		});


		_newsSwitch.on('ON', function() {
			_newsSwitch.pauseEvents(1000);
			displayNews('high');
		});

		_animationSwitch.on('ON', function() {
			_animationSwitch.pauseEvents(1000);
			displayAnimation('high');
		});

		_emojiSwitch.on('ON', function() {
			_emojiSwitch.pauseEvents(1000);
			matrix.emit('emoji', {priority:'high', id:random(1, 846), pause:1});
		});

		_newsSwitch.on('OFF', function() {
			_newsSwitch.pauseEvents(1000);
			displayClock('high');
		});




	}

	function run() {

		listen();
	}

	run();
}

//var x = new QuoteFeed();
//x.display();
//fetchQuote(['PHI.ST']);
