// Daniel Shiffman
// Neuro-Evolution Flappy Bird

function nextGeneration() {
  console.log('next generation');
  genericEvolution.evolve()
  birds = [...genericEvolution.getPopulationHandler().population]
  savedBirds = [];
}

class BirdsPopulation extends PopulationHandler{
  constructor(population) {
    super(population)
  }

  calculateFitness() {
    let sum = 0;
    for (let bird of savedBirds) {
      sum += bird.score;
    }
    for (let bird of savedBirds) {
      bird.fitness = bird.score / sum;
    }
  }
  reset(){
    for (const bird of this.getPopulation()) {
      bird.y = height / 2;
      bird.x = 64;
    }
  }

}