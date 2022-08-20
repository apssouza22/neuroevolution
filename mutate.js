class NeuralNetworkMutable extends NeuralNetwork {

    constructor(layer_nodes_counts) {
        super(layer_nodes_counts);
    }

    static fromWeights(model) {
        let network = NeuralNetwork.fromWeights(model);
        let cast = new NeuralNetworkMutable(network.layerNodesCounts);
        return Object.assign(cast, network);
    }

    /**
     * Mutates weights and biases of ANN based on rate given
     * @param {number} rate - rate from 0-1
     */
    mutate(rate) { //rate 0 to 1
        const mutator = (val) => {
            if (Math.random() < rate) {
                // generate random number between -1 and 1
                return val + Math.random() * 2 - 1;
            } else {
                return val;
            }
        }

        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type == Layer.INPUT) {
                continue;
            }
            this.layers[i].weights.map(mutator);
            this.layers[i].biases.map(mutator);
        }
    }

    /**
     * Mutate by crossing two neural networks
     * @param {NeuralNetwork} neuralNetwork - crossover partner
     */
    crossover(neuralNetwork) {
        if (!this.#crossoverValidator(neuralNetwork)) {
            return -1;
        }
        const offspring = new NeuralNetwork(neuralNetwork.layerNodesCounts);
        for (let i = 0; i < neuralNetwork.layers[i].weights.length; i++) {
            if (Math.random() < 0.5) {
                offspring.layers[i].weights = neuralNetwork.layers[i].weights[i];
            } else {
                offspring.layers[i].weights[i] = this.layers[i].weights[i];
            }

            if (Math.random() < 0.5) {
                offspring.layers[i].biases[i] = neuralNetwork.layers[i].biases[i];
            } else {
                offspring.layers[i].biases[i] = this.layers[i].biases[i];
            }
        }
        return offspring;
    }


    #crossoverValidator(network) {
        let invalid = false;
        if (this instanceof NeuralNetworkMutable) {
            if (network.layerNodesCounts.length == this.layerNodesCounts.length) {
                for (let i = 0; i < network.layerNodesCounts.length; i++) {
                    if (network.layerNodesCounts[i] != this.layerNodesCounts[i]) {
                        console.error("Crossover failed : Architecture mismatch (Different number of neurons in one or more layers).");
                        invalid = true;
                        break;
                    }
                }
            } else {
                invalid = true;
                console.error("Crossover failed : Architecture mismatch (Different number of layers).");
            }
        } else {
            invalid = true;
            console.error("Crossover failed : NeuralNet object expected.");
        }
        return invalid ? false : true;
    }
}
