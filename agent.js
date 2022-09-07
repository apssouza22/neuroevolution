const BATCH_SIZE = 1000;

class Agent {
    constructor() {
        this.n_games = 0
        this.epsilon = 0 // randomness
        this.gamma = 0.9 // discount rate
        this.memory = new Memory(500)
        this.model = new TrainableNeuralNetwork([11, 256, 3])
        this.trainer = new QTrainer(this.model, 0.001, this.gamma)
        this.loadModuleWeights()
    }

    getState(game) {
        let car = game.bestCar
        car.brain = this.model
        let sensors = car.getSensorData()
        let coordinates = car.getFutureCoordinates()
        const carBorder = createPolygon(coordinates, car.width, car.height)
        return [
            // Move direction
            gameCommands[0],
            gameCommands[1],
            gameCommands[2],

            car.controls.forward && isCollision(carBorder, game.road.borders, game.traffic) ? 1 : 0, //will collide with forward
            car.controls.right && isCollision(carBorder, game.road.borders, game.traffic) ? 1 : 0, //will collide with right
            car.controls.left && isCollision(carBorder, game.road.borders, game.traffic) ? 1 : 0, //will collide with left

            //     // sensors
            ...sensors
        ]
    }

    remember(state, action, reward, nextState, done) {
        this.memory.addSample({
            state: state,
            action: action,
            reward: reward,
            nextState: nextState,
            done: done
        })
    }

    trainLongMemory() {
        const mini_batch = this.memory.sample(BATCH_SIZE)
        this.trainer.train(mini_batch, true)
    }

    trainShortMemory(state, action, reward, nextState, done) {
        this.trainer.train([{
            state: state,
            action: action,
            reward: reward,
            nextState: nextState,
            done: done
        }])
    }

    getAction(state) {
        this.epsilon = 100 - this.n_games
        let steer = [0, 0, 0]
        if (Math.random() * 200 < this.epsilon) {
            steer = [
                Math.random() > 0.5 ? 1 : 0, // forward
                Math.random() > 0.5 ? 1 : 0, //right
                Math.random() > 0.5 ? 1 : 0, //left
            ]
        } else {
            let outputs = this.model.predict(state)
            steer[argMax(outputs)] = 1
            if (steer[1] == 1) {
                console.log(steer)
            }
        }
        return steer
    }

    loadModuleWeights() {
        if (localStorage.getItem('brain')) {
            console.log('Loading brain')
            this.model.loadWeights(JSON.parse(localStorage.getItem("brain")))
        }
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
    totalLoss = 0
    totalTrain = 0

    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
    }

    /**
     * @param {Array} samples
     */
    train(samples, long = false) {
        for (const sample of samples) {
            this.totalTrain++
            const pred = this.model.predict(sample.state)
            let Q_new = sample.reward
            if (!sample.done) {
                Q_new = sample.reward + this.gamma * Math.max(...this.model.predict(sample.nextState))
            }
            let target = [...pred]
            target[argMax(sample.action)] = Q_new
            // for (const action in sample.action) {
            //     if (sample.action[action] > 0) {
            //         target[action] = Q_new
            //     }
            // }
            // target[argMax(sample.action)] = Q_new
            this.model.calculateLoss(target)
            this.model.updateWeights()
            let loss = mse(pred, target)
            this.totalLoss += loss
        }
        if (long) {
            let meanLoss = this.totalLoss / this.totalTrain
            console.log(`Mean loss: ${meanLoss}`)
        }
    }
}

function mse(a, b) {
    let error = 0
    for (let i = 0; i < a.length; i++) {
        error += Math.pow((b[i] - a[i]), 2)
    }
    return error / a.length
}

/**
 * Retrieve the array key corresponding to the largest element in the array.
 *
 * @param {Array.<number>} array Input array
 * @return {number} Index of array element with largest value
 */
function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function trainRLAgent(game) {
    let total_score = 0
    let record = 0
    let agent = new Agent()
    let gameTimeout = false
    frame()

    function frame() {

        for (let i = 0; i < GAME_STEP_PER_FRAME; i++) {
            let stateOld = agent.getState(game)
            // console.log(stateOld)
            let action = agent.getAction(stateOld)
            gameCommands = [1, action[1], action[2], 0] // forward, right, left, reverse
            let {reward, gameOver, score} = game.playStep()
            let stateNew = agent.getState(game)
            // console.log(reward)
            agent.trainShortMemory(stateOld, action, reward, stateNew, gameOver)
            agent.remember(stateOld, action, reward, stateNew, gameOver)

            if (gameOver || gameTimeout) {
                // return
                gameTimeout = false
                clearInterval(game.timeout)
                game.init()
                agent.n_games += 1
                agent.trainLongMemory()

                if (score > record) {
                    record = score
                }
                agent.model.save()

                console.log('Game', agent.n_games, 'Score', score, 'Record:', record)
                total_score += score
                let mean_score = total_score / agent.n_games
                console.log('Mean Score:', mean_score)
            }
        }
        requestAnimationFrame(frame);
    }
}

class LRHelper {
    static sensorData = []
    static checkGameOver(car) {
        if (car.damaged && GAME_INFO.brainMode != "GA") {
            return {
                reward: -100,
                gameOver: true,
                score: car.calcFitness() + car.y * -1,
            }
        }
        return {
            gameOver: false,
        }
    }


    static getRewards(car, reward, prevTotalCarsOverTaken) {
        car.getSensorData().forEach((sensor, index) => {
            if (sensor > 0.5) {
                if (LRHelper.sensorData[index] < sensor) {
                    reward -= (sensor * 100) / 5
                }
            }else{
                reward += 10
            }
        })
        LRHelper.sensorData = car.getSensorData()

        if (car.speed > 1) {
            reward += 5
        }else {
            reward -= 7
        }

        if (prevTotalCarsOverTaken < car.totalCarsOvertaken) {
            reward = 100
        }
        // console.log(reward)
        return reward;
    }
}