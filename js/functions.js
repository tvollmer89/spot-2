import { initSearch, runSearch } from './search'
import { triggerTab, tabEvents, radioEvents } from './tabs';
import { mobileChecks } from './categories';
const homeTab = document.getElementById('all'),
  pager = document.getElementById('blog-pager'),
  numPerPage = 10,
  input = document.getElementById('spot-search'),
  checksContainer = document.getElementById('category-filters'),
  mContainer = document.getElementById('mobile-filters'),
  checks = checksContainer.querySelectorAll("input[type='checkbox']"),
  mChecks = mContainer.querySelectorAll('input[type="checkbox"]'),
  mRadios = mContainer.querySelectorAll('input[type="radio"]');
let allItems = [],
  matchingItems = [],
  activeTab;
let filters = {
  t: '', //text
  activeType: 'all',
  catsChecked: []
};

const init = feed => {
  allItems = feed;
  matchingItems = feed;
  activeTab = homeTab;
  let pageCount = Math.ceil(allItems.length / numPerPage);
  buildPage(1);
  buildPager(1, pageCount);
  initSearch(allItems);
  tabEvents(prepSearch);
  radioEvents(prepSearch);
  addCategoryEvents();
  input.addEventListener('input', updateTextSearch);
};

/**
 * Checks filters and runs search or restarts list if there aren't any
 */
const prepSearch = (newType = filters.activeType, newTab = activeTab) => {
  activeTab = newTab;
  filters.activeType = newType;
  console.log(`prep search activeTab: ${activeTab.id}`);
  if (
    filters.catsChecked.length > 0 ||
    filters.t.length > 2 ||
    filters.activeType != 'all'
  ) {
    console.log(`yest it's true: ${JSON.stringify(filters)}`);
    let r = runSearch(...Object.values(filters));
    updateList(r);
  } else {
    matchingItems = allItems;
    updatePage();
  }
};

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
  if (filters.t.length > 0 && filters.t.length < 3) {
    return;
  }
  prepSearch();
};

const addCategoryEvents = () => {
  mobileChecks();
  checks.forEach(input => {
    input.addEventListener('change', function(e) {
      let val = e.target.value.toLowerCase();
      let mCheck = mContainer.querySelector(`input[value="${e.target.value}"]`);
      console.log(`mCheck: ${mCheck}`);
      if (e.target.checked) {
        filters.catsChecked.push(val);
        mCheck.checked = true;
      } else {
        mCheck.checked = false;
        let i = filters.catsChecked.indexOf(val);
        filters.catsChecked.splice(i, 1);
      }
      prepSearch();
    });
  });
};

const clearSearch = () => {
  document.getElementById('mAll').checked = true;
  checks.forEach(i => {
    i.checked = false;
  });
  mChecks.forEach(i => {
    i.checked = false;
  });

  filters.catsChecked = [];
  filters.t = '';
  input.value = '';
  triggerTab('#all');
  matchingItems = allItems;
  updatePage();
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
  const dots = totalPages > 3;
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

/**
 * 
 * @param {object} entry document/article in solution spot feed
 */
function displayItem(entry) {
  let html = ``;
  /***
   * TODO: Need to check for PDF download and if link should open in new tab!
   *  
   * */

  switch (entry.type) {
    case 'guide':
      let target = entry.linkType ? '_blank' : '_self';
      html += `<h3><a href="${entry.doclink}" target=${target}>${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-file-text"></i></span>`;
      if ('categories' in entry) {
        html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
      }
      html += `<p>${entry.description}</p>`;
      break;
    case 'brochure':
      html += `<h3>${entry.title}</h3><span class="card-type me-2"><i class="bi bi-journal-album"></i></span>`;
      if ('categories' in entry) {
        html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
      }
      if (entry.description != '') {
        html += `<p>${entry.description}</p>`;
      }
      html += `<div class="mb-3"><a class="btn btn-blue" href="${entry.doclink}">Download</a></div>`;
      break;
    case 'tool':
      html += `<h3><a href="${entry.doclink}" target="_blank">${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-calculator-fill"></i></span>`;
      if ('categories' in entry) {
        html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
      }
      html += `<p>${entry.description}</p>`;
      break;
    case 'case-study':
      if(entry.hasOwnProperty('download')){
        html += `<h3>${entry.title}</h3><span class="card-type me-2"><i class="bi bi-journal-album"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        if (entry.description != '') {
          html += `<p>${entry.description}</p>`;
        }
        html += `<div class="mb-3"><a class="btn btn-blue" href="${entry.doclink}">Download</a></div>`;
      } else {
        html += `<h3><a href="${entry.link}">${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-file-richtext"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      }
      break;
    case 'podcast':
      if (entry.hasOwnProperty('doclink')) {
        // console.log(`podcast link: ${JSON.stringify(entry)}`);
        let target = '_self';
        if (entry.hasOwnProperty('linkType')) {
          target = !entry.linkType ? '_self' : '_blank';
        }
        html += `<h3><a href="${entry.doclink}" target=${target}>${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-mic-fill"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      } else {
        html += `<h3><a href="${entry.link}">${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-mic-fill"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      }
      break;
    case 'video':
      if (entry.hasOwnProperty('doclink')) {
        // console.log(`podcast link: ${JSON.stringify(entry)}`);
        let target = '_self';
        if (entry.hasOwnProperty("linkType")) {
          target = !entry.linkType ? '_self' : '_blank';
        }
        html += `<h3><a href="${entry.doclink}" target=${target}>${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-mic-fill"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      } else {
        html += `<h3><a href="${entry.link}">${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-play-circle-fill"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      }
      break;
    default:
      if (entry.hasOwnProperty('doclink')) {
        // console.log(`podcast link: ${JSON.stringify(entry)}`);
        let target = '_self';
        if (entry.hasOwnProperty("linkType")) {
          target = !entry.linkType ? '_self' : '_blank';
        }
        html += `<h3><a href="${entry.doclink}" target=${target}>${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-mic-fill"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      } else {

        html += `<h3><a href="${entry.link}">${entry.title}</a></h3><span class="card-type me-2"><i class="bi bi-pencil-fill"></i></span>`;
        if ('categories' in entry) {
          html += `<span class="card-category">${entry.categories.join(', ')}</span>`;
        }
        html += `<p>${entry.description}</p>`;
      }
      break;
  }
  activeTab.innerHTML += `<div class="blog-card">${html}</div>`;
}

const buildPage = (currPage, list = allItems) => {
  const trimStart = (currPage - 1) * numPerPage;
  const trimEnd = trimStart + numPerPage;
  activeTab.textContent = '';
  list.slice(trimStart, trimEnd).forEach(i => displayItem(i));
};

export { init, clearSearch };

// buildPage(${totalPages}, list)