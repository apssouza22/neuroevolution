// STEP 1: setting up the environment
// creating the starting objects and variables before starting the main loop
// for example:
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.focus();

let counter = 0
let stepCounter = 0
let smartCapsPop = new SmartCapsPop(20)
let capsAreMoving = false

let starterButton = document.getElementById("relaunch")
let nextGenButton = document.getElementById("nextGen")
let genDataField = document.getElementById("genData")
nextGenButton.disabled = true
starterButton.onclick = () => {
    starterButton.disabled = true
    nextGenButton.disabled = true
    genDataField.innerHTML = ``
    smartCapsPop.generation = 1
    capsAreMoving = true
    smartCapsPop.init();
    counter = 0
    stepCounter = 0
}

function nextGeneration() {
    smartCapsPop.replaceNextGen()
    counter = 0
    stepCounter = 0
    capsAreMoving = true
    starterButton.disabled = true
    nextGenButton.disabled = true
}

nextGenButton.onclick = () => {
    nextGeneration();
}
road = getRoad()
let geneticEvolution = new GeneticEvolution(smartCapsPop);
// STEP 2: defining the game logic
function gameLogic(){
    if(capsAreMoving){
        if(counter % 3 === 0){
            smartCapsPop.caps.forEach(caps => {
                if(stepCounter < 300){
                    // caps.brain.setInputValues(caps.getSensorData(road.walls))
                    // caps.brain.feedForward()
                    caps.makeMove(caps.getSensorData(road.walls))
                } else {
                    caps.stop()
                }
                caps.getReward(road.checkLines)
            })
            if(smartCapsPop.velocitySum() < 0.01 && stepCounter > 0){
                starterButton.disabled = false
                nextGenButton.disabled = false
                capsAreMoving = false
                smartCapsPop.setFitness()
                genDataField.innerHTML += `<br/>Gen ${smartCapsPop.generation} - Avg dist: ${Math.floor(smartCapsPop.fitnessSum() / smartCapsPop.popSize)}`
                nextGenButton.textContent = `Launch Generation ${smartCapsPop.generation+1}`
                geneticEvolution.evolve();

            }
            stepCounter++
            counter = 0
        }
        counter++
    }
    if(!nextGenButton.disabled){
        nextGeneration();
    }
    smartCapsPop.caps.forEach(caps => {
        ctx.fillStyle = "white"
        ctx.fillText(caps.reward, caps.comp[1].pos.x-4, caps.comp[1].pos.y+2)
    })
}

const gameStepFrameCount=1
trainGeneticAlgo(0)
function trainGeneticAlgo(time) {
    // startGame();
    function animate(time) {
        for (let i = 0; i < gameStepFrameCount; i++) {
            userInteraction();
            physicsLoop();
            renderLoop();
            gameLogic();
        }
        requestAnimationFrame(animate);
    }

    animate(time)
}

function startGame() {
    let geneticEvolution = new GeneticEvolution(new CarPopulation(populationCount), 0.1);
    geneticEvolution.loadGenetics();

    game = new CapsGame(
        document.getElementById("canvas"),
        geneticEvolution,
        (game) => {
        });
}