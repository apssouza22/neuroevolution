function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function AND_gate_test() {
    console.log("AND GATE TEST : ");

    let mynn = new TrainableNeuralNetwork([3, 4, 2]);

    let training_data = [
        [[1, 1, 1], [0, 1]],
        [[1, 0, 1], [1, 0]],
        [[0, 1, 1], [1, 0]],
        [[0, 0, 1], [1, 0]],
    ];


    console.log("Before training...");
    console.log('0 AND 0', argMax(mynn.feedForward([0, 0, 1])));
    console.log('0 AND 1', argMax(mynn.feedForward([0, 1, 1])));
    console.log('1 AND 0', argMax(mynn.feedForward([1, 0, 1])));
    console.log('1 AND 1', argMax(mynn.feedForward([1, 1, 1])));

    // several training epochs
    for (let i = 0; i < 10000; i++) {
        let tdata = training_data[Math.floor(Math.random() * training_data.length)];
        mynn.train(tdata[0], tdata[1]);
    }

    console.log("After training...");
    console.log('0 AND 0', argMax(mynn.feedForward([0, 0, 1])));
    console.log('0 AND 1', argMax(mynn.feedForward([0, 1, 1])));
    console.log('1 AND 0', argMax(mynn.feedForward([1, 0, 1])));
    console.log('1 AND 1', argMax(mynn.feedForward([1, 1, 1])));
}

AND_gate_test();