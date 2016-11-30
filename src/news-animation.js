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
					throw error;
				});
			})
			.catch(function (error) {
				reject(error);
			});
		});

	}


	function displayFeed(priority, feeds) {

		return new Promise(function(resolve, reject) {

			var News = require('./news.js');
			var news = new News();

			if (!priority)
				priority = 'normal';

			console.log('Displaying news...');

			var feed = feeds[_index++ % feeds.length];

			matrix.emit('emoji', {id:123, priority:priority});

			news.fetch(feed.url).then(function(news) {

				news = news.splice(0, 5);

				news.forEach(function(item) {
					console.log(item.title);
					matrix.emit('text', {text:item.title, textColor:feed.color});
				});

				resolve();
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inga nyheter tillgängliga'});
				console.log('Error fetching news.', error);
				resolve();
			});

		});

	};

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			getNewsFeeds().then(function(feeds) {
				displayFeed(priority, feeds).then(function() {
					resolve();
				})
				.catch(function(error) {
					throw error;
				});

			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inga nyheter tillgängliga'});
				console.log('Error fetching news.', error);
				resolve();
			});

		});

	};


};
