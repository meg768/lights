var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var MongoDB    = require('mongodb');


var NewsAnimation = module.exports = function(matrix) {

	var _index = 0;
	var _feeds = [];
	var _timer = new Timer();

	function getNewsFeeds() {

		if (_feeds.length > 0)
			return Promise.resolve(_feeds);

		return new Promise(function(resolve, reject) {

			MongoDB.connect('mongodb://app-o.se:27017/ljuset').then(function(db) {

				db.collection('config').findOne({type:'news'}).then(function(item) {

					db.close();

					// Invalidate after a while
					_timer.setTimer(1000*60*60, function() {
						_feeds = [];
					});

					resolve(_feeds = item.feeds);
				})
				.catch(function (error) {
					reject(error);
				});
			})
			.catch(function (error) {
				reject(error);
			});
		});

	}

	function fetchNews(url) {

		var FeedParser   = require('feedparser');
		var Request      = require('request');

		return new Promise(function(resolve, reject) {

			try {
				var news = [];
				var parser  = new FeedParser();
				var request = Request(url);

				request.on('response', function (result) {

					try {
						if (result.statusCode != 200) {
							reject(new Error('Invalid status code'));
						}
						else {
							this.pipe(parser);
						}

					}
					catch(error) {
						reject(error);
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

			}
			catch(error) {
				console.log('Something wrong with Request...');
				reject(error);
			}

		});
	};

	function displayFeed(priority, feeds) {

		return new Promise(function(resolve, reject) {

			if (!priority)
				priority = 'normal';

			var feed = feeds[_index++ % feeds.length];

			matrix.emit('emoji', {id:123, priority:priority});

			fetchNews(feed.url).then(function(news) {

				news = news.splice(0, 5);

				news.forEach(function(item) {
					matrix.emit('text', {text:item.title, textColor:feed.color});
				});

				resolve();
			})
			.catch(function(error) {
				reject(error);
			});
		});

	};

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			getNewsFeeds().then(function(feeds) {
				return displayFeed(priority, feeds);
			})
			.then(function() {
				resolve();
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inga nyheter tillgängliga'});
				reject(error);
			});
		});

	};


};
