// Daniel Shiffman
// Neuro-Evolution Flappy Bird with TensorFlow.js
// http://thecodingtrain.com
// https://youtu.be/cdUNkwXx-I4

/**
 * To enable manual play. Change TOTAL=2 and NEUROEVOLUTION_ENABLED=false
 * @type {number}
 */
const TOTAL = 250;
const NEUROEVOLUTION_ENABLED=true
let birds = [];
let savedBirds = [];
let pipes = [];
let counter = 0;
let slider;
let genericEvolution;


/**
 * Set up the sketch. This is called by the p5 framework
 */
function setup() {
  createCanvas(640, 480);
  slider = createSlider(1, 10, 1);
  for (let i = 0; i < TOTAL; i++) {
    birds[i] = new Bird();
  }
  genericEvolution = new GeneticEvolution(new BirdsPopulation(savedBirds));
}

/**
 * Draw the game. It is called for each frame. This is called by the p5 framework
 */
function draw() {
  for (let n = 0; n < slider.value(); n++) {
    if (counter % 75 == 0) {
      pipes.push(new Pipe());
    }
    counter++;

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();

      for (let j = birds.length - 1; j >= 0; j--) {
        if (pipes[i].hits(birds[j])) {
          savedBirds.push(birds.splice(j, 1)[0]);
        }
      }

      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }

    for (let i = birds.length - 1; i >= 0; i--) {
      if (birds[i].offScreen()) {
        let spliceElement = birds.splice(i, 1)[0];
        savedBirds.push(spliceElement);
      }
    }

    for (let bird of birds) {
      bird.think(pipes);
      bird.update();
    }

    if (birds.length === 0) {
      counter = 0;
      nextGeneration();
      pipes = [];
    }
  }

  // All the drawing stuff
  background(0);

  for (let bird of birds) {
    bird.show();
  }

  for (let pipe of pipes) {
    pipe.show();
  }
}

function keyPressed() {
  if (key == ' ') {
    for (let bird of birds) {
      bird.up();
    }
  }
}

