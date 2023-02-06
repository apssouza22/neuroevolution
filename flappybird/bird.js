// Daniel Shiffman
// Neuro-Evolution Flappy Bird with TensorFlow.js
// http://thecodingtrain.com
// https://youtu.be/cdUNkwXx-I4

class Bird extends PopulationItem{
  constructor() {
    super([5, 8, 2]);
    this.y = height / 2;
    this.x = 64;

    this.gravity = 0.8;
    this.lift = -12;
    this.velocity = 0;

    this.score = 0;
    this.fitness = 0;

  }

  show() {
    stroke(255);
    fill(255, 100);
    ellipse(this.x, this.y, 32, 32);
  }

  up() {
    this.velocity += this.lift;
  }

  think(pipes) {
    let closestPipe = this.getClosestPipe(pipes);
    let inputs = this.prepareEnvInput(closestPipe);

    let output =this.genetics.useGenes(inputs)

    if (output[0] > output[1]) {
      this.up();
    }
  }

  prepareEnvInput(closestPipe) {
    let inputs = [];
    inputs[0] = this.y / height;
    inputs[1] = closestPipe.top / height;
    inputs[2] = closestPipe.bottom / height;
    inputs[3] = closestPipe.x / width;
    inputs[4] = this.velocity / 10;
    return inputs;
  }

  getClosestPipe(pipes) {
    let closest = null;
    let closestD = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      let d = pipes[i].x + pipes[i].w - this.x;
      if (d < closestD && d > 0) {
        closest = pipes[i];
        closestD = d;
      }
    }
    return closest;
  }

  offScreen() {
    return this.y > height || this.y < 0;
  }

  update() {
    this.score++;

    this.velocity += this.gravity;
    this.y += this.velocity;
  }

  calcFitness() {
    this.fitness = this.score
    return this.fitness;
  }
}
