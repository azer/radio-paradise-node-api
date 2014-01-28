var debug = require("debug")('radio-paradise');
var circle = require("circle");
var scrape = require("scrape-url");
var cache = require("level-json-cache")('nowplaying');
var strip = require("strip");

module.exports = circle({
  '/': home
});

function home (reply) {
  nowplaying(reply);
}

function nowplaying (callback) {
  cache.get('nowplaying', function (error, songs) {
    if (!error) return callback(undefined, songs);

    pull(function (error, songs) {
      if (error) {
        debug('Failed to fetch: %s', error.message);
        return callback(error);
      }

      cache.set('nowplaying', songs, '90 seconds', function (error) {
        if (error) {
          debug('Failed to cache: %s', error.message);
          return callback(error);
        }

        callback(undefined, songs);
      });
    });
  });
}

function pull (callback) {
  debug('Pulling songs...');

  scrape('http://www.radioparadise.com/ajax_rp2_playlist.php', '#pre_list .song_title', function (error, links) {
    if (error) return callback(error);

    callback(undefined, links.map(function (el) {
      return strip(el.innerHTML);
    }));
  });
}
