class NeuroEvolution{

    constructor(layer_nodes_counts) {
        this.nn = new NeuralNetwork(layer_nodes_counts);
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
     * @param {NeuroEvolution} neuralNetwork - crossover partner
     */
    crossover(neuralNetwork) {
        this.#crossoverValidator(neuralNetwork);
        const offspring = new NeuroEvolution(neuralNetwork.nn.layerNodesCounts);
        for (let i = 0; i < neuralNetwork.nn.layers.length; i++) {
            if (Math.random() < 0.5) {
                offspring.nn.layers[i].weights = neuralNetwork.nn.layers[i].weights.copy();
            } else {
                offspring.nn.layers[i].weights = this.nn.layers[i].weights.copy();
            }

            if (Math.random() < 0.5) {
                offspring.nn.layers[i].biases = neuralNetwork.nn.layers[i].biases.copy();
            } else {
                offspring.nn.layers[i].biases = this.nn.layers[i].biases.copy();
            }
        }
        return offspring;
    }


    #crossoverValidator(network) {
        if (this instanceof NeuroEvolution) {
            if (network.nn.layerNodesCounts.length == this.nn.layerNodesCounts.length) {
                for (let i = 0; i < network.nn.layerNodesCounts.length; i++) {
                    if (network.nn.layerNodesCounts[i] != this.nn.layerNodesCounts[i]) {
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
