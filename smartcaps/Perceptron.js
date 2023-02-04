class Perceptron {
    constructor(size){
        this.inputs = []
        this.weights = []
        for(let i=0; i<size; i++){
            this.weights[i] = Math.random()*2 - 1
        }
        this.bias = Math.random()*2 - 1
        this.size = size
    }

    setInputs(inputArray){
        if(inputArray.length === this.size){
            for(let i=0; i<this.size; i++){
                this.inputs[i] = inputArray[i]
            }
        } else {
            console.log("Wrong Size!")
        }
    }

    weightedSum(){
        let sum=0
        for (let i=0; i<this.size; i++){
            sum += this.inputs[i] * this.weights[i] 
        }
        sum += this.bias
        return sum
    }

    activation(sum){
        return sum < 0 ? -1 : 1
    }

    getOutput(){
        let output = this.activation(this.weightedSum())
        return output
    }
}