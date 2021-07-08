let gaConfig = {};

let getRandomInteger = function (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomGene(genes) {
  return genes[getRandomInteger(0, genes.length)];
}

function mutate(parent) {
  let indx = getRandomInteger(0, parent.individual.length);
  parent.individual[indx] = randomGene(gaConfig.genes);
  return parent;
}

function crossover(parent1, parent2) {
  let children = ["", ""];

  let split = getRandomInteger(1, parent1.individual.length);

  for (let i = 0; i < split; i++) {
    children[0] += parent1.individual[i];
    children[1] += parent2.individual[i];
  }
  for (let i = split; i < parent1.individual.length; i++) {
    children[0] += parent2.individual[i];
    children[1] += parent1.individual[i];
  }

  // for (let i = 0; i < parent1.individual.length; i++) {
  //   let r = Math.random();

  //   if (r < 0.45) {
  //     children[0] += parent1.individual[i];
  //     children[1] += parent2.individual[i];
  //   } else if (r < 0.9) {
  //     children[0] += parent2.individual[i];
  //     children[1] += parent1.individual[i];
  //   } else {
  //     children[0] += randomGene(gaConfig.genes);
  //     children[1] += randomGene(gaConfig.genes);
  //   }
  // }
  return children;
}

function calcFitness(individual) {
  fitness = 0;
  for (let i = 0; i < individual.length; i++) {
    if (individual[i] != gaConfig.target[i])
      fitness++;
  }
  return fitness;
}

function createPopulation(population_size) {
  pop = [];
  while (pop.length < population_size)
    pop.push(createIndividual());
  return pop;
}

function createIndividual() {
  indiv = "";

  while (indiv.length < gaConfig.target.length)
    indiv += randomGene(gaConfig.genes);

  return { 'individual': indiv, 'fitness': calcFitness(indiv) };
}


onmessage = e => {
  // const message = e.data;
  // console.log(e);

  console.log(`[From main]: ${e.data.state}`);

  if (e.data.state == "done") {
    console.log("over");
    close();
  } else if (e.data.state == "init") {
    gaConfig.num_generations = e.data.num_generations;
    gaConfig.population_size = e.data.population_size;
    gaConfig.mutation_rate = e.data.mutation_rate;
    gaConfig.crossover_rate = e.data.crossover_rate;
    gaConfig.num_to_mutate = Math.floor(gaConfig.mutation_rate * gaConfig.population_size);
    gaConfig.num_to_xover = Math.floor((gaConfig.crossover_rate * gaConfig.population_size)/2);
    gaConfig.iterations = e.data.iterations;
    gaConfig.target = e.data.target;
    gaConfig.genes = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890, .-;:_!"#%&/()=?@${[]}';
    gaConfig.population = createPopulation(gaConfig.population_size);

    const reply = setTimeout(() => postMessage("init successful"), 50);//1000);
  } else {
    gaConfig.iterations = e.data.iterations;

    // sort population
    gaConfig.population.sort(function (a, b) {
      return a.fitness - b.fitness;
    });

    // check if done
    if (gaConfig.population[0].fitness <= 0) {
      const reply = setTimeout(() => postMessage(`DONE: Generation [${gaConfig.iterations}] Individual [${gaConfig.population[0].individual}]`), 50);//1000);
    } else {
      nextPopulation = [];

      // elite preservation (just 1?)
      for (let i = 0; i < Math.floor(gaConfig.population_size*0.1); i++) {
        nextPopulation.push(gaConfig.population[i]);
      }

      // crossover
      for (let i = 0; i < gaConfig.num_to_xover; i++) {
        let parent1, parent2;
        do {
          // parent1 = gaConfig.population[getRandomInteger(0,gaConfig.population_size)];
          // parent2 = gaConfig.population[getRandomInteger(0,gaConfig.population_size)];
          parent1 = gaConfig.population[getRandomInteger(0,gaConfig.population_size/2)];
          parent2 = gaConfig.population[getRandomInteger(0,gaConfig.population_size/2)];
        } while (parent1 === parent2);
        children = crossover(parent1, parent2);
        nextPopulation.push({'individual': children[0], 'fitness': calcFitness(children[0])});
        nextPopulation.push({'individual': children[1], 'fitness': calcFitness(children[1])});
      }

      // mutate
      for (let i = 0; i < gaConfig.num_to_mutate; i++) {
        let indx = getRandomInteger(0, nextPopulation.length);
        nextPopulation[indx] = mutate(nextPopulation[indx]);
      }

      // update population
      while (nextPopulation.length < gaConfig.population_size) {
        nextPopulation.push(createIndividual());
      }
      gaConfig.population = [];
      for (let i = 0; i < gaConfig.population_size; i++) {
        nextPopulation[i].fitness = calcFitness(nextPopulation[i].individual);
        gaConfig.population.push(nextPopulation[i]);
      }

      gaConfig.population.sort(function (a, b) {
        return a.fitness - b.fitness;
      });
      const reply = setTimeout(() => postMessage(`Generation [${gaConfig.iterations}] Elite [${gaConfig.population[0].individual}]`), 50);//1000);

      // POST BACK AND DRAW!
    }

    console.log(gaConfig);
  }
};