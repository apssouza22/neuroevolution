class NeuralNetMutator {

    /**
     * Mutates weights and biases of ANN based on rate given
     * @param {NeuralNetwork} model
     * @param {float} rate
     */
    static mutate(model, rate) { //rate 0 to 1
        const mutator = (val) => {
            if (Math.random() < rate) {
                // generate random number between -1 and 1
                return val + Math.random() * 2 - 1;
            } else {
                return val;
            }
        }

        for (let i = 0; i < model.layers.length; i++) {
            model.layers[i].weights.map(mutator);
            model.layers[i].biases.map(mutator);
        }
    }

    /**
     * Mutate by crossing two neural networks
     * @param {NeuralNetwork} nn1 - crossover partner
     * @param {NeuralNetwork} nn2 - crossover partner
     */
    static crossover(nn1, nn2) {
        if (!NeuralNetMutator._crossover_validator(nn1, nn2)) {
            return -1;
        }
        const offspring = new NeuralNetwork(nn2.layer_nodes_counts);
        for (let i = 0; i < nn2.layers[i].weights.length; i++) {
            if (Math.random() < 0.5) {
                offspring.layers[i].weights = nn2.layers[i].weights[i];
            } else {
                offspring.layers[i].weights[i] = nn1.layers[i].weights[i];
            }

            if (Math.random() < 0.5) {
                offspring.layers[i].biases[i] = nn2.layers[i].biases[i];
            } else {
                offspring.layers[i].biases[i] = nn1.layers[i].biases[i];
            }
        }
        return offspring;
    }


    static _crossover_validator(nn1, nn2) {
        let invalid = false;
        if (nn1 instanceof NeuralNetwork) {
            if (nn2.layers_count == nn1.layers_count) {
                for (let i = 0; i < nn2.layers_count; i++) {
                    if (nn2.layer_nodes_counts[i] != nn1.layer_nodes_counts[i]) {
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