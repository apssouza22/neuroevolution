setTimeout(() => {
    // reload the page after 5 minutes to avoid memory leaks
    location.reload();
}, 1000 * 60 * 5);

let populationCount = 500;
let gameStepFrameCount = 1;
const networkVisualizer = new NetworkVisualizer(document.getElementById("networkCanvas"));
const game = new Game(document.getElementById("carCanvas"));
console.log("Training genetic algorithm");
trainGeneticAlgo();

function updateFrameLoop(input) {
    gameStepFrameCount = input.value == "" ? 1 : input.value;
}

function updatePopulation(input) {
    populationCount = input.value == "" ? 500 : input.value;
    populationCount = populationCount < 2 ? 2 : populationCount;
    game.gaPopulation = new CarPopulation(parseInt(populationCount), 0.1);
    game.init();
}

function save(e) {
    const [mom, dad] = game.gaPopulation.selection();
    if (mom.totalCarsOverTaken > 0 || e) {
        mom.brain.nn.save("momBrain");
        dad.brain.nn.save("dadBrain");
    }
}

function discard() {
    localStorage.removeItem("momBrain");
    localStorage.removeItem("dadBrain");
}

function trainGeneticAlgo(time) {
    function animate(time) {
        for (let i = 0; i < gameStepFrameCount; i++) {
            let {gameOver,} = game.playStep(time);
            if (!gameOver) {
                networkVisualizer.updateNetwork(time, game.bestCar.brain);
            }
        }
        requestAnimationFrame(animate);
    }

    animate(time)
}