/* Helper functions */

// https://www.webtips.dev/webtips/javascript/how-to-clamp-numbers-in-javascript
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}