class Controls {
    constructor(type) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
        switch (type) {
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                this.forward = true;
                break;
        }
    }

    /**
     * Update control direction
     * @param {Car}car
     */
    update(car) {
        if (!car.useBrain) {
            return
        }
        const offsets = car.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
        );
        let outputs = car.dna.nn.feedForward(offsets, false);
        outputs = outputs.map(i => i > 0.5 ? 1 : 0)

        car.controls.forward = outputs[0];
        car.controls.left = outputs[1];
        car.controls.right = outputs[2];
        car.controls.reverse = outputs[3];
    }

    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        }
    }
}