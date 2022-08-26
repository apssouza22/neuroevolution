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
        this.totalCarsOvertaken = 0
        this.loadCarWeights();
        this.timeout = setTimeout(this.restart(), 100000)
    }

    restart() {
        return () => {
            console.log("Restarting game")
            save()
            this.init()
        };
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
        if(GAME_INFO.brainMode != "GA") {
            return
        }
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
        this.updateAllRoadCars();
        let reward = 0
        let gameOver = false

        this.cars = this.cars.map(car => {
            car.totalCarsOverTaken = this.traffic.filter(traffic => traffic.y > car.y).length
            return car
        })
        this.bestCars = this.cars.sort((a, b) => a.y * -1 > b.y * -1 ? -1 : 1);
        this.bestCar = this.bestCars[0];
        if (this.bestCar.damaged && GAME_INFO.brainMode != "GA") {
            gameOver = true
            reward = -10
            return {
                reward: reward,
                gameOver: gameOver,
                score: this.bestCar.calcFitness() + this.bestCar.y * -1,
            }
        }
        this.drawGame();
        reward = this.getRewards(reward, this.bestCar.totalCarsOverTaken);

        this.restartVerify(this.bestCar.totalCarsOverTaken);
        this.totalCarsOvertaken = this.bestCar.totalCarsOverTaken >  this.totalCarsOvertaken ? this.bestCar.totalCarsOverTaken : this.totalCarsOvertaken

        this.carCtx.restore();
        this.updateNetworkVisualizer(time);
        return {
            reward: reward,
            gameOver: gameOver,
            score: this.bestCar.calcFitness(),
        }
    }

    restartVerify(totalCarsOverTaken) {
        const gameOver = this.cars.filter(car => !car.damaged).length == 0;
        if (this.totalCarsOvertaken - 2 > totalCarsOverTaken || gameOver) {
            clearTimeout(this.timeout)
            save()
            this.init()
        }
    }

    drawGame() {
        this.carCanvas.height = window.innerHeight;
        this.carCtx.save();
        this.carCtx.translate(0, -this.bestCar.y + this.carCanvas.height * 0.7);

        this.road.draw(this.carCtx);
        for (const traffic of this.traffic) {
            traffic.draw(this.carCtx);
        }
        this.carCtx.globalAlpha = 0.2;
        for (const car of this.cars) {
            car.draw(this.carCtx);
        }

        this.carCtx.globalAlpha = 1;
        this.bestCars[0].draw(this.carCtx, true);
    }

    updateNetworkVisualizer(time) {
        networkCanvas.height = window.innerHeight;
        networkCtx.lineDashOffset = -time / 50;
        if (GAME_INFO.brainMode == "GA") {
            Visualizer.drawNetwork(networkCtx, this.bestCar.brain);
        }
    }

    getRewards(reward, totalCarsOverTaken) {
        this.bestCar.getSensorData().forEach((sensor, index) => {
                    if (sensor > 0.5) {
                        reward -= sensor
                    } else {
                        reward += 0.1
                    }
                }
        )
        // console.log(reward)

        if (this.totalCarsOvertaken < totalCarsOverTaken) {
            reward = 10
        }

        return reward;
    }

    updateAllRoadCars() {
        for (const car of this.traffic) {
            car.update(this.road.borders, []);
        }
        for (const car of this.cars) {
            car.update(this.road.borders, this.traffic);
        }
    }
}

function isCollision(carBorders, roadBorders, traffic) {
    for (let value of roadBorders) {
        if (polysIntersect(carBorders, value)) {
            return true;
        }
    }
    for (let value of traffic) {
        if (polysIntersect(carBorders, value.polygon)) {
            return true;
        }
    }
    return false;
}

/**
 * Creates a polygon around the car to be used for collision detection
 * @returns {Object[]}
 */
function createPolygon(coordinates, width, height) {
    const points = [];
    const rad = Math.hypot(width, height) / 2;
    const alpha = Math.atan2(width, height);
    points.push({
        x: coordinates.x - Math.sin(coordinates.angle - alpha) * rad,
        y: coordinates.y - Math.cos(coordinates.angle - alpha) * rad
    });
    points.push({
        x: coordinates.x - Math.sin(coordinates.angle + alpha) * rad,
        y: coordinates.y - Math.cos(coordinates.angle + alpha) * rad
    });
    points.push({
        x: coordinates.x - Math.sin(Math.PI + coordinates.angle - alpha) * rad,
        y: coordinates.y - Math.cos(Math.PI + coordinates.angle - alpha) * rad
    });
    points.push({
        x: coordinates.x - Math.sin(Math.PI + coordinates.angle + alpha) * rad,
        y: coordinates.y - Math.cos(Math.PI + coordinates.angle + alpha) * rad
    });
    return points;
}