import { triggerTab } from './tabs';
const mobileContainer = document.getElementById('mobile-filters');

// const mobileTypes = () => {
//   const radios = mobileContainer.querySelectorAll('input[type="radio"]');
//   radios.forEach(radio => {
//     radio.addEventListener('click', function(e) {
//       let val = e.target.value;
//       console.log(`radio val: ${val}`);
//       triggerTab(`${val}`);
//     });
//   });
// };

/**
 * this isn't working because only the "all" tab exists on mobile. clicking on the radio button should trigger the search function then figure out how to update the tabs on desktop
 */

const mobileChecks = () => {
  const deskContainer = document.getElementById('category-filters'),
    checks = mobileContainer.querySelectorAll('input[type="checkbox"]');
  checks.forEach(input => {
    input.addEventListener('click', function(e) {
      let cat = e.target.value;
      let dCheck = deskContainer.querySelector(`input[value="${cat}"]`);
      dCheck.click();
    });
  });
};

export { mobileChecks };
