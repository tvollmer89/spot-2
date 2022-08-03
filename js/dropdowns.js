import * as Popper from '@popperjs/core';
import { Dropdown } from 'bootstrap';

export default function() {
  const dropToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
  dropToggles.forEach(tog => {
    let newDrop = new Dropdown(tog, {
      popperConfig(defaultBsPopperConfig) {
        return defaultBsPopperConfig;
      }
    });
    tog.addEventListener('click', () => {
      newDrop.toggle();
    });
  });
}
