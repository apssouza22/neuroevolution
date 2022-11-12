// Class responsible for handle the genetic evolution of the population
class GeneticEvolution {
    /**
     * @param {PopulationHandler} populationHandler
     * @param {number}m
     */
    constructor(populationHandler, m) {
        this.populationHandler = populationHandler;
        this.mutationRate = m; // Mutation rate 0-1
    }

    /**
     * Select the best item from the population (elitism)
     */
    select() {
        const bests = this.populationHandler.sortByFitness();
        return [bests[0], bests[1]];
    }

    /**
     * Create a new generation of items
     * @param {PopulationItem} mom
     * @param {PopulationItem} dad
     */
    reproduce(mom, dad) {
        for (const p of this.populationHandler.getPopulation()) {
            if (p === mom || p === dad) {
                continue;
            }
            let momDna = mom.dna;
            let dadDna = dad.dna;
            let childDna = momDna.crossover(dadDna);
            childDna.mutate(this.mutationRate);
            p.dna = childDna
        }
    }

    loadDna() {
        if (localStorage.getItem("momBrain") && localStorage.getItem("dadBrain")) {
            console.log("Loading DNA from local storage");

            const [mom, dad] = this.select();
            mom.dna.loadDna(JSON.parse(localStorage.getItem("momBrain")));
            dad.dna.loadDna(JSON.parse(localStorage.getItem("dadBrain")));
            this.reproduce(mom, dad);
        }
    }
}


class PopulationHandler {
    /**
     * @param {PopulationItem[]}
     */
    constructor(population) {
        this.population = population;
    }

    /**
     * @returns {PopulationItem[]}
     */
    getPopulation() {
        return this.population;
    }

    /**
     * @returns {PopulationItem[]}
     */
    sortByFitness() {
        return this.population.sort((a, b) => a.calcFitness() > b.calcFitness() ? -1 : 1)
    }
}

/**
 * Item in the population
 */
class PopulationItem {
    /**
     * @type {DNA}
     */
    dna;
    /**
     * @type {number}
     */
    fitness;

    /**
     * Calculates the fitness of the item
     * @returns {number}
     */
    calcFitness() {
        return this.fitness
    }
}


// Class responsible for performing the genetic operations
class DNA {

    constructor(layer_nodes_counts) {
        this.nn = new NeuralNetwork(layer_nodes_counts);
    }

    /**
     * Load the pre-trained weights(DNA) from a JSON object
     * @param {NeuralNetwork} dict
     * @returns {NeuralNetwork}
     */
    loadDna(dict) {
        this.nn.loadWeights(dict);
    }

    /**
     * Save DNA to local storage
     * @param {String} key - the local storage key to save the model weights to
     */
    saveDNA(key = "brain") {
        this.nn.save(key);
    }

    /**
     * Mutates weights and biases of ANN based on rate given
     * @param {number} rate - rate from 0-1. Porcentage of mutation
     */
    mutate(rate) {
        const mutator = (val) => {
            if (Math.random() < rate) {
                // generate random number between -1 and 1
                return val + Math.random() * 2 - 1;
            } else {
                return val;
            }
        }

        for (let i = 0; i < this.nn.layers.length; i++) {
            if (this.nn.layers[i].layerType == Layer.INPUT) {
                continue;
            }
            this.nn.layers[i].weights.map(mutator);
            this.nn.layers[i].biases.map(mutator);
        }
    }

    /**
     * Mutate by crossing two neural networks
     * @param {DNA} neuralNetwork - crossover partner
     */
    crossover(neuralNetwork) {
        this.#crossoverValidator(neuralNetwork);
        const offspring = new DNA(neuralNetwork.nn.layerNodesCounts);
        for (let i = 0; i < neuralNetwork.nn.layers.length; i++) {
            if (Math.random() < 0.5) {
                offspring.nn.layers[i].weights = Matrix.copy(neuralNetwork.nn.layers[i].weights);
            } else {
                offspring.nn.layers[i].weights = Matrix.copy(this.nn.layers[i].weights);
            }

            if (Math.random() < 0.5) {
                offspring.nn.layers[i].biases = Matrix.copy(neuralNetwork.nn.layers[i].biases);
            } else {
                offspring.nn.layers[i].biases = Matrix.copy(this.nn.layers[i].biases);
            }
        }
        return offspring;
    }


    #crossoverValidator(network) {
        if (this instanceof DNA) {
            if (network.nn.layers.length == this.nn.layers.length) {
                for (let i = 0; i < network.nn.layers.length; i++) {
                    if (network.nn.layers[i].outputs.rows != this.nn.layers[i].outputs.rows) {
                        throw new Error("Crossover networks must have the same layer nodes counts");
                    }
                }
                return true;
            }
            throw new Error("Crossover networks must have the same layer counts");
        }
        throw new Error("Crossover networks must be of type NeuralNetworkMutable");
    }
}

// class responsible for handle the car population
class CarPopulation extends PopulationHandler {
    constructor(count = 100) {
        let population = []
        super(population);
        this.count = count;
        this.population = population;
    }

    generateCars(x) {
        for (let i = 0; i < this.count; i++) {
            this.population[i] = new Car(x, 100, 30, 50, "AI");
        }
    }

    sortByFitness() {
        return this.population.sort((a, b) => a.calcFitness() > b.calcFitness() ? -1 : 1)
    }

    /**
     * Get the population
     * @returns {Car[]}
     */
    get() {
        return this.population;
    }

    /**
     * Check if anyone in population is alive
     * @return {boolean}
     */
    hasAlive() {
        return this.population.filter(car => !car.damaged).length == 0;
    }
}
