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

const initSearch = list => {
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
  results = miniSearch.search('fireproofing', {
    fields: ['categories']
  });
};

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
  if (text != '') {
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
      tokenize: (string, _fieldName) => string.split(',')
    });
  }

  console.log(`q: ${JSON.stringify(q)}`);
  let results = miniSearch.search(
    { combineWith: 'AND', queries: q },
    {
      filter: result => {
        let t = result.type.split('|');
        let hasCat = false;
        c.forEach(category => {
          console.log(`results c: ${result.categories}`);
          if (result.categories.includes(category)) {
            console.log(`result ${JSON.stringify(result)} has: ${category}`);
            hasCat = true;
          }
        });
        if (c.length === 0) {
          return type == 'all' ? true : result.type.includes(type);
        } else if (type == 'all' && hasCat) {
          return true;
        } else if (hasCat && result.type.includes(type)) {
          return true;
        }
      }
    }
  );
  return results.map(r => r.id);
};

export { initSearch, runSearch };