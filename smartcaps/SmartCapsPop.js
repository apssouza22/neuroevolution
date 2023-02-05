class SmartCapsPop extends PopulationHandler{
    constructor(popSize){
        super([])
        this.caps = []
        this.popSize = popSize
        this.mutationRate = 0.05
        this.targetPoint = new Vector(500, 100)
        this.startingPoint = new Vector(60, 420)
        this.generation = 1
        this.nextGenBrains = []
    }

    // creating a population with the size of the popSize property
    init(){
        for(let i=0; i<this.popSize; i++){
            if(this.caps[i]){
                this.caps[i].remove()
            }
            this.caps[i] = new SmartCaps(this.startingPoint.x, this.startingPoint.y+10, this.startingPoint.x, this.startingPoint.y-10, 10, 5)
        }
        this.addPopulation(this.caps)
    }

    // the sum of the populations members velocities
    velocitySum(){
        let vSum = 0
        this.caps.forEach(caps => {
            vSum += caps.vel.mag()
        })
        return vSum
    }

    // the average distance of the members from the target
    targetDistanceAvg() {
        let dSum = 0
        this.caps.forEach(caps => {
            dSum += caps.distance(this.targetPoint)
        })
        return dSum / this.popSize
    }

    // gives a fitness value to each members of the population
    setFitness(){
        this.caps.forEach(caps => {
            caps.fitness = caps.reward**4
        })
    }

    // the sum of the members fitness values
    fitnessSum(){
        let fSum = 0
        this.caps.forEach(caps => {
            fSum += caps.calcFitness()
        })
        return fSum
    }

    // population members are set to original position
    replaceNextGen(){
        for(let i=0; i < this.popSize; i++){
            this.caps[i].brain = this.nextGenBrains[i]
            this.caps[i].setPosition(this.startingPoint.x, this.startingPoint.y, 0)
            this.caps[i].setColor("lightgreen")
            this.caps[i].comp[1].color = "yellowgreen"
            this.caps[i].reward = 0
        }
        this.nextGenBrains = []
        this.generation++
    }

    reset(){
        super.reset()
        this.replaceNextGen()
    }
}