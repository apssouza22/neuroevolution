// Class responsible for the population of the simulation
class CarPopulation {
    constructor(num, m) {
        /**
         * population of cars
         * @type {Car[]}
         */
        this.population = new Array(num);
        this.mutationRate = m; // Mutation rate 0-1
    }

    generateCars(road) {
        for (let i = 0; i < this.population.length; i++) {
            this.population[i]=new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
        }
    }

    update(roadBorders, traffic) {
        this.population.forEach(car => {
            car.update(roadBorders, traffic)
        })
    }

    /**
     * Get the first car in the population
     * @returns {Car}
     */
    getFirstCar() {
        return this.population.sort((a, b) => a.y < b.y ? -1 : 1)[0];
    }

    /**
     * Select the best cars from the population (elitism)
     */
    selection() {
        const bestCars = this.population.sort((a, b) => a.calcFitness() > b.calcFitness() ? -1 : 1);
        return [bestCars[0], bestCars[1]];
    }

    /**
     * Create a new generation of cars
     * @param {Car} mom
     * @param {Car} dad
     */
    reproduction(mom, dad) {
        for (const car of this.population) {
            if (car === mom || car === dad) {
                continue;
            }
            let momgenes = mom.brain;
            let dadgenes = dad.brain;
            let child = momgenes.crossover(dadgenes);
            child.mutate(this.mutationRate);
            car.brain = child
        }
    }

    selectionFromStorage() {
        const [mom, dad] = this.selection();
        mom.brain.nn.loadWeights(JSON.parse(localStorage.getItem("momBrain")));
        dad.brain.nn.loadWeights(JSON.parse(localStorage.getItem("dadBrain")));
        return [mom, dad];
    }

    isAlive() {
        return this.population.filter(car => !car.damaged).length == 0;
    }

    draw(carCtx) {
        carCtx.globalAlpha = 0.2;
        for (const car of this.population) {
            car.draw(carCtx);
        }
        carCtx.globalAlpha = 1;
        this.getFirstCar().draw(carCtx, true);
    }
}