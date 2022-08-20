const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;
const networkCtx = networkCanvas.getContext("2d");
const N = 500;
const game = new Game();
animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCars[0].brain.getWeights()));
    localStorage.setItem("bestBrain2", JSON.stringify(bestCars[1].brain.getWeights()));
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


function animate(time) {
    game.playStep(time);
    requestAnimationFrame(animate);
}