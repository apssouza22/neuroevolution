# Self-driving-car with Genetic algorithm and Artificial Neural Networks

This is a self-driving car game developed using the combination of 
Genetic algorithm and Artificial Neural Networks(NeuroEvolution). 

This project is a follow-up on my project about [Artificial Neural Networks from scratch](https://github.com/apssouza22/neuralnet-browser) where I show how to create an ANN
from scratch without libraries. In that project the learning process is done using backpropagation(gradient descent), this project 
use a different approach, we will use Evolutionary Algorithm.

Evolutionary algorithm uses mechanisms inspired by biological evolution, such as reproduction, mutation, recombination, and selection. 
Candidate solutions to the optimization problem play the role of individuals in a population, and the fitness function determines the quality of the solutions. 
Evolution of the population then takes place after the repeated application of the above operators.

The project is developed from scratch and with no external libraries.

![Alt text](smartcar/nn.png?raw=true "Self driving car")

## NeuroEvolution library
We have made the NeuroEvolution framework totally independent of the game this way we can use it in any game we want.
The framework is in the `neuroevolution` folder. The framework is composed of 3 main classes:
- `NeuralNetwork`: This class represents the required Artificial Neural network.
- `GeneticEvolution`: This class represents the Genetic Evolution Algorithm.
- `PopulationHandler`: This class represents the genetic population.

```
let population = [new PopulationItem(), new PopulationItem()]
let populationHandler =  new PopulationHandler(population)
let geneticEvolution = new GeneticEvolution(populationHandler);
geneticEvolution.loadDna(); // load DNAs from local storage if available
geneticEvolution.evolve(); // evolve the population based on the fitness function
geneticEvolution.saveDna(); // save the DNAs to local storage
```

`PopulationItem` and `PopulationHandler` are classes that you need to implement in your game. 
See the [Car](https://github.com/apssouza22/neuroevolution/blob/master/car.js#L1) and [CarPopulation](https://github.com/apssouza22/neuroevolution/blob/master/car.js#L176) for an example.


You can use the population genes to play the game. See the [Car.steer](https://github.com/apssouza22/neuroevolution/blob/master/car.js#L71) for an example.
```
geneticEvolution.getPopulationHandler().getPopulation().forEach((item) => {
    let output = item.useGenes(input);
    log(output);
});
```


### If this project helped you, consider leaving a star  and by me a coffee
<a href="https://www.buymeacoffee.com/apssouza"><img src="https://miro.medium.com/max/654/1*rQv8JgstmK0juxP-Kb4IGg.jpeg"></a>

---
This project uses two other projects:
- [Self-driving car](https://github.com/gniziemazity/Self-driving-car)
- [SmartCaps](https://github.com/danielszabo88/smartCaps)