var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Timer      = require('yow/timer');

var NewsAnimation = module.exports = function(matrix) {

	var _index = 0;

	function getNewsFeeds() {

		var feeds =  [
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

		return Promise.resolve(feeds);
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
