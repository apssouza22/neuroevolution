const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;
const networkCtx = networkCanvas.getContext("2d");
const GAME_INFO = {
    brainMode: "GA",
    totalCarsOvertaken: 0,
}
let N = 500;
let gameCommands = [1, 1, 0, 0]
const game = new Game();
if (GAME_INFO.brainMode == "GA") {
    console.log("Training genetic algorithm");
    trainGeneticAlgo();
} else {
    N = 1;
    console.log("Training RL Agent ");
    trainRLAgent(game);
}

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(game.bestCars[0].brain.getWeights()));
    localStorage.setItem("bestBrain2", JSON.stringify(game.bestCars[1].brain.getWeights()));
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestBrain2");
}

setTimeout(() => {
    console.log("Restarting simulation");
    if (game.passFirstTrafficCar) {
        save()
    }
    location.reload();
}, 60000);

function trainGeneticAlgo(time) {
    game.playStep(time);
    requestAnimationFrame(trainGeneticAlgo);
}