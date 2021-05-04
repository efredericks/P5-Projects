function createCharacter(name, row, col, char_type, ai, img, chunk) {
  let spr = createSprite((TILE_WIDTH * 2) + (TILE_WIDTH / 2), (TILE_HEIGHT * 2) + (TILE_HEIGHT / 2), TILE_WIDTH, TILE_HEIGHT);
  spr.addImage(img);
  spr.image = img;

  spr.name = name;
  spr.row = row;
  spr.col = col;
  spr.char_type = char_type; // NPC, enemy
  spr.ai = ai;
  spr.chunk = chunk;
  spr.depth = NPC_INDEX;

  spr.draw = function () {
    if (chunkIndex == spr.chunk) {
      image(spr.image, spr.deltaX * 2, spr.deltaY * 2);
    }
  }
  spr.update = function () {
    //if ((chunkIndex == this.chunk) && (!paused))  // only update on current chunk / not paused
    if ((chunkIndex == this.chunk) && (CURRENT_SCENE == SCENES.GAME))  // only update on current chunk / not paused
      chunkNPCSprites.add(this);
    else
      chunkNPCSprites.remove(this);
  }

  return spr;
}

/*
class Character {
  constructor(name, sprite, row, col, char_type, ai, image, chunk) {

  }
  setNPC(mood, vipTitle, occupation, speed, questGiver, quest) {
    this.mood = mood;
    this.vipTitle = vipTitle;
    this.occupation = occupation;
    this.speed = speed;
    this.chunk = chunk;
    this.quest = quest;
    this.questGiver = questGiver;
  }
}
*/

/*
  // npc
  let questGiver = getRandomInteger(0, numGenericNPCs);
  for (let _n = 0; _n < numGenericNPCs + 2; _n++) {
    let _c = getRandomInteger(1, MAP_COLS - 1);
    let _r = getRandomInteger(1, MAP_ROWS - 1);

    if (_n == numGenericNPCs) { // campfire friend
      _r = _cf_row;
      _c = _cf_col;
    } else if (_n == numGenericNPCs+1) { // fisherman friend
      _r = 50;
      _c = 61;
    }

    npc = createSprite((TILE_WIDTH * _c) + (TILE_WIDTH / 2), (TILE_HEIGHT * _r) + (TILE_HEIGHT / 2), TILE_WIDTH, TILE_HEIGHT);
    /// generative:
    npc.name = npc_grammar.flatten("#name#");
    npc.mood = npc_grammar.flatten("#mood#");
    npc.vipTitle = npc_grammar.flatten("#vipTitle#");
    npc.occupation = npc_grammar.flatten("#occupation#");
    ///
    npc.depth = NPC_INDEX;
    //npc.addImage = npcImg;
    npc.chunk = getRandomInteger(0, NUM_CHUNKS); //1;
    npc.speed = 2; // tbd
    npc.dialogue_index = 0;

    if (_n == questGiver) {
      npc.questGiver = true;
      npc.ai = "follow";
      console.log("Questy McQuesterson on: " + npc.chunk);
      npc.quest = {
        "quest": "Have you seen my BLUE CRAB?", // make this a list?
        "thanks": "Thanks m8",
        "done": false
      };
    } else if (_n == numGenericNPCs) { // last one hangs by the campfire
      npc.questGiver = true;
      npc.ai = "loiter";
      npc.chunk = _campfireChunk;
      npc.quest = {
        "quest": "body", // make this a list?
        "questDialogue": [
          event_grammar.flatten("#campfire1#"),
          event_grammar.flatten("#campfire2#"),
          event_grammar.flatten("#campfire3#"),
          event_grammar.flatten("#campfire4#"),
          event_grammar.flatten("#campfire5#"),
          event_grammar.flatten("#campfire6#"),
          event_grammar.flatten("#campfire7#"),
        ],
        "thanks": "Thanks m8",
        "done": false
      };
      console.log(npc.quest["questDialogue"]);
    } else if (_n == numGenericNPCs+1) { // mike the fisherman
      npc.name = "Mike the Fisherman";
      npc.questGiver = true;
      npc.ai = "loiter";
      npc.chunk = NUM_CHUNKS+TOWN_CHUNKS.FRILL;
      npc.quest = {
        "quest": "fish", // make this a list?
        "questDialogue": [
          "Hey there",
        ],
        "thanks": "Thank you!",
        "done": false
      };
    } else {
      npc.questGiver = false;
      npc.ai = "wander";
    }

    npc.draw = function () {
      if (chunkIndex == this.chunk) {
        //if (this.questGiver)
          //rect(this.deltaX * 2, this.deltaY * 2, this.width + 5, this.height + 5);
        image(npcImg, this.deltaX * 2, this.deltaY * 2);
      }
    }
    npc.update = function () {
      if ((chunkIndex == this.chunk) && (!paused)) { // only update on current chunk / not paused
        chunkNPCSprites.add(this);

        // update based on AI type
        if (this.ai == "wander") {
          if (random() > 0.9) { // decide to move

            // pick a direction
            let _dirs = ["up", "down", "left", "right"];
            let _move = {};
            _move[_dirs[Math.floor(Math.random() * _dirs.length)]] = true;
            let _retval = checkMove(this.position, chunkIndex, _move);
            //_dirs[Math.floor(Math.random() * _dirs.length)]);
            if (_retval['state']) { // true -- move
              this.position.x = _retval['pos']['dx'];
              this.position.y = _retval['pos']['dy'];
            }
          }
        } else if (this.ai == "loiter") {
          ;

        } else if (this.ai == "follow") {
          // https://stackoverflow.com/questions/20044791/how-to-make-an-enemy-follow-the-player-in-pygame
          if (random() > 0.8) { // move towards player
            // direction vector
            let dx = player.position.x - this.position.x;
            let dy = player.position.y - this.position.y;
            let dist = Math.hypot(dx, dy);

            // normalize
            dx /= dist;
            dy /= dist;

            if (!(dist == 16)) {
              if (random() > 0.5) { // move x
                if (dx > 0)
                  this.position.x += TILE_WIDTH;
                else if (dx < 0)
                  this.position.x -= TILE_WIDTH;
              } else { // move y
                if (dy > 0)
                  this.position.y += TILE_HEIGHT;
                else if (dy < 0)
                  this.position.y -= TILE_HEIGHT;
              }
            }

            //this.position.x += dx * this.speed;
            //this.position.y += dy * this.speed;
          }
        }
      } else // remove from colliders
        chunkNPCSprites.remove(this);
    }
    npcSprites.add(npc);
  }



  */