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
		{symbol: '^OMXS30',   name: 'OMX'},
		{symbol: '^GSPC',     name: 'S&P'},
		{symbol: '^GDAXI',    name: 'DAX'},
		{symbol: '^FTSE',     name: 'FTSE'},
		{symbol: '^HSI',      name: 'Hang Seng'},
		{symbol: '^N225',     name: 'Nikkei'},
		{symbol: 'GC=F',      name: 'Guld'},
		{symbol: 'CL=F',      name: 'Olja'},

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
					var quote  = quotes[feed.symbol];
					var name   = feed.name;
					var change = sprintf('%s%.01f%%', quote.change > 0 ? '+' : '', quote.change);
					var color  = quote.change >= 0 ? 'blue' : 'red';

					matrix.emit('text', {text:name, textColor:color});
					matrix.emit('text', {text:change, textColor:color});
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

var TextFeed = function() {

	var _index = 0;
	var _newsFeed  = new NewsFeed();
	var _quoteFeed = new QuoteFeed();

	this.display = function(priority) {

		var feeds = [_newsFeed, _quoteFeed];
		var feed  = feeds[_index++ % feeds.length];

		feed.display(priority);
	}
};

var AnimationFeed = function() {

	var _index = 0;

	function runPerlin(priority) {
		matrix.emit('perlin', {mode:1, priority:priority, duration:60});
	};

	function runRain(priority) {
		matrix.emit('rain', {priority:priority, duration:180});
	};

	function runAnimation(priority) {
		matrix.emit('animation', {priority:priority, duration:60, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
	}

	this.display = function(priority) {

		var animations = [runPerlin, runRain, runAnimation, runRain, runAnimation, runRain];
		var animation  = animations[_index++ % animations.length];

		animation(priority);
	}
};


var Module = module.exports = function() {

	var Colors = require('color-convert');
	var Schedule = require('node-schedule');

	var _lightSensor     = tellstick.getDevice('SR-01');
	var _textSwitch      = tellstick.getDevice('FK-00-01');
	var _animationSwitch = tellstick.getDevice('FK-00-02');
	var _emojiSwitch     = tellstick.getDevice('FK-00-03');
	var _motionSensor    = tellstick.getDevice('RV-02');

	var _textFeed        = new TextFeed();
	var _animationFeed   = new AnimationFeed();

	function debug(msg) {
		console.log(msg);
	}

	matrix.on('idle', function() {
	});

	function displayText(priority) {
		_textFeed.display(priority);
	};

	function scheduleText() {
		var rule = new Schedule.RecurrenceRule();
		rule.hour   = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		rule.minute = new Schedule.Range(3, 59, 5);

		Schedule.scheduleJob(rule, function() {
			displayText('high');
		});
	};

	function displayAnimation(priority) {
		_animationFeed.display(priority);
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
		rule.second = [0, 15, 30, 45];

		Schedule.scheduleJob(rule, function() {
			displayClock('low');
		});
	}

	function listen() {
		scheduleClock();
		scheduleText();
		scheduleAnimations();

		_motionSensor.on('ON', function() {
			this.pauseEvents(30000);

			if (random() < 0.75)
				displayAnimation('high');
			else
				displayText('high');
		});


		_textSwitch.on('ON', function() {
			this.pauseEvents(1000);
			displayText('high');
		});

		_animationSwitch.on('ON', function() {
			this.pauseEvents(1000);
			displayAnimation('high');
		});

		_emojiSwitch.on('ON', function() {
			this.pauseEvents(1000);
			matrix.emit('emoji', {priority:'high', id:random(1, 846), pause:1});
		});

		_textSwitch.on('OFF', function() {
			this.pauseEvents(1000);
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
