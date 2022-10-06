class Game {
    constructor(canvas, onGenerationEnd) {
        this.carCanvas = canvas
        this.onGenerationEnd = onGenerationEnd;
        this.carCanvas.width = 200;
        this.carCtx = this.carCanvas.getContext("2d");
        this.road = new Road(this.carCanvas.width / 2, this.carCanvas.width * 0.9);
        this.generationCounts = 0;
        this.gaPopulation = new CarPopulation(populationCount, 0.1);
        this.init();
    }

    init() {
        this.generationCounts++;
        this.gaPopulation.generateCars(this.road)
        this.traffic = this.getTraffic();
        this.totalCarsOvertaken = 0
        this.loadCarWeights();
        this.totalFramesWithoutOvertaking = 0;
        [this.bestCar,] = this.gaPopulation.selection();
        console.log("Initializing game generation " + this.generationCounts);
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
        if (localStorage.getItem("momBrain") && localStorage.getItem("dadBrain")) {
            console.log("Loading brain from local storage");

            const [mom, dad] = this.gaPopulation.selection();
            mom.dna.loadDna(JSON.parse(localStorage.getItem("momBrain")));
            dad.dna.loadDna(JSON.parse(localStorage.getItem("dadBrain")));
            this.gaPopulation.reproduction(mom, dad);
        }
    }

    playStep(time = 21792.403, drawGame = true) {
        this.updateAllRoadCars();
        let gameOver = false

        let [mom, ] = this.gaPopulation.selection();
        this.bestCar = mom;
        if (this.restartVerify(this.bestCar.totalCarsOverTaken)){
            return {gameOver: true,score: this.bestCar.calcFitness(),}
        }
        this.totalCarsOvertaken = this.bestCar.totalCarsOverTaken > this.totalCarsOvertaken ? this.bestCar.totalCarsOverTaken : this.totalCarsOvertaken
        if (drawGame) {
            game.drawGame();
        }
        return {
            gameOver: gameOver,
            score: this.bestCar.calcFitness(),
        }
    }

    restartVerify(totalCarsOverTaken) {
        const gameOver = this.gaPopulation.hasAlive()
        if (gameOver) {
            save()
            this.onGenerationEnd(this);
            this.init()
            return true
        }

        if (this.totalCarsOvertaken - 2 > totalCarsOverTaken) {
            save()
            this.onGenerationEnd(this);
            this.init()
            return true;
        }

        if (this.totalCarsOvertaken >= totalCarsOverTaken) {
            this.totalFramesWithoutOvertaking++
        } else {
            this.totalFramesWithoutOvertaking = 0
        }
        if (this.totalFramesWithoutOvertaking > 500) {
            save()
            this.onGenerationEnd(this);
            this.init()
            return true;
        }
        return false;
    }

    drawGame() {
        this.carCanvas.height = window.innerHeight;
        this.carCtx.save();
        this.carCtx.translate(0, -this.bestCar.y + this.carCanvas.height * 0.7);

        this.road.draw(this.carCtx);
        for (const traffic of this.traffic) {
            traffic.draw(this.carCtx);
        }
        this.drawCars();
        this.carCtx.restore();
    }

    updateAllRoadCars() {
        for (const car of this.traffic) {
            car.update(this.road.borders, []);
        }
        this.gaPopulation.population.forEach(car => {
            car.update(this.road.borders, this.traffic)
        })
    }

    drawCars() {
        this.carCtx.globalAlpha = 0.2;
        for (const car of this.gaPopulation.population) {
            car.draw(this.carCtx);
        }
        this.carCtx.globalAlpha = 1;
        let [mom, ] = this.gaPopulation.selection()
        mom.draw(this.carCtx, true);
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