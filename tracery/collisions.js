// collide with a pickup object
function collidePickup(e, p) {
  // only pickup is the blue crab
  if (chunkIndex == e.chunk) {
    player.inventory.push("Blue Crab");
    pickupSprites.remove(e);
    e.remove();

    //console.log(npcSprites);
    // this doesn't work on all chunks!
    for (let _i = 0; _i < npcSprites.length; _i++) {
      if (npcSprites[_i].questGiver) {
        npcSprites[_i].quest["done"] = true;
        npcSprites[_i].ai = "wander";
      }
    }
  }
}

// collide with an NPC
function collideNPC(e, p) {
  if (chunkIndex == e.chunk) {
    activeNPCString = e.vipTitle + " " + e.name + ", " + e.occupation + " [" + e.mood + "]";
    activeNPCStringTimer = activeNPCStringTime;

    //console.log(e);

    // if one quest is finished, all quests are finished!!

    if (e.questGiver) { // display message 
      if (e.quest["done"])
        activeNPCString += " : " + e.quest["thanks"];
      else
        if ((e.quest["quest"] == "body") || (e.quest["quest"] == "fish")) {
          activeNPCString += ": " + npc.quest["questDialogue"][npc.dialogue_index];
          npc.dialogue_index++;
          if (npc.dialogue_index >= npc.quest["questDialogue"].length)
            npc.dialogue_index = 0;
        } else
          activeNPCString += " : " + e.quest["quest"];
    }
    //textSize(24);
    //fill(255);
    //text(e.name + ": how's it goin?", e.position.x + 10, e.position.y - 10);
    //console.log(npc.name + '\n' + npc.mood + '\n' + npc.vipTitle + '\n' + npc.occupation);
  }
}

