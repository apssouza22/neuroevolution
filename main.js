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
    const [mom, dad] = game.gaPopulation.selection();
    if(mom.totalCarsOverTaken > 0 || e) {
        mom.brain.save("momBrain");
        dad.brain.save("dadBrain");
    }
}

function discard() {
    localStorage.removeItem("momBrain");
    localStorage.removeItem("dadBrain");
}

function trainGeneticAlgo(time) {
    function animate(time) {
        for (let i = 0; i < 1; i++) {
            game.playStep(time);
        }
        requestAnimationFrame(animate);
    }
    animate(time)
}