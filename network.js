/**
 * Artificial Neural Network
 */
class NeuralNetwork {

    /**
     * @param  {Array} layerNodesCounts - array of counts of neurons in each layer
     * Eg : new NeuralNet([3,4,2]); will instantiate NN with 3 neurons as input layer, 4 as hidden and 2 as output layer
     */
    constructor(layerNodesCounts,activation = Activation.SIGMOID) {
        this.layerNodesCounts = layerNodesCounts; // no of neurons per layer
        this.#setActivation(activation);
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
     * Perform the feed foward operation
     * @param {Array} input_array - Array of input values
     * @param {Boolean} GET_ALL_LAYERS - if we need all layers after feed forward instead of just output layer
     * @returns {Array} - the Neural net output for each layer
     */
    feedForward(input_array, GET_ALL_LAYERS) {
        if (!this.#feedforwardArgsValidator(input_array)) {
            throw new Error("Invalid arguments");
        }
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
                this.activation,
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
                    this.activation,
                    layerType
            ))
        }
    }

    // Argument validator functions
    #feedforwardArgsValidator(input_array) {
        let invalid = false;
        if (input_array.length != this.layerNodesCounts[0]) {
            invalid = true;
            console.error("Feedforward failed : Input array and input layer size doesn't match.");
        }
        return invalid ? false : true;
    }


    #setActivation(TYPE) {
        switch (TYPE) {
            case Activation.SIGMOID:
                this.activation = Activation.sigmoid;
                this.activation_derivative = Activation.sigmoid_derivative;
                break;
            case Activation.ReLU:
                this.activation = Activation.relu;
                this.activation_derivative = Activation.relu_derivative;
                break;
            default:
                console.error('Activation type invalid, setting sigmoid by default');
                this.activation = Activation.sigmoid;
                this.activation_derivative = Activation.sigmoid_derivative;
        }
    }
}

/**
 * Neural Network that implements backpropagation algorithm
 */
class TrainableNeuralNetwork extends NeuralNetwork {
    learningRate;

    constructor(layerNodesCounts, activation = Activation.SIGMOID, learningRate = 0.1) {
        super(layerNodesCounts, activation);
        this.learningRate = learningRate;
    }
    /**
     * Trains with back propogation
     * @param {Array} input - Array of input values
     * @param {Array} target - Array of labels
     */
    train(input, target) {
        if (!this.#trainArgsValidator(input, target)) {
            throw new Error("Invalid arguments");
        }

        this.feedForward(input, true); //layer matrices
        this.calculateLoss(target);
        this.updateWeights()
    }

    /**
     * Trains with back propogation
     * @param {Array} input - Array of input values
     **/
    predict(input) {
        return this.feedForward(input, false);
    }

    save(key = "brain") {
        localStorage.setItem(key, JSON.stringify(this.getWeights()));
    }

    calculateLoss(target) {
        const targetMatrix = Matrix.fromArray(target)
        this.#loopLayersInReverse(this.layerNodesCounts, (layerIndex) => {
            let prevLayer
            if(this.layers[layerIndex].layerType != Layer.OUTPUT){
                prevLayer = this.layers[layerIndex + 1]
            }
            this.layers[layerIndex].calculateErrorLoss(targetMatrix, prevLayer);
        })
        return this.layers[this.layers.length - 1].layerError;
    }


    updateWeights() {
        this.#loopLayersInReverse(this.layerNodesCounts, (layerIndex) => {
            const currentLayer = this.layers[layerIndex]
            const nextLayer = this.layers[layerIndex - 1]
            currentLayer.calculateGradient(this.activation_derivative, this.learningRate);
            currentLayer.updateWeights(nextLayer.outputs);
        })
    }

    #loopLayersInReverse(layerOutputs, callback) {
        for (let layer_index = layerOutputs.length - 1; layer_index >= 1; layer_index--) {
            callback(layer_index)
        }
    }


    #trainArgsValidator(input_array, target_array) {
        let invalid = false;
        if (input_array.length != this.layerNodesCounts[0]) {
            console.error("Training failed : Input array and input layer size doesn't match.");
            invalid = true;
        }
        if (target_array.length != this.layerNodesCounts[this.layerNodesCounts.length - 1]) {
            invalid = true;
            console.error("Training failed : Target array and output layer size doesn't match.");
        }
        return invalid ? false : true;
    }

}

/**
 * Available activation functions
 */
class Activation{
    static SIGMOID = 1;
    static ReLU = 2;

    // Activation functions
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-1 * x));
    }

    static sigmoid_derivative(y) {
        return y * (1 - y);
    }

    static relu(x) {
        if (x >= 0) {
            return x;
        } else {
            return 0;
        }
    }

    static relu_derivative(y) {
        if (y > 0) {
            return 1;
        } else {
            return 0;
        }
    }
}

/**
 * Neural network layer
 */
class Layer {
    static INPUT = 1
    static HIDDEN = 2
    static OUTPUT = 3
    layerError

    constructor(inputSize, outputSize, activation, layerType) {
        this.layerType = layerType;
        let weights = new Matrix(outputSize, inputSize);
        weights.randomize()

        let bias = new Matrix(outputSize, 1);
        bias.randomize()

        this.activation = activation;
        this.weights = weights;
        this.biases = bias;
        this.inputs = new Array(inputSize);
        this.outputs = new Array(outputSize);

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
     * @param {Array} input_array - Array of input values
     * @param {Boolean} GET_ALL_LAYERS - if we need all layers after feed forward instead of just output layer
     */
    feedForward(input) {
        if (this.layerType == Layer.INPUT) {
            this.inputs = input.data;
            this.outputs = input;
            return input;
        }
        this.inputs = input.data
        input = Matrix.multiply(this.weights, input);
        input.add(this.biases);
        input.map(this.activation);
        this.outputs = input
        return input
    }

    calculateErrorLoss(target_matrix, prevLayer) {
        if (this.layerType == Layer.OUTPUT) {
            this.layerError = Matrix.add(target_matrix, Matrix.multiply(this.outputs, -1));
            return this.layerError;
        }
        const weightTranspose = Matrix.transpose(prevLayer.weights);
        this.layerError = Matrix.multiply(weightTranspose, prevLayer.layerError);
        return this.layerError;
    }

    updateWeights(nextLayerOutput) {
        //Calculating delta weights
        const nextLayerOutputTransposed = Matrix.transpose(nextLayerOutput);
        const nextWeightsDelta = Matrix.multiply(this.gradient, nextLayerOutputTransposed);

        //Updating weights and biases
        this.weights.add(nextWeightsDelta);
        this.biases.add(this.gradient);
    }


    calculateGradient(activation_derivative, learningRate) {
        this.gradient = Matrix.map(this.outputs, activation_derivative);
        this.gradient.multiply(this.layerError);
        this.gradient.multiply(learningRate);
    }

}