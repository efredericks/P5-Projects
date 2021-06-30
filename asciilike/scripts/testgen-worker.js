onmessage = e => {
  const message = e.data;
  console.log(`[From main]: ${message}`);

  if (message == "CLOSE") {
    console.log("over");
    close();
  } else {
    const reply = setTimeout(() => postMessage("test execution go go go"), 3000);
  }
};

/*
Screens:
1. Generic text
2. Event - enemy
3. Event - npc
4. Event - environmental
5. Stairs up
6. Stairs down
7. Friend in room
8. Friend in nearby room
*/




// ---- functional tests




// ---- non-functional tests
/*

* No two passages have the same text.
* 

*/