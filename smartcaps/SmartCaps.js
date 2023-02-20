class SmartCaps extends PopulationItem {
    constructor(x1, y1, x2, y2, r, m) {
        super([5, 6, 4, 4])
        this.bestCap = false;
        this.comp = [];
        this.pos = new Vector(this.x, this.y);
        this.m = 0;
        this.inv_m = 0;
        this.inertia = 0;
        this.inv_inertia = 0;
        this.elasticity = 1;

        this.friction = 0;
        this.angFriction = 0;
        this.maxSpeed = 0;
        this.layer = 0;

        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.action = false;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.keyForce = 1;
        this.angKeyForce = 0.1;
        this.angle = 0;
        this.angVel = 0;
        this.player = false;
        BODIES.push(this);
        this.comp = [new Circle(x1, y1, r), new Circle(x2, y2, r)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2 * r));
        this.pos = this.comp[0].pos;
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * ((2 * this.comp[0].width) ** 2 + (this.comp[0].length + 2 * this.comp[0].width) ** 2) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }

        this.layer = -1
        this.friction = 0.06
        this.angFriction = 0.05
        this.maxSpeed = 5
        this.setColor("lightgreen")
        this.comp[1].color = "yellowgreen"
        this.fitness = 0
        this.reward = 0
        this.sensors = {
            start: new Vector(0, 0),
            dist: 200,
            dir: [],
            line: new Line(0, 0, 0, 0)
        }
        this.sensors.line.color = "grey"
        this.sensorValues = []
    }

    render(){
        for (let i in this.comp){
            this.comp[i].draw();
        }
    }
    setColor(color){
        this.comp.forEach(comp => {
            comp.color = color
        })
    }

    remove() {
        if (BODIES.indexOf(this) !== -1) {
            BODIES.splice(BODIES.indexOf(this), 1);
        }
    }

    calcFitness(){
        this.fitness = this.reward**4
        return this.fitness
    }

    keyControl(){
        if(this.up){
            this.acc = this.comp[0].dir.mult(-this.keyForce);
        }
        if(this.down){
            this.acc = this.comp[0].dir.mult(this.keyForce);
        }
        if(this.left){
            this.angVel = -this.angKeyForce;
        }
        if(this.right){
            this.angVel = this.angKeyForce;
        }
        if(!this.up && !this.down){
            this.acc.set(0, 0);
        }
    }

    setPosition(x, y, a = this.angle){
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].pos = this.comp[0].pos.add(this.comp[0].dir.mult(-this.comp[0].length/2));
        this.comp[2].pos = this.comp[0].pos.add(this.comp[0].dir.mult(this.comp[0].length/2));
        this.angle += this.angVel;
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.keyForce);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-this.friction);
        if (this.vel.mag() > this.maxSpeed && this.maxSpeed !== 0){
            this.vel = this.vel.unit().mult(this.maxSpeed);
        }
        this.angVel *= (1-this.angFriction);
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }

    // iterating through the brain array and changing the acceleration accordingly
    makeMove(sensorData){
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        let output = this.genome.useGenes(sensorData)

        if(output[0] === 1){
            this.left = true
        }
        if(output[1] === 1){
            this.right = true
        }
        if(output[2] === 1){
            this.up = true
        }
        if(output[3] === 1){
            this.down = true
        }
    }

    // the distance between the caps and a given point
    distance(vec){
        return this.pos.subtr(vec).mag()
    }

    // counting the checklines crossed
    getReward(){
        if(collide(this, checkLines[this.reward % checkLines.length])){
            this.reward++
        }
    }

    // collects the distances to the closest wall towards various directions
    getSensorData(wallArray){
        this.sensors.start.set(this.comp[1].pos.x, this.comp[1].pos.y)
        this.sensors.line.vertex[0] = this.sensors.start
        this.sensors.dir[0] = this.comp[1].pos.subtr(this.comp[2].pos).unit()
        this.sensors.dir[1] = this.sensors.dir[0].normal()
        this.sensors.dir[2] = this.sensors.dir[1].normal().normal()
        this.sensors.dir[3] = this.sensors.dir[0].add(this.sensors.dir[1]).unit()
        this.sensors.dir[4] = this.sensors.dir[0].add(this.sensors.dir[2]).unit()
        for(let i=0; i<5; i++){
            let closestPoint = this.sensors.start.add(this.sensors.dir[i].mult(this.sensors.dist))
            wallArray.forEach(wall => {
                let intersection = lineSegmentIntersection(
                    this.sensors.line.vertex[0], closestPoint, wall.start, wall.end)
                if(intersection &&
                    intersection.subtr(this.sensors.start).mag() <
                    closestPoint.subtr(this.sensors.start).mag()){
                    closestPoint = intersection
                    this.sensors.line.color = "red"
                }
            })
            this.sensorValues[i] = closestPoint.subtr(this.sensors.start).mag()
            this.sensors.line.vertex[1] = closestPoint
            if (this.bestCap){
                testCircle(closestPoint.x, closestPoint.y, "green")
                this.sensors.line.draw()
            }
            this.sensors.line.color = "grey"
        }
        return this.sensorValues
    }

    // stops modifying the direction properties and sets the acceleration vector to 0
    stop(){
        this.left = false
        this.right = false
        this.up = false
        this.down = false
        this.acc.set(0,0)
    }
}