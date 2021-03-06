var debug = require("debug")('radio-paradise');
var circle = require("circle");
var scrape = require("scrape-url");
var memoize = require('memoize-with-leveldb')('data-songs');
var nowplaying = memoize(pull, '10 seconds');

module.exports = circle({
  '/': home
});

function home (reply) {
  nowplaying(reply);
}

function pull (callback) {
  debug('Pulling songs...');

  scrape('http://www.radioparadise.com/ajax_rp2_playlist.php', '.song_title', function (error, links) {
    if (error) return callback(error);

    links = links.reverse().filter(isJustText)
      .map(function (el) {
        return el.html().replace(/<[^>]+>/g, '');
      });

    callback(undefined, links);
  });
}

function isJustText (el) {
  return !/\<img/.test(el.innerHTML);
}
