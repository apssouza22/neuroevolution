const GAME_INFO = {
    brainMode: "GA",
    totalCarsOvertaken: 0,
}

setTimeout(() => {
    location.reload();
}, 1000 * 60 * 5);

let N = 500;
let GAME_STEP_PER_FRAME = 1;
let gameCommands = [1, 0, 0, 0]

const networkVisualizer = new NetworkVisualizer(document.getElementById("networkCanvas"));
const game = new Game(document.getElementById("carCanvas"));

if (GAME_INFO.brainMode == "GA") {
    console.log("Training genetic algorithm");
    trainGeneticAlgo();
} else {
    N = 1;
    console.log("Training RL Agent ");
    trainRLAgent(game);
}

function save(e) {
    const [mom, dad] = game.gaPopulation.selection();
    if(mom.totalCarsOverTaken > 0 || e) {
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
        for (let i = 0; i < GAME_STEP_PER_FRAME; i++) {
            let {_,gameOver,} = game.playStep(time);
            if (!gameOver) {
                networkVisualizer.updateNetwork(time, game.bestCar.brain);
            }
        }
        requestAnimationFrame(animate);
    }
    animate(time)
}