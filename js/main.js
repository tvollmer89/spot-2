import "regenerator-runtime/runtime.js";
import { init, updatePage, clearSearch} from './functions'
// import Index from './search'
let Parser = require('rss-parser');
let parser = new Parser({
  customFields: {
    item: ['id', 'type', 'description', 'doclink']
  }
});

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

parser.parseURL(CORS_PROXY + 'http://test.carboline.com/solution-spot/feed/', function(err, feed) {
  if (err) throw err;

  // maybe don't run until feed? 
  init(feed.items)
})

document.getElementById('clear-search').addEventListener("click", clearSearch)
