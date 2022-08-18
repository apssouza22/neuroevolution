class NeuralNetwork {

    constructor(neuronCounts) {
        this.model = new NeuralNet(neuronCounts);
        this.layers = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.layers.push(new Layer(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    static feedForward(givenInputs, network) {
        network.layers = network.model.layers

        let outputs = network.model.feedforward(givenInputs, false);
        outputs = outputs.map(i=> i > 0.5 ? 1:0)
        return outputs;

    }

    static mutate(network, amount = 1) {
        network.layers.forEach(layer => {
            for (let i = 0; i < layer.biases.length; i++) {
                layer.biases[i] = lerp(
                        layer.biases[i],
                        Math.random() * 2 - 1,
                        amount
                )
            }
            for (let i = 0; i < layer.weights.length; i++) {
                for (let j = 0; j < layer.weights[i].length; j++) {
                    layer.weights[i][j] = lerp(
                            layer.weights[i][j],
                            Math.random() * 2 - 1,
                            amount
                    )
                }
            }
        });
    }
}

class Layer {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Layer.#randomize(this);
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs, layer) {
        // each neurons
        // for (let i = 0; i < layer.inputs.length; i++) {
        // }
            layer.inputs = givenInputs;


        for (let i = 0; i < layer.outputs.length; i++) {
            let sum = 0
            for (let j = 0; j < layer.inputs.length; j++) {
                // dot product calculation
                sum += layer.inputs[j] * layer.weights[j][i];
            }
            // activation function
            if (sum > layer.biases[i]) {
                layer.outputs[i] = 1;
            } else {
                layer.outputs[i] = 0;
            }
        }

        return layer.outputs;
    }
}