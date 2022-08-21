const BATCH_SIZE = 1000;

class Agent {
    constructor() {
        this.n_games = 0
        this.epsilon = 0 // randomness
        this.gamma = 0.9 // discount rate
        this.memory = new Memory(500)
        this.model = new TrainableNeuralNetwork([11, 256, 3])
        this.trainer = new QTrainer(this.model, 0.001, this.gamma)
    }

    getState(game) {
        let car = game.bestCar
        let coordinates = car.getFutureCoordinates()
        const carBorder = createPolygon(coordinates, car.width, car.height)
        return [
            game.bestCar.controls.forward && isCollision(carBorder, game.road.borders, game.traffic) ? 1 : 0, //will collide with forward
            game.bestCar.controls.right && isCollision(carBorder, game.road.borders, game.traffic) ? 1 : 0, //will collide with right
            game.bestCar.controls.left && isCollision(carBorder, game.road.borders, game.traffic) ? 1 : 0, //will collide with left

            // Move direction
            ...gameCommands,
            // # Food location (direction)
            0,
            0,
            1,
            0,
        ]
    }

    remember(state, action, reward, nextState, done) {
        this.memory.addSample({
            state:state,
            action: action,
            reward: reward,
            nextState: nextState,
            done:done
        })
    }

    trainLongMemory() {
        const mini_batch = this.memory.sample(BATCH_SIZE)
        this.trainer.train(mini_batch)
    }

    trainShortMemory(state, action, reward, nextState, done) {
        this.trainer.train([{
            state:state,
            action: action,
            reward: reward,
            nextState: nextState,
            done:done
        }])
    }

    getAction(state) {
        this.epsilon = 80 - this.n_games
        let finalMove = null
        if (Math.random() < this.epsilon) {
            finalMove = [
                Math.floor(Math.random()) > 0.5 ? 1 : 0, //forward
                Math.floor(Math.random()) > 0.5 ? 1 : 0, //right
                Math.floor(Math.random()) > 0.5 ? 1 : 0, //left
                Math.floor(Math.random()) > 0.5 ? 1 : 0 //reverse
            ]
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
     * @param {Object} sample
     */
    addSample(sample) {
        this.samples.push(sample);
        if (this.samples.length > this.maxMemory) {
            this.samples.shift();
        }
    }

    /**
     * @param {number} nSamples
     * @returns {Array} Randomly selected samples
     */
    sample(nSamples) {
        return this.#sampleSize(this.samples, nSamples);
    }

    #sampleSize([...arr], n = 1) {
        let m = arr.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr.slice(0, n);
    }
}

class QTrainer {
    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
    }

    /**
     * @param {Array} samples
     */
    train(samples  ) {
        return
        // const target = reward + this.gamma * this.model.predict(next_state)[action]
        // this.model.train(state, action, target)
        // let pred = this.model.predict(next_state).reduce((a, b) => a + b, 0)

        for (const sample of samples) {
            const pred = this.model.predict(sample.state)
            let Q_new = sample.reward
            if (!sample.done) {
                Q_new =sample.reward + this.gamma * this.model.predict(sample.nextState)
            }
            const target = Q_new
            this.model.calculateLoss(target)
            this.model.updateWeights()
        }
    }
}


function trainRLAgent(game) {
    let plot_scores = []
    let total_score = 0
    let record = 0
    let agent = new Agent()
    frame()
    function frame(){
        let stateOld = agent.getState(game)
        gameCommands = agent.getAction(stateOld)
        let {reward, done, score} = game.playStep()
        let stateNew = agent.getState(game)
        agent.trainShortMemory(stateOld, gameCommands, reward, stateNew, done)
        agent.remember(stateOld, gameCommands, reward, stateNew, done)

        if (done) {
            game.init()
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
        requestAnimationFrame(frame);
    }
}