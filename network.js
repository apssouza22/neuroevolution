/**
 * A mini library for Artificial Neural Network inspired by ToyNeuralNetwork - https://github.com/CodingTrain/Toy-Neural-Network-JS
 */
class NeuralNetwork {
    /**
     * @param  {Array} arg_array - array of counts of neurons in each layer
     * Eg : new NeuralNet([3,4,2]); will instantiate ANN with 3 neurons as input layer, 4 as hidden and 2 as output layer
     */
    constructor(arg_array) {
        this.layer_nodes_counts = arg_array; // no of neurons per layer
        this.layers_count = arg_array.length; //total number of layers

        this.layers = []
        const {layer_nodes_counts} = this;

        for (let i = 0; i < layer_nodes_counts.length - 1; i++) {
            this.layers.push(new MyLayer(layer_nodes_counts[i], layer_nodes_counts[i + 1], NeuralNetwork.sigmoid))
        }
        NeuralNetwork.SIGMOID = 1;
        NeuralNetwork.ReLU = 2;

        this.activation = null;
        this.activation_derivative = null;
        this.setActivation(NeuralNetwork.SIGMOID);
        this.learningRate = 0.2;
    }


    static fromWeights(model) {
        const nn = new NeuralNetwork(model.layer_nodes_counts)
        let layers = []
        for (let i = 0; i < model.layer_nodes_counts.length - 1; i++) {
            layers.push(MyLayer.fromWeights(
                    model.layers[i],
                    model.layer_nodes_counts[i],
                    model.layer_nodes_counts[i + 1]
            ))
        }
        nn.layers = layers
        return nn
    }

    getWeights() {
        const layers = []
        for (const layersKey in this.layers) {
            layers.push(this.layers[layersKey].getWeights())
        }
        return {
            layer_nodes_counts: this.layer_nodes_counts,
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
        if (!this._feedforward_args_validator(input_array)) {
            return -1;
        }
        let inputMat = Matrix.fromArray(input_array)
        let outputs = [];
        outputs[0] = inputMat
        for (let i = 1; i < this.layer_nodes_counts.length; i++) {
            outputs[i]=this.layers[i - 1].feedForward(inputMat);
            inputMat = outputs[i];
        }

        if (GET_ALL_LAYERS == true) {
            return outputs;
        }
        return outputs[outputs.length - 1].toArray();
    }


    /**
     * Mutates weights and biases of ANN based on rate given
     * @param {float} rate - rate from 0-1
     */
    mutate(rate) { //rate 0 to 1
        NeuralNetMutator.mutate(this, rate)
    }

    /**
     * @param {Array} input_array - Array of input values
     * @param {Array} target_array - Array of labels
     */
    // Trains with backpropogation
    train(input_array, target_array) {
        if (!this._train_args_validator(input_array, target_array)) {
            return -1;
        }

        let layerOutputs = this.feedForward(input_array, true); //layer matrices
        let target_matrix = Matrix.fromArray(target_array);

        let prev_error;
        this.loopLayersInReverse(this.layer_nodes_counts, (layer_index) => {
            /* right and left are in respect to the current layer */
            let layerOutput = layerOutputs[layer_index];
            let layer_error = this.calculateLayerErrorLoss(layer_index, layerOutputs, target_matrix, layerOutput, prev_error);
            prev_error = layer_error.copy(); //will be used for error calculation in hidden layers
            this.backPropagation(layerOutput, layerOutputs[layer_index - 1], layer_error, layer_index);
        })
    }

    backPropagation(currentLayerOutput, nextLayerOutput, layer_error, layer_index) {
        //Calculating layer gradient
        const currentLayerGradient = Matrix.map(currentLayerOutput, this.activation_derivative);
        currentLayerGradient.multiply(layer_error);
        currentLayerGradient.multiply(this.learningRate);

        //Calculating delta weights
        const nextLayerOutputTransposed = Matrix.transpose(nextLayerOutput);
        const nextWeightsDelta = Matrix.multiply(currentLayerGradient, nextLayerOutputTransposed);

        //Updating weights and biases
        this.layers[layer_index - 1].weights.add(nextWeightsDelta);
        this.layers[layer_index - 1].biases.add(currentLayerGradient);
    }

    calculateLayerErrorLoss(layer_index, layerOutputs, target_matrix, layerOutput, prev_error) {
        if (this.isOutputLayer(layer_index, layerOutputs)) {
            return Matrix.add(target_matrix, Matrix.multiply(layerOutput, -1));
        }
        //Hidden layer
        const right_weights = this.layers[layer_index].weights;
        const right_weigths_t = Matrix.transpose(right_weights);
        return Matrix.multiply(right_weigths_t, prev_error);
    }

    /**
     * Is last layer (output layer)
     * @param layer_index
     * @param layerOutputs
     * @returns {boolean}
     */
    isOutputLayer(layer_index, layerOutputs) {
        return layer_index == layerOutputs.length - 1;
    }

    loopLayersInReverse(layerOutputs, callback) {
        for (let layer_index = layerOutputs.length - 1; layer_index >= 1; layer_index--) {
            callback(layer_index)
        }
    }

    activation(x) {
        return this.activation(x);
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
    _feedforward_args_validator(input_array) {
        let invalid = false;
        if (input_array.length != this.layer_nodes_counts[0]) {
            invalid = true;
            console.error("Feedforward failed : Input array and input layer size doesn't match.");
        }
        return invalid ? false : true;
    }

    _train_args_validator(input_array, target_array) {
        let invalid = false;
        if (input_array.length != this.layer_nodes_counts[0]) {
            console.error("Training failed : Input array and input layer size doesn't match.");
            invalid = true;
        }
        if (target_array.length != this.layer_nodes_counts[this.layers_count - 1]) {
            invalid = true;
            console.error("Training failed : Target array and output layer size doesn't match.");
        }
        return invalid ? false : true;
    }

}

class MyLayer {

    constructor(inputSize, outputSize, activation) {
        let weights_mat = new Matrix(outputSize, inputSize);
        weights_mat.randomize()

        let bias_mat = new Matrix(outputSize, 1);
        bias_mat.randomize()

        this.activation = activation;
        this.weights = weights_mat;
        this.biases = bias_mat;
        this.inputs = new Array(inputSize);
        this.outputs = new Array(outputSize);
    }

    static fromWeights(trainedLayer, inputSize, outputSize) {
        let layer = new MyLayer(inputSize, outputSize, NeuralNetwork.sigmoid);
        layer.weights.data = trainedLayer.weights
        layer.biases.data = trainedLayer.biases;
        layer.inputs = trainedLayer.inputs;
        layer.outputs = trainedLayer.outputs;
        return layer
    }

    getWeights() {
        return {
            weights: this.weights.data,
            biases: this.biases.data,
            inputs: this.inputs,
            outputs: this.outputs
        }
    }

    /**
     *
     * @param {Array} input_array - Array of input values
     * @param {Boolean} GET_ALL_LAYERS - if we need all layers after feed forward instead of just output layer
     */
    feedForward(input, GET_ALL_LAYERS) {
        this.inputs = input.data
        input = Matrix.multiply(this.weights, input);
        input.add(this.biases);
        input.map(this.activation); //activation
        this.outputs = input.data
        this.weights = this.weights
        return input
    }

}