import { Tab } from 'bootstrap';
// import * as bootstrap from 'bootstrap';

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
      onClick(document.getElementById(tabName), newType);
    });
  });
};

export { triggerTab, tabEvents };
