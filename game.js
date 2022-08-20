class Game {
    constructor() {
        this.carCanvas = document.getElementById("carCanvas");
        this.carCanvas.width = 200;
        this.carCtx = this.carCanvas.getContext("2d");
        this.road = new Road(this.carCanvas.width / 2, this.carCanvas.width * 0.9);
        this.init();
    }

    init() {
        this.cars = this.generateCars(N);
        this.traffic = this.getTraffic();
        this.bestCar = this.cars[0];
        this.bestCars = this.cars
        this.passFirstTrafficCar = false
        this.loadCarWeights();
    }

    getTraffic() {
        return [
            new Car(this.road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(1), -800, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(2), -800, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(0), -1000, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(0), -1100, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(1), -1200, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(1), -1400, 30, 50, "DUMMY", 2, getRandomColor()),
            new Car(this.road.getLaneCenter(2), -1400, 30, 50, "DUMMY", 2, getRandomColor()),
        ];
    }

    loadCarWeights() {
        if (localStorage.getItem("bestBrain")) {
            console.log("Loading brain from local storage");
            const mom = this.cars[0]
            const dad = this.cars[1]
            mom.brain.loadWeights(JSON.parse(localStorage.getItem("bestBrain")));
            dad.brain.loadWeights(JSON.parse(localStorage.getItem("bestBrain2")));
            for (let i = 0; i < this.cars.length; i++) {
                if (i > 1) {
                    this.cars[i].brain = mom.brain.crossover(dad.brain);
                    this.cars[i].brain.mutate(0.1);
                }
            }
        }
    }

    generateCars(n) {
        const cars = [];
        for (let i = 1; i <= n; i++) {
            cars.push(new Car(this.road.getLaneCenter(1), 100, 30, 50, "AI"));
        }
        return cars;
    }

    playStep(time = 21792.403) {
        for (let i = 0; i < this.traffic.length; i++) {
            this.traffic[i].update(this.road.borders, []);
        }
        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].update(this.road.borders, this.traffic);
        }
        this.bestCars = this.cars.sort((a, b) => a.calcFitness() > b.calcFitness() ? -1 : 1);
        this.bestCar = this.bestCars[0];
        this.carCanvas.height = window.innerHeight;
        networkCanvas.height = window.innerHeight;

        this.carCtx.save();
        this.carCtx.translate(0, -this.bestCar.y + this.carCanvas.height * 0.7);

        this.road.draw(this.carCtx);
        for (let i = 0; i < this.traffic.length; i++) {
            this.traffic[i].draw(this.carCtx);
        }
        this.carCtx.globalAlpha = 0.2;
        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].draw(this.carCtx);
        }
        this.carCtx.globalAlpha = 1;
        this.bestCars[0].draw(this.carCtx, true);

        if (this.traffic[0].y > this.bestCar.y) {
            this.passFirstTrafficCar = true
        }
        if (this.passFirstTrafficCar && this.traffic[0].y < this.bestCar.y) {
            save()
            location.reload();
        }
        this.carCtx.restore();

        networkCtx.lineDashOffset = -time / 50;
        Visualizer.drawNetwork(networkCtx, this.bestCar.brain);
    }
}
