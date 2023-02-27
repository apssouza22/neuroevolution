class Car extends PopulationItem{
    constructor(x, y, width, height, controlType, maxSpeed = 3, color = "blue") {
        super([5,6, 4, 4]);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.totalCarsOverTaken = 0;
        this.distanceTravelled = 0;
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
        }
        this.controls = new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png"

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = () => {
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }

    update(roadBorders, traffic) {
        const distance = this.y * -1;
        if (this.distanceTravelled < distance) {
            this.distanceTravelled = distance;
        }
        this.totalCarsOverTaken = this.damaged ? this.totalCarsOverTaken : traffic.filter(t => t.y > this.y).length
        if (!this.damaged) {
            this.#move();
            this.polygon = createPolygon({
                        angle: this.angle,
                        x: this.x,
                        y: this.y,
                    },
                    this.width,
                    this.height
            );
            this.damaged = isCollision(this.polygon, roadBorders, traffic);
        }
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            this.steer();
        }
    }

    /**
     * Use brain to find the best direction
     */
    steer() {
        if (!this.useBrain) {
            return
        }
        const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
        );
        let outputs = this.genome.useGenes(offsets);

        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
    }


    /**
     * @override {PopulationItem.calcFitness}
     * Calculates how good the car performed on the road
     */
    calcFitness() {
        return this.totalCarsOverTaken
    }


    #move() {
        let coordinates = this.getFutureCoordinates();
        this.speed = coordinates.speed;
        this.angle = coordinates.angle;
        this.x = coordinates.x;
        this.y = coordinates.y;
    }

    getFutureCoordinates() {
        let speed = this.speed
        let angle = this.angle
        if (this.controls.forward) {
            speed += this.acceleration;
        }
        if (this.controls.reverse) {
            speed -= this.acceleration;
        }

        if (speed > this.maxSpeed) {
            speed = this.maxSpeed;
        }
        if (speed < -this.maxSpeed / 2) {
            speed = -this.maxSpeed / 2;
        }

        if (speed > 0) {
            speed -= this.friction;
        }
        if (speed < 0) {
            speed += this.friction;
        }
        if (Math.abs(speed) < this.friction) {
            speed = 0;
        }

        if (speed != 0) {
            const flip = speed > 0 ? 1 : -1;
            if (this.controls.left) {
                angle += 0.03 * flip;
            }
            if (this.controls.right) {
                angle -= 0.03 * flip;
            }
        }
        return {
            speed: speed,
            angle: angle,
            x: this.x - Math.sin(angle) * speed,
            y: this.y - Math.cos(angle) * speed,
        }
    }

    draw(ctx, drawSensor = false) {
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        if (!this.damaged) {
            ctx.drawImage(this.mask,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height);
            ctx.globalCompositeOperation = "multiply";
        }
        ctx.drawImage(this.img,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height);
        ctx.restore();

    }
}


// class responsible for handle the car population
class CarPopulation extends PopulationHandler {
    constructor(count = 100) {
        let population = new Array(count);
        super(population);
        this.count = count;
        this.generateCars(0);
        this.population = population;
    }

    /**
     * Add game road
     * @param {Road}road
     */
    addRoad(road) {
        this.road = road;
    }

    reset() {
        for (const pop of this.population) {
            pop.fitness = 0;
            pop.x = this.road.getLaneCenter(1);
            pop.y = 100;
            pop.damaged = false;
        }
        console.log("Resetting population");
    }

    generateCars(x) {
        let controlType = DRIVE_AI_MODE_ENABLED ? "AI":"KEYS";
        for (let i = 0; i < this.count; i++) {
            this.population[i] = new Car(x, 100, 30, 50, "AI");
        }
    }

    sortByFitness() {
        return this.population.sort((a, b) => a.calcFitness() > b.calcFitness() ? -1 : 1)
    }

    /**
     * Get the population
     * @returns {Car[]}
     */
    get() {
        return this.population;
    }

    /**
     * Check if anyone in population is alive
     * @return {boolean}
     */
    hasAlive() {
        return this.population.filter(car => !car.damaged).length == 0;
    }
}