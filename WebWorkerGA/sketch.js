let worker;

let num_generations;
let crossover_rate;
let mutation_rate;
let population_size;
let population;

let active_msg;

let target;


function setup() {
  active_msg = {};
  createCanvas(640, 400);
  target = "I am a dwarf and I'm digging a hole"

  num_generations = 1000;
  population_size = 1000;
  crossover_rate = 0.7;
  mutation_rate = 0.2;


  worker = new Worker("worker.js");
  worker.iterations = 0;
  worker.onmessage = (e) => {
    active_msg = e;
    console.log(`[From worker]: ${e.data.msg}`);

    let msg = "run";
    worker.iterations++;
    if (worker.iterations > num_generations || e.data.msg == "done") {
      msg = "done";
    }
    const reply = setTimeout(() => worker.postMessage({ 'state': msg, 'iterations': worker.iterations }), 50);//1000);
  };
  worker.postMessage({
    "state": "init",
    "iterations": worker.iterations,
    "num_generations": num_generations,
    "population_size": population_size,
    "crossover_rate": crossover_rate,
    "mutation_rate": mutation_rate,
    "target": target
  });
}

function draw() {
  textSize(24);
  fill(255);

  if (active_msg.data) {
    if (active_msg.data.msg == "init") {
      background(color(0, 155, 0));
    } else if (active_msg.data.msg == "active") {
      background(color(252, 171, 78));
      text(`Generation [${active_msg.data.generation}]`, 20, 20);
      text(`Individual [${active_msg.data.elite}]`, 20, 60);
      text(`Target [${target}]`, 20, 100);
    } else if (active_msg.data.msg == "done") {
      background(color(60, 176, 137));
      text(`Generation [${active_msg.data.generation}]`, 20, 20);
      text(`Individual [${active_msg.data.elite}]`, 20, 60);
      text(`Target [${target}]`, 20, 100);
    } else {
      background(color(255, 0, 255));
      text("ERROR", 20, 20);
    }
  }

  // if (worker.iterations == num_generations + 1) {
  //   background("#00ff00");
  //   text("DONE", 20, 20);
  // } else {
  //   background("#ff0000");
  //   text(`Round ${worker.iterations} / ${num_generations}`, 20, 20);
  // }
}