/**
 * Artificial Neural Network
 */
class NeuralNetwork {

    /**
     * @param  {Array} layerNodesCounts - array of counts of neurons in each layer
     * Eg : new NeuralNet([3,4,2]); will instantiate NN with 3 neurons as input layer, 4 as hidden and 2 as output layer
     */
    constructor(layerNodesCounts) {
        this.layerNodesCounts = layerNodesCounts; // no of neurons per layer
        this.#createLayers(layerNodesCounts);
    }

    /**
     * Load the pre trained weights from a JSON object
     * @param {NeuralNetwork} dict
     * @returns {NeuralNetwork}
     */
    loadWeights(dict) {
        for (const i in this.layers) {
            this.layers[i].loadWeights(dict.layers[i])
        }
    }
    /**
     * Return the trained weights in a JSON object
     * @returns {Object}
     */
    getWeights() {
        const layers = []
        for (const layersKey in this.layers) {
            layers.push(this.layers[layersKey].getWeights())
        }
        return {
            layerNodesCounts: this.layerNodesCounts,
            layers: layers,
        }
    }

    /**
     * Save the model weights to local storage
     * @param {String} key - the local storage key to save the model weights to
     */
    save(key = "brain") {
        console.log("Saving brain to local storage");
        localStorage.setItem(key, JSON.stringify(this.getWeights()));
    }

    /**
     * Perform the feed foward operation
     * @param {Array} input_array - Array of input values
     * @param {Boolean} GET_ALL_LAYERS - if we need all layers after feed forward instead of just output layer
     * @returns {Array} - the Neural net output for each layer
     */
    feedForward(input_array, GET_ALL_LAYERS=false) {
        this.#feedforwardArgsValidator(input_array)
        let inputMat = Matrix.fromArray(input_array)
        let outputs = [];
        for (let i = 0; i < this.layerNodesCounts.length; i++) {
            outputs[i] = this.layers[i].feedForward(inputMat);
            inputMat = outputs[i];
        }

        if (GET_ALL_LAYERS == true) {
            return outputs;
        }
        return outputs[outputs.length - 1].toArray();
    }


    #createLayers(layerNodesCounts) {
        /**
         * @type Array.<Layer>
         */
        this.layers = []
        this.layers.push(new Layer(
                layerNodesCounts[0],
                layerNodesCounts[0],
                Activation.SIGMOID,
                Layer.INPUT
        ))

        for (let i = 0; i < layerNodesCounts.length - 1; i++) {
            let layerType = Layer.HIDDEN;
            if (i == layerNodesCounts.length - 2) {
                layerType = Layer.OUTPUT;
            }
            this.layers.push(new Layer(
                    layerNodesCounts[i],
                    layerNodesCounts[i + 1],
                    Activation.SIGMOID,
                    layerType
            ))
        }
    }

    // Argument validator functions
    #feedforwardArgsValidator(input_array) {
        if (input_array.length != this.layerNodesCounts[0]) {
            throw new Error("Feedforward failed : Input array and input layer size doesn't match.");
        }
    }

}

/**
 * Available activation functions
 */
class Activation {
    static SIGMOID = 1;
    static ReLU = 2;

    /**
     * Create a new activation function pair (activation and derivative)
     * @param {int} activationType
     * @returns {{
     *   derivative: ((function(number): (number))),
     *   activation: ((function(number): (number)))
     * }}
     */
    static create(activationType) {
        switch (activationType) {
            case Activation.ReLU:
                return {
                    activation: Activation.#relu,
                    derivative: Activation.#relu_derivative
                }
            case Activation.SIGMOID:
                return {
                    activation: Activation.sigmoid,
                    derivative: Activation.sigmoid_derivative
                }
            default:
                console.error('Activation type invalid, setting relu by default');
                return {
                    activation: Activation.sigmoid,
                    derivative: Activation.sigmoid_derivative
                }
        }
    }


    static sigmoid(x) {
        return 1 / (1 + Math.exp(-1 * x));
    }

    static sigmoid_derivative(y) {
        return y * (1 - y);
    }
    /**
     * Rectified Linear Unit (ReLU) activation function
     * This function outputs 1 (one) if its weighted input plus bias is positive or zero,
     * and it outputs 0 (zero) if its weighted input plus bias is negative.
     * In other words, the neuron either fires or doesn't
     * @param {number} x
     * @return {number|*}
     */
    static #relu(x) {
        if (x >= 0) {
            return x;
        }
        return 0;

    }

    /**
     * Derivative of ReLU function
     *
     * @param {number} x
     * @return {number}
     */
    static #relu_derivative(x) {
        if (x > 0) {
            return 1;
        }
        return 0;
    }
}



/**
 * Neural network layer
 */
class Layer {
    static INPUT = 1
    static HIDDEN = 2
    static OUTPUT = 3
    /**
     * Learning occurs, in part, by the strengthening of connections between neurons
     * With weighted inputs, the network can increase or decrease the strength of the connection between each neuron in this layer and the neurons in the next layer
     * Weights are the co-efficients of the equation which you are trying to resolve during the training phase
     * @type {Matrix}
     */
    weights
    /**
     * While weights enable an artificial neural network to adjust the strength of connections between neurons,
     * bias can be used to make adjustments within neurons
     * Basically the addition of bias reduces the variance and hence introduces flexibility and better generalisation to the neural network(non-linearity).
     * @type {Matrix}
     */
    biases

    /**
     * @type {Matrix}
     */
    outputs

    /**
     * Constructor
     * @param {int} inputSize
     * @param {int}outputSize
     * @param {number} activation
     * @param {number} layerType
     */
    constructor(inputSize, outputSize, activation, layerType) {
        this.layerType = layerType;
        this.activationFun = Activation.create(activation);
        this.weights = Matrix.randomize(outputSize, inputSize);
        this.biases = Matrix.randomize(outputSize, 1);
        this.inputs = new Array(inputSize);
        this.outputs = Matrix.randomize(outputSize, 1);
    }

    loadWeights(trainedLayer) {
        this.weights.data = trainedLayer.weights
        this.biases.data = trainedLayer.biases;
        this.outputs.data = trainedLayer.outputs;
        this.inputs = trainedLayer.inputs;
    }

    getWeights() {
        return {
            weights: this.weights.data,
            biases: this.biases.data,
            outputs: this.outputs.data,
            inputs: this.inputs,
            layerType: this.layerType,
        }
    }

    /**
     * Feed forward the input matrix to the layer
     * In an artificial neural network, learning occurs in the following fashion:
     *   - Each neuron (also referred to as a "node") receives one or more inputs from an external source or from other neurons.
     *   - Each input is multiplied by a weight to indicate the input's relative importance.
     *   - Bias is added to the sum of the weighted inputs.
     *   - An activation function within the neuron performs a calculation on the total.
     *   - The result is the neuron's output, which is passed to other neurons or delivered to the external world as the machine's output.
     *
     * @param {Matrix} input_array - Array of input values
     * @returns {Matrix} - Array of output values
     */
    feedForward(input) {
        this.inputs = input.data
        if (this.layerType == Layer.INPUT) {
            this.outputs = input;
            return input;
        }
        let output = Matrix.multiply(this.weights, input);
        output.add(this.biases);
        output.map(this.activationFun.activation);
        this.outputs = output
        return output
    }

}
