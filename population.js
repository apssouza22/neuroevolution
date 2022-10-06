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
            this.population[i] = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
        }
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
            let momDna = mom.dna;
            let dadDna = dad.dna;
            let childDna = momDna.crossover(dadDna);
            childDna.mutate(this.mutationRate);
            car.dna = childDna
        }
    }

    /**
     * Check if the population is dead
     * @return {boolean}
     */
    hasAlive() {
        return this.population.filter(car => !car.damaged).length == 0;
    }
}