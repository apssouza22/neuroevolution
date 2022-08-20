/**
 * A mini library for Artificial Neural Network inspired by ToyNeuralNetwork - https://github.com/CodingTrain/Toy-Neural-Network-JS
 */
class NeuralNetwork {
    /**
     * @param  {Array} layerNodesCounts - array of counts of neurons in each layer
     * Eg : new NeuralNet([3,4,2]); will instantiate ANN with 3 neurons as input layer, 4 as hidden and 2 as output layer
     */
    constructor(layerNodesCounts) {
        NeuralNetwork.SIGMOID = 1;
        NeuralNetwork.ReLU = 2;
        this.layerNodesCounts = layerNodesCounts; // no of neurons per layer
        this.learningRate = 0.2;
        this.setActivation(NeuralNetwork.SIGMOID);
        this.createLayers(layerNodesCounts);
    }


    createLayers(layerNodesCounts) {
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

    /**
     * Creates a new NeuralNetwork from a JSON object
     * @param {NeuralNetwork} model
     * @returns {NeuralNetwork}
     */
    static fromWeights(model) {
        const nn = new NeuralNetwork(model.layerNodesCounts)
        for (const i in nn.layers) {
            nn.layers[i] = Layer.fromWeights(model.layers[i])
        }
        return nn
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
            return -1;
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

    /**
     * Trains with back propogation
     * @param {Array} input - Array of input values
     * @param {Array} target - Array of labels
     */
    train(input, target) {
        if (!this.#trainArgsValidator(input, target)) {
            return -1;
        }

        this.feedForward(input, true); //layer matrices
        let targetMatrix = Matrix.fromArray(target);

        let prevError;
        this.loopLayersInReverse(this.layerNodesCounts, (layerIndex) => {
            let layerError = this.layers[layerIndex].calculateErrorLoss(targetMatrix, prevError);
            prevError = layerError.copy(); //will be used for error calculation in hidden layers
            this.backPropagation(layerIndex, layerError);
        })
    }

    backPropagation(layerIndex, layerError) {
        const currentLayer = this.layers[layerIndex]
        const nextLayer = this.layers[layerIndex - 1]

        //Calculating layer gradient
        const currentLayerGradient = Matrix.map(currentLayer.outputs, this.activation_derivative);
        currentLayerGradient.multiply(layerError);
        currentLayerGradient.multiply(this.learningRate);
        currentLayer.updateWeights(nextLayer.outputs, currentLayerGradient);
    }

    loopLayersInReverse(layerOutputs, callback) {
        for (let layer_index = layerOutputs.length - 1; layer_index >= 1; layer_index--) {
            callback(layer_index)
        }
    }


    setActivation(TYPE) {
        switch (TYPE) {
            case NeuralNetwork.SIGMOID:
                this.activation = NeuralNetwork.sigmoid;
                this.activation_derivative = NeuralNetwork.sigmoid_derivative;
                break;
            case NeuralNetwork.ReLU:
                this.activation = NeuralNetwork.relu;
                this.activation_derivative = NeuralNetwork.relu_derivative;
                break;
            default:
                console.error('Activation type invalid, setting sigmoid by default');
                this.activation = NeuralNetwork.sigmoid;
                this.activation_derivative = NeuralNetwork.sigmoid_derivative;
        }
    }


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

    // Argument validator functions
    #feedforwardArgsValidator(input_array) {
        let invalid = false;
        if (input_array.length != this.layerNodesCounts[0]) {
            invalid = true;
            console.error("Feedforward failed : Input array and input layer size doesn't match.");
        }
        return invalid ? false : true;
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

class Layer {
    static INPUT = 1
    static HIDDEN = 2
    static OUTPUT = 3

    constructor(inputSize, outputSize, activation, layerType) {
        this.layerType = layerType;
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        let weights_mat = new Matrix(this.outputSize, this.inputSize);
        weights_mat.randomize()

        let bias_mat = new Matrix(outputSize, 1);
        bias_mat.randomize()

        this.activation = activation;
        this.weights = weights_mat;
        this.biases = bias_mat;
        this.inputs = new Array(inputSize);
        this.outputs = new Array(outputSize);

    }

    static fromWeights(trainedLayer) {
        let layer = new Layer(
                trainedLayer.inputSize,
                trainedLayer.outputSize,
                NeuralNetwork.sigmoid,
                trainedLayer.layerType
        );
        layer.weights.data = trainedLayer.weights
        layer.biases.data = trainedLayer.biases;
        layer.outputs.data = trainedLayer.outputs;
        layer.inputs = trainedLayer.inputs;
        return layer
    }

    getWeights() {
        return {
            weights: this.weights.data,
            biases: this.biases.data,
            outputs: this.outputs.data,
            inputs: this.inputs,
            layerType: this.layerType,
            inputSize: this.inputSize,
            outputSize: this.outputSize
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

    calculateErrorLoss(target_matrix, prev_error) {
        if (this.layerType == Layer.OUTPUT) {
            return Matrix.add(target_matrix, Matrix.multiply(this.outputs, -1));
        }
        const weightTranspose = Matrix.transpose(this.weights);
        return Matrix.multiply(weightTranspose, prev_error);
    }

    updateWeights(nextLayerOutput, currentLayerGradient) {
        //Calculating delta weights
        const nextLayerOutputTransposed = Matrix.transpose(nextLayerOutput);
        const nextWeightsDelta = Matrix.multiply(currentLayerGradient, nextLayerOutputTransposed);

        //Updating weights and biases
        this.weights.add(nextWeightsDelta);
        this.biases.add(currentLayerGradient);
    }

}