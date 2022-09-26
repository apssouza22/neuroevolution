let populationCount = 500;
let gameStepFrameCount = 1;
const networkVisualizer = new NetworkVisualizer(document.getElementById("networkCanvas"));
let chart = getChart()
const game = new Game(document.getElementById("carCanvas"), (game) => {
    chart.data.labels.push(game.generationCounts);
    const [mom, dad] = game.gaPopulation.selection();
    console.log(mom.totalCarsOverTaken)
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(mom.totalCarsOverTaken);
    });
    chart.update();
});
trainGeneticAlgo();

function updateFrameLoop(input) {
    gameStepFrameCount = input.value == "" ? 1 : parseInt(input.value);
}

function updatePopulation(input) {
    populationCount = input.value == "" ? 500 : parseInt(input.value);
    populationCount = populationCount < 2 ? 2 : populationCount;
    game.gaPopulation = new CarPopulation(populationCount, 0.1);
    game.init();
}

function save(e) {
    const [mom, dad] = game.gaPopulation.selection();
    if (mom.totalCarsOverTaken > 0 || e) {
        mom.brain.nn.save("momBrain");
        dad.brain.nn.save("dadBrain");
    }
}

function discard() {
    localStorage.removeItem("momBrain");
    localStorage.removeItem("dadBrain");
}

function trainGeneticAlgo(time) {
    function animate(time) {
        for (let i = 0; i < gameStepFrameCount; i++) {
            let {gameOver,} = game.playStep(time);
            if (!gameOver) {
                networkVisualizer.updateNetwork(time, game.bestCar.brain);
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
            responsive: true,
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