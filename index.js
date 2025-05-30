class GeneticAlgorithm {
  constructor(populationSize, n, mutationRate) {
    this.populationSize = populationSize;
    this.n = n; // Board size (n x n)
    this.mutationRate = mutationRate;
    this.population = this.initializePopulation();
  }

  //   Initialize random population
  initializePopulation() {
    const population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const individual = [];
      for (let j = 0; j < this.n; j++) {
        individual.push(Math.floor(Math.random() * this.n));
      }
      population.push(individual);
    }
    return population;
  }

  // Fitness function - counts non-attacking queens
  calculateFitness(individual) {
    let conflicts = 0;

    // Check for conflicts in rows and diagonals
    for (let i = 0; i < this.n; i++) {
      for (let j = i + 1; j < this.n; j++) {
        // Same row or same diagonal
        if (
          individual[i] === individual[j] || // same row
          Math.abs(individual[i] - individual[j]) === Math.abs(i - j) //same diagonal
        ) {
          conflicts++;
        }
      }
    }

    // Return number of non-attacking queens
    return (this.n * (this.n - 1)) / 2 - conflicts;
  }

  // Tournament selection
  selectParent() {
    const tournamentSize = 5;
    let tournament = [];

    // Select random individuals for tournament
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.populationSize);
      tournament.push(this.population[randomIndex]);
    }

    // Find the fittest in the tournament
    tournament.sort(
      (a, b) => this.calculateFitness(b) - this.calculateFitness(a) //sorts descending
    );
    return tournament[0];
  }

  // Crossover (single point)
  crossover(parent1, parent2) {
    const crossoverPoint = Math.floor(Math.random() * this.n);
    const child1 = [];
    const child2 = [];

    for (let i = 0; i < this.n; i++) {
      if (i < crossoverPoint) {
        child1.push(parent1[i]);
        child2.push(parent2[i]);
      } else {
        child1.push(parent2[i]);
        child2.push(parent1[i]);
      }
    }

    return { child1, child2 };
  }

  // Mutation (random reset)
  mutate(individual) {
    for (let i = 0; i < this.n; i++) {
      if (Math.random() < this.mutationRate) {
        individual[i] = Math.floor(Math.random() * this.n);
      }
    }
    return individual;
  }

  // Evolve to next generation
  evolve() {
    const newPopulation = [];

    // Elitism - keep the best individual
    this.population.sort(
      (a, b) => this.calculateFitness(b) - this.calculateFitness(a)
    );
    newPopulation.push([...this.population[0]]);

    // Fill the rest of the population
    for (let i = 1; i < this.populationSize / 2; i++) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      let { child1, child2 } = this.crossover(parent1, parent2);

      child1 = this.mutate(child1);
      child2 = this.mutate(child2);
      newPopulation.push(child1);
      newPopulation.push(child2);
    }
    if (this.populationSize % 2 === 0) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      let { child1 } = this.crossover(parent1, parent2);
      child1 = this.mutate(child1);
      newPopulation.push(child1);
    }
    this.population = newPopulation;
  }

  // Find solution
  findSolution(maxGenerations) {
    let fitness;
    for (var gen = 0; gen < maxGenerations; gen++) {
      // Check if we found a solution
      for (let i = 0; i < this.populationSize; i++) {
        fitness = 0;
        fitness = this.calculateFitness(this.population[i]);
        if (fitness === (this.n * (this.n - 1)) / 2) {
          showGen(
            gen,
            this.population[i],
            fitness,
            i,
            this.n,
            this.populationSize
          );
          showChart(gen + 1);
          return {
            solution: this.population[i],
            generation: gen,
            populationNum: i,
          };
        } else {
          showGen(
            gen,
            this.population[i],
            fitness,
            i,
            this.n,
            this.populationSize
          );
        }
      }

      this.evolve();
    }
    showChart(gen);

    return { solution: null, generation: maxGenerations };
  }
}

var fitnessArr = [];
const avgFitnessArr = [];
const bestFitnessArr = [];

function showGen(gen, individual, fitness, i, n, populationSize) {
  const p = document.createElement("p");
  const p2 = document.createElement("p");
  const root = document.getElementById("root");
  p.innerHTML = `generation: ${gen}.${i} individual: ${individual} fitness: ${fitness} `;
  fitnessArr.push(fitness);
  // If we reached the last individual or found a solution, calculat  e average fitness
  if (i == populationSize - 1 || fitness == (n * (n - 1)) / 2) {
    let avg = 0;
    fitnessArr.forEach((num) => (avg += num));
    // Calculate average fitness
    if (fitness == (n * (n - 1)) / 2) {
      avg = parseFloat((avg / i).toFixed(2));
    } else avg = parseFloat((avg / populationSize).toFixed(2));
    // Sort fitness array to find the best fitness
    fitnessArr.sort((a, b) => b - a);

    p2.innerHTML = `average fitness in this generation is: ${avg} and the best fitness is: ${fitnessArr[0]}`;
    avgFitnessArr.push(avg);
    bestFitnessArr.push(fitnessArr[0]);

    fitnessArr = [];
  }
  root.appendChild(p);
  root.appendChild(p2);
}

// Example usage
function solveNQueens(
  n,
  populationSize = 100,
  mutationRate = 0.01,
  maxGenerations = 1000
) {
  const ga = new GeneticAlgorithm(populationSize, n, mutationRate);
  const { solution, generation, populationNum } =
    ga.findSolution(maxGenerations);
  const result = document.getElementById("result");
  result.innerHTML = "";
  if (solution) {
    result.innerHTML = `Solution found in generation ${generation}.${populationNum}: ${solution}`;

    // Print the board
    console.log("\nBoard:");
    for (let row = 0; row < n; row++) {
      let line = "";
      for (let col = 0; col < n; col++) {
        line += solution[col] === row ? "Q " : ". ";
      }
      console.log(line);
    }
  } else {
    result.innerHTML = `No solution found in ${maxGenerations} generations.`;
  }
  root.appendChild(p);
  return solution;
}

function showChart(gen) {
  const xValuesArr = [];
  for (let i = 0; i < gen; i++) {
    xValuesArr.push(i);
  }

  const xValues = xValuesArr;

  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          data: avgFitnessArr,
          borderColor: "red",
          fill: false,
        },
        {
          data: bestFitnessArr,
          borderColor: "green",
          fill: false,
        },
      ],
    },
    options: {
      legend: { display: false },
    },
  });
}

function getValues() {
  const populationSize = parseInt(
    document.getElementById("populationSize").value
  );
  const mutationRate = parseFloat(
    document.getElementById("mutationRate").value
  );
  const maxGenerations = parseInt(
    document.getElementById("maxGenerations").value
  );
  const n = parseInt(document.getElementById("n").value);

  // Display "Please wait..." message
  const result = document.getElementById("result");
  result.innerHTML = "Please wait...";

  // Clear previous results
  document.getElementById("root").innerHTML = "";
  avgFitnessArr.length = 0;
  bestFitnessArr.length = 0;

  // Solve the N-Queens problem with the provided values
  setTimeout(() => {
    solveNQueens(n, populationSize, mutationRate, maxGenerations);
  }, 0); // Ensure UI updates before computation starts
}

button = document.getElementById("startButton");
button.addEventListener("click", getValues);

button = document.getElementById("startButton");
button.addEventListener("click", getValues);

// Solve 8-queens problem
//solveNQueens(8);
