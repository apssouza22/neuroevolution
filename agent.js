const BATCH_SIZE = 1000;

class Agent {
    constructor() {
        this.n_games = 0
        this.epsilon = 0 // randomness
        this.gamma = 0.9 // discount rate
        this.memory = []
        this.model = new TrainableNeuralNetwork([11, 256, 3])
        this.trainer = new QTrainer(this.model, 0.001, this.gamma)
    }

    getState(game) {

    }

    remember(state, action, reward, nextState, done) {
        this.memory.push({state, action, reward, nextState, done})
    }

    trainLongMemory() {
        var mini_batch = this.memory.splice(0, BATCH_SIZE)
        this.trainer.train(mini_batch)
    }

    trainShortMemory(state, action, reward, nextState, done) {
        this.trainer.train([{state, action, reward, nextState, done}])
    }

    getAction(state) {
        this.epsilon = 80 - this.n_games
        let finalMove = [0, 0, 0, 0]
        if (Math.random() < this.epsilon) {
            let move = Math.floor(Math.random() * 3)
            finalMove[move] = 1
        } else {
            let outputs = this.model.predict(state)
            finalMove = outputs.map(i => i > 0.5 ? 1 : 0)
        }
        return finalMove
    }
}

class Memory {
    /**
     * @param {number} maxMemory
     */
    constructor(maxMemory) {
        this.maxMemory = maxMemory;
        this.samples = new Array();
    }

    /**
     * @param {Array} sample
     */
    addSample(sample) {
        this.samples.push(sample);
        if (this.samples.length > this.maxMemory) {
            let [state, , , nextState] = this.samples.shift();
            state.dispose();
            nextState.dispose();
        }
    }

    /**
     * @param {number} nSamples
     * @returns {Array} Randomly selected samples
     */
    sample(nSamples) {
        return sampleSize(this.samples, nSamples);
    }
}

class QTrainer {
    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
    }

    train(state, action, reward, next_state, done) {
        const target = reward + this.gamma * this.model.predict(next_state)[action]
        this.model.train(state, action, target)
    }
}

let gameCommands =  [0,0,0,0]
let gameInfo = null
function train() {
    let plot_scores = []
    let plot_mean_scores = []
    let total_score = 0
    let record = 0
    let agent = new Agent()

    while (true) {
        //# get     old    state
        let state_old = agent.getState(gameInfo)
        gameCommands = agent.getAction(state_old)
        let {reward, done, score} = playStep()
        let stateNew = agent.getState(gameInfo)
        agent.trainShortMemory(state_old, final_move, reward, stateNew, done)
        agent.remember(state_old, final_move, reward, stateNew, done)

        if (done) {
            // train        long        memory, plot        result
            gameReset()
            agent.n_games += 1
            agent.trainLongMemory()

            if (score > record) {
                record = score
                agent.model.save()
            }

            console.log('Game', agent.n_games, 'Score', score, 'Record:', record)
            plot_scores.append(score)
            total_score += score
            let mean_score = total_score / agent.n_games
            console.log('Mean Score:', mean_score)
        }
    }
}