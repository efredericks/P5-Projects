items = {
  HP: function () {
    player.hp += 5;
  },
  CROWN: function (which) {
    if (which == "add")
      player.ac += 10;
    else
      player.ac -= 10;
  }
};