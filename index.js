var debug = require("debug")('radio-paradise');
var circle = require("circle");
var scrape = require("scrape-url");
var memoize = require('memoize-with-leveldb')('./data-songs');
var nowplaying = memoize(pull, '90 seconds');

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

    links = links
      .filter(isJustText)
      .map(function (el) {
        return el.innerHTML.replace(/<[^>]+>/g, '');
      })
      .reverse();

    callback(undefined, links);
  });
}

function isJustText (el) {
  return !/\<img/.test(el.innerHTML);
}
