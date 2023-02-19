// Class responsible for handling the car direction
class Controls {

    /**
     *
     * @param {string}type
     * @param {Genome} genome
     */
    constructor(type, genome) {
        this.direction = {
            forward: false,
            left: false,
            right: false,
            reverse: false,
        }

        this.genome = genome
        this.controlType = type
        switch (type) {
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                this.direction.forward = true;
                break;
        }
    }

    getDirection(input) {
        if (this.controlType != "AI") {
            return this.direction
        }
        let outputs = this.genome.useGenes(input);
        this.direction.forward = outputs[0];
        this.direction.left = outputs[1];
        this.direction.right = outputs[2];
        this.direction.reverse = outputs[3];
        return this.direction
    }

    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.direction.left = true;
                    break;
                case "ArrowRight":
                    this.direction.right = true;
                    break;
                case "ArrowUp":
                    this.direction.forward = true;
                    break;
                case "ArrowDown":
                    this.direction.reverse = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.direction.left = false;
                    break;
                case "ArrowRight":
                    this.direction.right = false;
                    break;
                case "ArrowUp":
                    this.direction.forward = false;
                    break;
                case "ArrowDown":
                    this.direction.reverse = false;
                    break;
            }
        }
    }
}