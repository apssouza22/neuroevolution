class NetworkVisualizer {

    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = 300;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext("2d");
    }

    /**
     * Update network visualization
     * @param {number}time
     * @param {NeuralNetwork} neuralNetwork
     */
    updateNetwork(time, neuralNetwork) {
        this.canvas.height = window.innerHeight;
        this.ctx.lineDashOffset = -time / 50;
        this.#drawNetwork(this.ctx, neuralNetwork.layers);
    }

    /**
     * Draw network layers visualization
     * @param {CanvasRenderingContext2D}ctx
     * @param {Layer[]}layers
     */
    #drawNetwork(ctx, layers) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / layers.length;

        for (let i = layers.length - 1; i >= 0; i--) {
            if (layers[i].layerType == Layer.INPUT) {
                continue;
            }
            const levelTop = top +
                    lerp(
                            height - levelHeight,
                            0,
                            layers.length == 1
                                    ? 0.5
                                    : i / (layers.length - 1)
                    );

            ctx.setLineDash([7, 3]);
            this.#drawLayer(
                    ctx, layers[i],
                    left, levelTop,
                    width, levelHeight,
                    i == layers.length - 1
                            ? ['F', 'R', 'L', 'B']
                            : []
            );
        }
    }

    /**
     * Draw layer visualization
     * @param ctx
     * @param layer
     * @param left
     * @param top
     * @param width
     * @param height
     * @param outputLabels
     */
    #drawLayer(ctx, layer, left, top, width, height, outputLabels) {
        const right = left + width;
        const bottom = top + height;

        const {inputs, outputs, weights, biases} = layer;

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.data.length; j++) {
                ctx.beginPath();
                ctx.moveTo(
                        NetworkVisualizer.#getNodeX(inputs, i, left, right),
                        bottom
                );
                ctx.lineTo(
                        NetworkVisualizer.#getNodeX(outputs.data, j, left, right),
                        top
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(weights.data[j][i]);
                ctx.stroke();
            }
        }

        const nodeRadius = 18;
        for (let i = 0; i < inputs.length; i++) {
            const x = NetworkVisualizer.#getNodeX(inputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(inputs[i]);
            ctx.fill();
        }

        for (let i = 0; i < outputs.data.length; i++) {
            const x = NetworkVisualizer.#getNodeX(outputs.data, i, left, right);
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(outputs.data[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = getRGBA(biases.data[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabels[i]) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.font = (nodeRadius * 1.5) + "px Arial";
                ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1);
            }
        }
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(
                left,
                right,
                nodes.length == 1
                        ? 0.5
                        : index / (nodes.length - 1)
        );
    }
}