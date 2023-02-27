/**
 * To enable manual control set DRIVE_AI_MODE_ENABLED=false
 * @type {boolean}
 */
const DRIVE_AI_MODE_ENABLED = true;
let populationCount = 500;
let gameStepFrameCount = 1;
const networkVisualizer = new NetworkVisualizer(document.getElementById("networkCanvas"));
let chart = getChart()
let game = null;

function startGame() {
    if (!DRIVE_AI_MODE_ENABLED) {
        populationCount = 2
    }
    let geneticEvolution = new GeneticEvolution(new CarPopulation(populationCount), 0.1);
    geneticEvolution.loadGenetics();

    game = new Game(
            document.getElementById("carCanvas"),
            geneticEvolution,
            (game) => {
                chart.data.labels.push(geneticEvolution.generation);
                /**
                 * @type {Car}
                 */
                const [mom, _] = game.evolution.select();
                console.log(mom.totalCarsOverTaken)
                chart.data.datasets.forEach((dataset) => {
                    dataset.data.push(mom.totalCarsOverTaken);
                });
                chart.update();
            });
}

trainGeneticAlgo();

function updateFrameLoop(input) {
    gameStepFrameCount = slider.value == "" ? 1 : parseInt(input.value);
}

function updatePopulation(input) {
    populationCount = input.value == "" ? 500 : parseInt(input.value);
    populationCount = populationCount < 2 ? 2 : populationCount;
    startGame();
}

function save(e) {
    const [mom, dad] = game.evolution.select();
    if (mom.totalCarsOverTaken > 0 || e) {
        game.evolution.saveGenetics();
    }
}

function discard() {
    localStorage.removeItem("momBrain");
    localStorage.removeItem("dadBrain");
}

function trainGeneticAlgo(time) {
    startGame();
    function animate(time) {
        for (let i = 0; i < gameStepFrameCount; i++) {
            let {gameOver,} = game.playStep(time);
            if (!gameOver) {
                networkVisualizer.updateNetwork(time, game.bestCar.genome.nn);
            }
        }
        requestAnimationFrame(animate);
    }

    animate(time)
}

function getChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
        data: {
            labels: [],
            datasets: [{
                label: 'Generation performance',
                data: [],
                borderWidth: 3,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                ],
            }],
            borderWidth: 5
        },
    });
    return myChart
}