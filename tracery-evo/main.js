// http://www.rangakrish.com/downloads/RiTa-Generation.js
// novelty search metrics
let numGenerations;
let populationSize;
let generation;
let population;
let archive;
let k;

//let grammar;

// debug
let t;

let markov;
let data1;

function generateIndividual(origin) {
}
function evaluate(individual) {
}
function selection() {
}
function mutation() {
}
function crossover() {
}

function preload() {
  data1 = loadStrings("kafka.txt");
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  markov = RiTa.markov(4);
  markov.addText(data1.join(' '));



  //splash_grammar = tracery.createGrammar(grammars.splash);
  //grammar = tracery.createGrammar(grammars.conference);//.neverbar);

  textSize(24);
  fill(255);

  t = ["Hello there"];
  //t = "Hello there";
  //t = splash_grammar.flatten("#origin#");

  /*
  textAlign(CENTER, CENTER);
  text('hello there',0,0, width, height);
  */

  randomSeed(1);

  generation = 0;
  populationSize = 200;
  numGenerations = 50;

  // initialize population
}

function draw() {
  background(0);
  textAlign(LEFT, TOP);
  text("Generation: " + generation, 20, 20, width-100, height-50);

  // randomly draw best individual in a box
  textAlign(CENTER, CENTER);
  text(t.join(' '),0,0, width, height);

  // evaluate
  // crossover
  // mutate





  // increment generation
  // update on a delay to "show"
  if ((frameCount % 100) == 0) {
    //t = grammar.flatten("#origin#");
    t = markov.generate(40);

    generation++;
    if (generation >= numGenerations) {
      noLoop();
    }
  }
}