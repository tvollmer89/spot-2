import MiniSearch from 'minisearch'
const stopWords = new Set(['and', 'or', 'to', 'in', 'a', 'the'])
const defaultTokenize = MiniSearch.getDefault('tokenize');
let miniSearch = new MiniSearch({
  fields: ['title', 'id', 'type', 'categories', 'description', 'pubDate'],
  storeFields: ['title', 'id', 'type', 'categories'],
  searchOptions: {
    boost: {
      title: 2
    },
    fuzzy: 0.2
  },
  extractField: (doc, fieldName) => {
    return doc[fieldName];
  },
  tokenize: (text, _fieldName) => {
    if (_fieldName == 'categories') {
      return text.split(',');
    }
    return defaultTokenize(text, _fieldName);
  }
});

function initSearch(list) {
  miniSearch.addAll(list);

  // testing
  let results = miniSearch.search({
    combineWith: 'AND',
    queries: [
      {
        queries: ['fireproofing'],
        fields: ['categories'],
        fuzzy: false
      }
    ]
  });
  results = miniSearch.search('fireproofing', {fields:['categories'] });
  console.log(`results: ${JSON.stringify(results)}`);
  // console.log(`result count: ${results.length}`)
}

/**
 * 
 * @param {string} text Text Search String
 * @param {string} type (optional) Current tab (i.e. articles, podcast, etc.) 
 * @param {array} categories (optional) Array of any category checkboxes selected
 * @returns an array of Id's identifying matching items
 */
const runSearch = (text, type, c = []) => {
    let q = [];
    let t = type.split('|');
    if(text != ''){
      q.push(text);
    }
    if (type != 'all') {
      q.push({ queries: t, fields: ['type'], fuzzy: false });
    }
    if (c.length > 0) {
      q.push({
        queries: c,
        fields: ['categories'],
        fuzzy: false,
        tokenize: (string, _fieldName) => string.split(','),
      });
    }

    console.log(`q: ${JSON.stringify(q)}`);
    let results = miniSearch.search({
      combineWith: 'AND',
      queries: q
    }, {
      filter: result => {
        let t = result.type.split('|');
        console.log(`cats: ${c}`);
        let cats = c.forEach(c => {
          if (result.categories.includes(c)) {
            return true;
          }
        })
        return type == "all" ? true : result.type.includes(type);
      }
    });
    console.log(`new results: ${JSON.stringify(results)}`);
    return results.map(r => r.id);
    // if text only search, run the search without an array
    // if (q.length == 0) {
    //   console.log(`no length`);
    //   let results = miniSearch.search(text);
    //   return results.map(r => r.id);
    // } else {
    //   console.log(`q length: ${q.length}`);
    //   if (text != '') {
    //     q.unshift(text);
    //   }
    //   console.log(`q: ${JSON.stringify(q)}`);
    //   let results = miniSearch.search({ combineWith: 'AND', queries: q }, { filter: result => {
    //         console.log(`type: ${type}`);
    //         let t = result.type.split('|');
    //         return result.type.includes(type);
    //       } });
    //   console.log(`new results: ${JSON.stringify(results)}`);
    //   return results.map(r => r.id);
    // }
  };;

export { initSearch, runSearch };