import "regenerator-runtime/runtime.js";
import { init, clearSearch } from './functions';
import Drops from './dropdowns';
// import Index from './search'
let Parser = require('rss-parser');
let parser = new Parser({
  customFields: {
    item: ['id', 'type', 'description', 'doclink', 'download', 'linkType']
  }
});

// go to https://cors-anywhere.herokuapp.com/corsdemo

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
parser.parseURL(
  CORS_PROXY + 'http://test.carboline.com/solution-spot/feed/',
  function(err, feed) {
    if (err) throw err;
    init(feed.items);
  }
);

/*----------  For test site only  ----------*/

// parser.parseURL('feed/', function(err, feed) {
//   if (err) throw err;
//   init(feed.items)
// })

/*=====  End of Test Site  ======*/
Drops();
document.getElementById('clear-search').addEventListener('click', clearSearch);
document
  .getElementById('m-clear-search')
  .addEventListener('click', clearSearch);
