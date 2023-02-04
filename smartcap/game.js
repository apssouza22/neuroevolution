// Game engine for the car game
class Game {

    /**
     * Constructor
     * @param canvas
     * @param {GeneticEvolution} geneticEvolution
     * @param {(Game)=>{}}onGenerationEnd callback function for when a generation ends
     */
    constructor(canvas, geneticEvolution, onGenerationEnd) {
        this.carCanvas = canvas
        this.onGenerationEnd = onGenerationEnd;
        this.evolution = geneticEvolution;
        // this.carCanvas.width = 200;
        this.carCtx = this.carCanvas.getContext("2d");
        this.road = getRoad();
        /**
         * @type {CarPopulation}
         */
        this.carPopulation = this.evolution.getPopulationHandler();
        this.carPopulation.addRoad(this.road);
        this.init();
    }

    init() {
        this.evolution.evolve();
        this.traffic = this.getTraffic();
        this.totalCarsOvertaken = 0;
        this.totalFramesWithoutOvertaking = 0;
        this.bestCar = this.carPopulation.sortByFitness()[0];
    }


    getTraffic() {

    }


    playStep(time = 21792.403, drawGame = true) {
        this.updateAllRoadCars();
        let gameOver = false

        this.bestCar = this.carPopulation.population.sort((a, b) => a.y < b.y ? -1 : 1)[0];
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
        this.carPopulation.get().forEach(car => {
            car.update(this.road.borders, this.traffic)
        })
    }

    drawCars() {

    }


}

function isCollision(carBorders, roadBorders, traffic) {

}

/**
 * Creates a polygon around the car to be used for collision detection
 * @returns {Object[]}
 */
function createPolygon(coordinates, width, height) {

}