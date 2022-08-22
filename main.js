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

function save(e) {
    if(game.bestCars[0].totalCarsOvertaken > 0 || e) {
        console.log("Saving brain to local storage");
        localStorage.setItem("bestBrain", JSON.stringify(game.bestCars[0].brain.getWeights()));
        localStorage.setItem("bestBrain2", JSON.stringify(game.bestCars[1].brain.getWeights()));
    }
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestBrain2");
}

function trainGeneticAlgo(time) {
    function animate(time) {
        game.playStep(time);
        requestAnimationFrame(animate);
    }
    animate(time)
}