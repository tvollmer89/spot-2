import { Tab } from 'bootstrap';
const mobileContainer = document.getElementById('mobile-filters');

/**
 * 
 * @param {string} tabName id of target tab (i.e. '#all')
 */
const triggerTab = tabName => {
  const targetTab = document.querySelector(
    `#type-tabs a[data-bs-target='${tabName}']`
  );
  Tab.getInstance(targetTab).show();
};

const tabEvents = onClick => {
  const tabs = document.querySelectorAll('.type-tab');
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', event => {
      const newType = event.target.getAttribute('data-filter');
      const tabName = event.target.getAttribute('aria-controls');
      // currentFilters.activeType = newType;
      onClick(newType, document.getElementById(tabName));
    });
  });
};

const radioEvents = onClick => {
  const radios = document.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    radio.addEventListener('click', event => {
      const newType = event.target.value;
      const tabName = event.target.getAttribute('data-tab');
      //adjust tabname
      console.log(`radio: ${document.getElementById(tabName)}`);
      onClick(newType);
    });
  });
};

export { triggerTab, tabEvents, radioEvents };
