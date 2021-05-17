function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getSpriteOffset(row, col, twidth, theight) {
  let dx = col * twidth;
  let dy = row * theight;
  return { 'dx': dx, 'dy': dy };
}

function tryTo(desc, callback) {
  for (let timeout = 1000; timeout > 0; timeout--) {
    if (callback())
      return;
  }
  throw "Timeout while trying to " + desc;
}

function shuffle(arr) {
  let tmp, r;
  for (let i = 1; i < arr.length; i++) {
    r = getRandomInteger(0, i+1);
    tmp = arr[i];
    arr[i] = arr[r];
    arr[r] = tmp;
  }
  return arr;
}
