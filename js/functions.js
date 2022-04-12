import { initSearch, runSearch } from './search'
const homeTab = document.getElementById("all"),
      pager = document.getElementById('blog-pager'),
      numPerPage = 10,
      input = document.querySelector('input[type="text"]'),
      checks = document.querySelectorAll("input[type='checkbox']");
let allItems = [], matchingItems = [], activeTab
let filters = {
  t: "",
  activeType: "all",
  catsChecked: []
}

const init = (feed) => {
  allItems = feed;
  matchingItems = feed;
  activeTab = homeTab;
  let pageCount = Math.ceil(allItems.length/numPerPage)
  buildPage(1)
  buildPager(1, pageCount) 
  initSearch(allItems)
  addTabEvents()
  addCategoryEvents()
  input.addEventListener("input", updateTextSearch)
  // input.addEventListener('keyup', updateTextSearch);
  console.log(`init() run`);

  // let r = runSearch('coating', activeTab.id, ['coating application'])
  // updateList(r)
}

const checkFilters = () => {
  return filters.catsChecked.length > 0 || filters.t.length > 2 || filters.activeType != "all"
}

// update matching items using item id's from search results
const updateList = results => {
  if (results.length == 0) {
    activeTab.innerHTML = `<p>No items found matching your search.</p>`;
    pager.textContent = '';
    return;
  }
  matchingItems = results.map(result => {
    return allItems.find(item => item.id === result);
  });
  if (filters.t == '') {
    let temp = matchingItems.sort((a, b) => {
      return new Date(b.pubDate) - new Date(a.pubDate);
    });
    matchingItems = temp;
  }
  updatePage(1);
};

const updatePage = (newPage = 1) => {
  console.log(`matching: ${matchingItems.length}`);

  let pageCount = Math.ceil(matchingItems.length / numPerPage);
  buildPage(newPage, matchingItems);
  buildPager(newPage, pageCount);
};

const updateTextSearch = e => {
  filters.t = e.target.value;
  if (checkFilters()) {
    let r = runSearch(filters.t, filters.activeType, filters.catsChecked);
    updateList(r);
  } else {
    console.log(`else`);
    matchingItems = allItems;
    updatePage();
  }
};

const addTabEvents = () => {
  let tabLinks = document.querySelectorAll('.type-tab');
  tabLinks.forEach(tab => {
    let target = tab.innerHTML.toLowerCase().replace(' ', '-');
    tab.addEventListener('click', () => {
      activeTab.textContent = '';
      activeTab = document.getElementById(target);
      console.log(`target: ${target}`);
      filters.activeType = tab.getAttribute('data-filter');

      if (checkFilters()) {
        let r = runSearch(...Object.values(filters));
        updateList(r);
      } else {
        matchingItems = allItems;
        updatePage();
      }
    });
  });
};

const addCategoryEvents = () => {
  checks.forEach(input => {
    input.addEventListener('change', function(e) {
      let val = e.target.value.toLowerCase();
      if (e.target.checked) {
        filters.catsChecked.push(val);
      } else {
        let i = filters.catsChecked.indexOf(val);
        filters.catsChecked.splice(i, 1);
      }
      if (checkFilters()) {
        let r = runSearch(...Object.values(filters));
        updateList(r);
      } else {
        matchingItems = allItems;
        updatePage();
      }
    });
  });
};

const clearSearch = () => {
  checks.forEach(i => {
    i.checked = false;
  });
  filters.catsChecked = [];
  filters.text = '';
  input.value = '';
  if (!checkFilters()) {
    matchingItems = allItems;
    updatePage();
  } else {
    let r = runSearch(...Object.values(filters));
    updateList(r);
  }
};

/**
 * 
 * Build Buttons for Pagination
 * @param {object} obj 
 * @returns HTML Button Element
 */
const renderButton = obj => {
  let li = document.createElement('li');
  li.classList.add('page-item');
  if (obj.class) {
    li.classList.add(obj.class);
  }
  let link = document.createElement('a');
  link.classList.add('page-link');
  link.innerHTML = obj.content;
  if (obj.page) {
    link.setAttribute('data-page', obj.page);
  }
  li.appendChild(link);
  return li;
};

/**
 * 
 * @param {int} currPage 
 * @param {int} totalPages 
 * @returns Pagination element to add to DOM
 */
const buildPager = (currPage, totalPages) => {
  if (totalPages <= 1) {
    pager.innerHTML = '';
    return;
  }
  const dots = totalPages > 5;
  const node = document.createDocumentFragment();
  let prev = renderButton({
    class: `${currPage === 1 ? 'disabled' : ''}`,
    page: currPage - 1,
    content: 'Previous'
  });
  node.appendChild(prev);
  let first = renderButton({
    class: `${currPage == 1 ? 'active' : ''}`,
    page: 1,
    content: 1
  });
  node.appendChild(first);
  if (dots && currPage > 3) {
    let dot = renderButton({
      class: 'disabled',
      content: '...'
    });
    node.appendChild(dot);
  }
  for (var p = currPage - 1; p < currPage + 2; p++) {
    if (p > 1 && p < totalPages) {
      let li = renderButton({
        class: `${p == currPage ? 'active' : ''}`,
        page: p,
        content: p
      });
      node.appendChild(li);
    }
  }
  if (dots && currPage < totalPages - 2) {
    let dot = renderButton({
      class: 'disabled',
      content: '...'
    });
    node.appendChild(dot);
  }
  let last = renderButton({
    class: `${currPage == totalPages ? 'active' : ''}`,
    page: totalPages,
    content: totalPages
  });
  node.appendChild(last);
  let next = renderButton({
    class: `${currPage == totalPages ? 'disabled' : ''}`,
    page: currPage + 1,
    content: 'Next'
  });
  node.appendChild(next);
  pager.innerHTML = '';
  pager.appendChild(node);
  addPagerEvents(pager.querySelectorAll('.page-link'));
};

/**
 * addPagerEvents
 * @param {NodeList} links 
 */
const addPagerEvents = links => {
  links.forEach(link => {
    let p = link.getAttribute('data-page')
      ? parseInt(link.getAttribute('data-page'), 10)
      : null;
    if (p) {
      link.addEventListener('click', () => updatePage(p));
    }
  });
};

function displayItem(entry) {
  let html = ``;
  /***
   * TODO: Need to check for PDF download and if link should open in new tab!
   *  
   * */

  switch (entry.type) {
    case 'brochure':
      html += `<h3>${entry.title}</h3><span class="card-type">${entry.type}</span>`;
      if ('categories' in entry) {
        html += ` | <span class="card-category">${entry.categories.join(
          ', '
        )}</span>`;
      }
      if (entry.description != '') {
        html += `<p>${entry.description}</p>`;
      }
      html += `<div class="mb-3"><a class="btn btn-blue" href="${entry.doclink}">Download</a></div>`;
      break;
    case 'tool':
      html += `<h3><a href="${entry.doclink}" target="_blank">${entry.title}</a></h3><span class="card-type">${entry.type}</span>`;
      if ('categories' in entry) {
        html += ` | <span class="card-category">${entry.categories.join(
          ', '
        )}</span>`;
      }
      html += `<p>${entry.description}</p>`;
      break;
    default:
      html += `<h3><a href="${entry.link}">${entry.title}</a></h3><span class="card-type">${entry.type}</span>`;
      if ('categories' in entry) {
        html += ` | <span class="card-category">${entry.categories.join(
          ', '
        )}</span>`;
      }
      html += `<p>${entry.description}</p>`;
      break;
  }
  activeTab.innerHTML += `<div class="blog-card">${html}</div>`;
}

const buildPage = (currPage, list = allItems) => {
  const trimStart = (currPage - 1) * numPerPage
  const trimEnd = trimStart + numPerPage
  activeTab.textContent = ""
  list.slice(trimStart, trimEnd).forEach(i => displayItem(i))
}


export {init, updatePage, clearSearch}

// buildPage(${totalPages}, list)