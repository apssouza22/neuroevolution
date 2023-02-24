# NeuroEvolution made easy
Neuroevolution is a powerful approach to machine learning and artificial intelligence that uses evolutionary algorithms to evolve neural networks.

This project contain a neuro-evolution library that allows you to easily use [NeuroEvolution](https://en.wikipedia.org/wiki/Neuroevolution) in your game.

In this project, we have applied GeneticEvolution to multiple games such as self-driving cars, smart caps and flappy bird.

![Alt text](neuroevolution.png?raw=true "Neuro-evolution")

This project is a follow-up to my project about [Artificial Neural Networks from scratch](https://github.com/apssouza22/neuralnet-browser), where I show how to create an ANN
from scratch without libraries. In that project the learning process is done using backpropagation(gradient descent), this project 
use a different approach, we will use Evolutionary Algorithm.

Evolutionary algorithm uses mechanisms inspired by biological evolution, such as reproduction, mutation, recombination, and selection. 
Candidate solutions to the optimization problem play the role of individuals in a population, and the fitness function determines the quality of the solutions. 
Evolution of the population then takes place after the repeated application of the above operators.

The project is developed from scratch and with no external libraries.

## Get started
The library is in the `neuroevolution` folder. The library is composed of 3 main classes:
- `NeuralNetwork`: This class represents the required Artificial Neural network.
- `GeneticEvolution`: This class represents the Genetic Evolution Algorithm.
- `PopulationHandler`: This class represents the genetic population.
- `PopulationItem`: This class represents the item in population.

```
let population = [new PopulationItem(), new PopulationItem()]
let populationHandler =  new PopulationHandler(population)
let geneticEvolution = new GeneticEvolution(populationHandler);
geneticEvolution.evolve(); // evolve the population based on the fitness function
```

`PopulationItem` and `PopulationHandler` are classes that you need to implement in your game.
Population Item examples:
- [Car](https://github.com/apssouza22/neuroevolution/blob/master/smartcaps/car.js#L1)
- [SmartCaps](https://github.com/apssouza22/neuroevolution/blob/master/smartcaps/SmartCaps.js#L1)
- [FlappyBird](https://github.com/apssouza22/neuroevolution/blob/master/flappybird/bird.js#L6)

- PopulationHandler examples:
- [CarPopulation](https://github.com/apssouza22/neuroevolution/blob/master/smartcaps/car.js#L176)
- [SmartCapsPopulation](https://github.com/apssouza22/neuroevolution/blob/master/smartcaps/SmartCapsPop.js#L1)
- [FlappyBirdPopulation](https://github.com/apssouza22/neuroevolution/blob/master/flappybird/ga.js#L11)


You can use the population genes to perform the game action. 
See the [Car.steer](https://github.com/apssouza22/neuroevolution/blob/master/smartcaps/car.js#L71), [SmartCaps.makeMove](https://github.com/apssouza22/neuroevolution/blob/master/smartcaps/SmartCaps.js#L128) and [FlappyBird.think](https://github.com/apssouza22/neuroevolution/blob/master/flappybird/bird.js#L31) methods.
```
geneticEvolution.getPopulationHandler().getPopulation().forEach((item) => {
    let output = item.useGenes(input);
    log(output);
});
```

![Alt text](self-driving.png?raw=true "Self driving car")
![Alt text](flappy.png?raw=true "Flappy bird")
![Alt text](smartcaps.png?raw=true "SmartCaps")

### If this project helped you, consider leaving a star  and by me a coffee
<a href="https://www.buymeacoffee.com/apssouza"><img src="https://miro.medium.com/max/654/1*rQv8JgstmK0juxP-Kb4IGg.jpeg"></a>

---
To learn more about the game examples check the following links:
- [Self-driving car](https://github.com/gniziemazity/Self-driving-car)
- [SmartCaps](https://github.com/danielszabo88/smartCaps)
- [Flappy bird](https://github.com/CodingTrain/website-archive/tree/main/Courses/natureofcode/11.3_neuroevolution_tfjs.js)
