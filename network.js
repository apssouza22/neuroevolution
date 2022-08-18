class NeuralNetwork {

    constructor(neuronCounts) {
        this.model = new NeuralNet(neuronCounts);
        this.layers = [];
    }

    static feedForward(givenInputs, network) {
        network.layers = network.model.layers

        let outputs = network.model.feedForward(givenInputs, false);
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