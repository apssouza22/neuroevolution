// Class responsible for handle the genetic evolution of the population
class GeneticEvolution {
    /**
     * @type {number}
     */
    generation = 0;

    /**
     * @param {PopulationHandler} populationHandler
     * @param {number} m Mutation rate 0-1
     */
    constructor(populationHandler, m = 0.1) {
        this.populationHandler = populationHandler;
        this.mutationRate = m;
    }

    /**
     * Create a new generation of items with the bests from the previous generation
     */
    evolve() {
        const [mom, dad] = this.select();
        const children = this.reproduce(mom, dad);
        this.populationHandler.addPopulation([mom, dad, ...children]);
        this.populationHandler.reset();
        this.generation++;
        console.log("New generation " + this.generation);
    }

    /**
     * Get population handler
     * @returns {PopulationHandler}
     */
    getPopulationHandler() {
        return this.populationHandler;
    }

    /**
     * Select the best item from the population (elitism)
     */
    select() {
        this.populationHandler.calculateFitness()
        const bests = this.populationHandler.sortByFitness();
        if (bests.length < 1 || bests[0].calcFitness() < bests[0].calcFitness()){
            throw Error("calcFitness operation is not working properly or population is empty. Please review it")
        }
        return [bests[0], bests[1]];
    }

    /**
     * Create a new generation of items
     * @param {PopulationItem} mom
     * @param {PopulationItem} dad
     * @returns {PopulationItem[]} children
     */
    reproduce(mom, dad) {
        let children = [];
        for (const p of this.populationHandler.getPopulation()) {
            if (p === mom || p === dad) {
                continue;
            }
            let momDna = mom.genome;
            let dadDna = dad.genome;
            let childDna = momDna.crossover(dadDna);
            childDna.mutate(this.mutationRate);
            p.genome = childDna
            children.push(p);
        }
        return children;
    }

    /**
     * Load an existing DNA from the local storage
     */
    loadGenetics() {
        if (localStorage.getItem("momBrain") && localStorage.getItem("dadBrain")) {
            console.log("Loading Genetics from local storage");

            const [mom, dad] = this.select();
            mom.genome.loadGenetics(JSON.parse(localStorage.getItem("momBrain")));
            dad.genome.loadGenetics(JSON.parse(localStorage.getItem("dadBrain")));
        }
    }

    /**
     * Save the best Genetics to the local storage
     */
    saveGenetics() {
        const [mom, dad] = this.select();
        mom.genome.saveGenetics("momBrain");
        dad.genome.saveGenetics("dadBrain");
    }
}


class PopulationHandler {
    /**
     * @param PopulationItem[] population
     */
    constructor(population) {
        this.population = population;
    }

    /**
     * Reset the population state.
     */
    reset() {
        for (const p of this.population) {
            p.fitness = 0;
        }
    }

    /**
     * @returns {PopulationItem[]}
     */
    getPopulation() {
        return this.population;
    }

    /**
     * Add the new population to the handler
     * @param {PopulationItem[]}population
     */
    addPopulation(population) {
        this.population = population;
    }

    /**
     * Calculate the fitness of all items in the population
     */
    calculateFitness() {
        for (const p of this.population) {
            p.calcFitness();
        }
    }

    /**
     * Sort population by fitness
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
     * @type {Genome}
     */
    genome;
    /**
     * @type {number}
     */
    fitness;

    /**
     * @param [] layer_nodes_counts
     */
    constructor(layer_nodes_counts) {
        this.genome = new Genome(layer_nodes_counts)
    }

    /**
     * Abstract method. Requires implementation on the child class
     * Calculates the fitness of the item
     * @returns {number}
     */
    calcFitness() {
        return this.fitness
    }
}


/**
 * Class responsible for handle the Genetics of the population
 */
class Genome {

    /**
     * @param [] layer_nodes_counts
     */
    constructor(layer_nodes_counts) {
        this.nn = new NeuralNetwork(layer_nodes_counts);
    }

    /**
     * Use genes to predict the output for the given input
     * @param inputs
     * @returns {(number)[]}
     */
    useGenes(inputs) {
        let outputs = this.nn.feedForward(inputs, false);
        return outputs.map(i => i > 0.5 ? 1 : 0)
    }

    /**
     * Load the pre-trained weights(Genetics) from a JSON object
     * @param {NeuralNetwork} dict
     * @returns {NeuralNetwork}
     */
    loadGenetics(dict) {
        this.nn.loadWeights(dict);
    }

    /**
     * Save Genetics to local storage
     * @param {String} key - the local storage key to save the model weights to
     */
    saveGenetics(key = "brain") {
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
     * @param {Genome} dad - crossover partner
     */
    crossover(dad) {
        this.#crossoverValidator(dad);
        const offspring = new Genome(dad.nn.layerNodesCounts);
        for (let i = 0; i < dad.nn.layers.length; i++) {
            if (Math.random() < 0.5) {
                offspring.nn.layers[i].weights = Matrix.copy(dad.nn.layers[i].weights);
            } else {
                offspring.nn.layers[i].weights = Matrix.copy(this.nn.layers[i].weights);
            }

            if (Math.random() < 0.5) {
                offspring.nn.layers[i].biases = Matrix.copy(dad.nn.layers[i].biases);
            } else {
                offspring.nn.layers[i].biases = Matrix.copy(this.nn.layers[i].biases);
            }
        }
        return offspring;
    }


    /**
     * Validate the genetics to be used in crossover
     * @param {Genome} genetics
     * @returns {boolean}
     */
    #crossoverValidator(genetics) {
        if (this instanceof Genome) {
            if (genetics.nn.layers.length == this.nn.layers.length) {
                for (let i = 0; i < genetics.nn.layers.length; i++) {
                    if (genetics.nn.layers[i].outputs.rows != this.nn.layers[i].outputs.rows) {
                        throw new Error("Crossover networks must have the same layer nodes counts");
                    }
                }
                return true;
            }
            throw new Error("Crossover networks must have the same layer counts");
        }
        throw new Error("Crossover networks must be of type Genetics");
    }
}

