let worker;

let num_generations;
let crossover_rate;
let mutation_rate;
let population_size;
let population;


function setup() {
  createCanvas(400, 400);

  num_generations = 1000;
  population_size = 1000;
  crossover_rate = 0.7;
  mutation_rate = 0.2;


  worker = new Worker("worker.js");
  worker.iterations = 0;
  worker.onmessage = (e) => {
    const message = e.data;
    console.log(`[From worker]: ${message}`);

    let msg = "run";
    worker.iterations++;
    if (worker.iterations > num_generations || message.includes("DONE")) {
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
    "target": "This is the target woo"
  });
}

function draw() {
  textSize(24);
  fill(255);

  if (worker.iterations == num_generations + 1) {
    background("#00ff00");
    text("DONE", 20, 20);
  } else {
    background("#ff0000");
    text(`Round ${worker.iterations} / ${num_generations}`, 20, 20);
  }
}