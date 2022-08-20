const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const N = 500;

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const cars = generateCars(N);
let bestCar = cars[0];
let bestCars = cars
let passFirstTrafficCar = false
if (localStorage.getItem("bestBrain")) {
    console.log("Loading brain from local storage");
    const mom = cars[0]
    const dad = cars[1]
    mom.brain.loadWeights(JSON.parse(localStorage.getItem("bestBrain")));
    dad.brain.loadWeights(JSON.parse(localStorage.getItem("bestBrain2")));
    for (let i = 0; i < cars.length; i++) {
        if (i > 1) {
            cars[i].brain = mom.brain.crossover(dad.brain);
            cars[i].brain.mutate(0.1);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -800, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -800, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -1000, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -1100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -1200, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -1400, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -1400, 30, 50, "DUMMY", 2, getRandomColor()),
];

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCars[0].brain.getWeights()));
    localStorage.setItem("bestBrain2", JSON.stringify(bestCars[1].brain.getWeights()));
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestBrain2");
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

setTimeout(() => {
    console.log("Restarting simulation");
    if (passFirstTrafficCar) {
        save()
    }
    location.reload();
}, 60000);

function playStep(time = 21792.403) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    bestCars = cars.sort((a, b) => a.calcFitness() > b.calcFitness() ? -1 : 1);
    bestCar = bestCars[0];
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha = 1;
    bestCars[0].draw(carCtx, true);

    if (traffic[0].y > bestCar.y) {
        passFirstTrafficCar = true
    }
    if (passFirstTrafficCar && traffic[0].y < bestCar.y) {
        save()
        location.reload();
    }
    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
}

function animate(time) {
    playStep(time);
    requestAnimationFrame(animate);
}