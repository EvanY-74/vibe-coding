const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAX_ENERGY_CONSUMPTION = 1.5; // Max energy consumption to limit speed
const FOOD_ENERGY_GAIN = 5; // Energy gained from eating food
const ENERGY_TO_DUPLICATE = 50; // Energy cost to duplicate
const MUTATION_CHANCE = 0.1; // 10% chance of mutation during duplication
const VISION_RADIUS = 200; // Vision range for seeing other cells and food

// Reinforcement Learning Helper Functions
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Cell Class with RL behavior
class Cell {
  constructor(x, y, radius, color, species, neuralParams) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.species = species;
    this.energy = 100; // Initial energy
    this.xv = 0;
    this.yv = 0;
    this.state = 'dormant'; // Can be 'dormant' or 'aggressive'
    this.neuralParams = neuralParams || this.randomNeuralParams();
  }

  // Simple neural network (for decision making)
  neuralNetwork(inputs) {
    let output = inputs.reduce((acc, input, idx) => acc + input * this.neuralParams[idx], 0);
    return sigmoid(output); // Using sigmoid activation function for simplicity
  }

  // Randomized neural parameters for mutation
  randomNeuralParams() {
    let params = [];
    for (let i = 0; i < 10; i++) {
      params.push(randomInRange(-1, 1)); // Random values between -1 and 1
    }
    return params;
  }

  update(deltaTime, cells, foodItems) {
    if (this.energy <= 0) {
      this.die();
      return;
    }

    const energySpent = Math.min(this.energy, MAX_ENERGY_CONSUMPTION);
    const velocityX = this.xv * energySpent;
    const velocityY = this.yv * energySpent;

    this.x += velocityX * deltaTime;
    this.y += velocityY * deltaTime;
    this.energy -= energySpent;

    // Ensure the energy doesn't drop below 0
    if (this.energy < 0) this.energy = 0;

    // Collision with other cells
    for (const other of cells) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.radius + other.radius && this.species !== other.species) {
        this.collideWithCell(other);
      }
    }

    // Check for food collision
    for (const food of foodItems) {
      const dx = this.x - food.x;
      const dy = this.y - food.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.radius + food.size / 2) {
        this.consumeFood(food);
      }
    }

    // Decision making based on surroundings (RL)
    this.makeDecision(cells, foodItems);
  }

  // Action logic when colliding with another cell
  collideWithCell(other) {
    if (this.state === 'aggressive') {
      this.attackCell(other);
    }
  }

  attackCell(other) {
    // Attack other cell, lose energy and health
    this.energy -= 20;
    other.energy -= 20;

    if (this.energy <= 0) {
      this.die();
    }
    if (other.energy <= 0) {
      other.die();
      this.dropFood();
    }
  }

  consumeFood(food) {
    this.energy = Math.min(this.energy + FOOD_ENERGY_GAIN, 100);
    food.consume();
  }

  // Handle cell death
  die() {
    this.dropFood();
    // Remove the cell from the cells array
    const index = cells.indexOf(this);
    if (index !== -1) {
      cells.splice(index, 1);
    }
  }

  dropFood() {
    // Drop 100 food on death
    for (let i = 0; i < 5; i++) {
      foodItems.push(new Food(this.x, this.y, 20)); // Drop food at cell's position
    }
  }

  // Duplicate logic
  duplicate(cells) {
    if (this.energy >= ENERGY_TO_DUPLICATE) {
      const newCell = new Cell(this.x, this.y, this.radius, this.color, this.species, this.neuralParams);
      this.energy -= ENERGY_TO_DUPLICATE;
      cells.push(newCell);

      // Mutation chance for new species
      if (Math.random() < MUTATION_CHANCE) {
        newCell.species = `Species-${Math.random()}`;
        newCell.neuralParams = newCell.randomNeuralParams();
        newCell.color = `#${Math.floor(Math.random()*16777215).toString(16)}`; // Random color
      }
    }
  }

  // Decision-making based on vision and surroundings
  makeDecision(cells, foodItems) {
    const inputs = [];
    for (const other of cells) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < VISION_RADIUS && this.species !== other.species) {
        inputs.push(other.energy); // How much energy the other cell has
        inputs.push(other.state === 'aggressive' ? 1 : 0); // Aggressive or not
        inputs.push(distance / VISION_RADIUS); // Normalize distance
      }
    }

    for (const food of foodItems) {
      const dx = this.x - food.x;
      const dy = this.y - food.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < VISION_RADIUS) {
        inputs.push(1); // Food present
        inputs.push(distance / VISION_RADIUS); // Normalize distance
      }
    }

    // Use neural network for decision-making
    const action = this.neuralNetwork(inputs);

    if (action > 0.5) {
      this.state = 'aggressive'; // If action > 0.5, become aggressive
    } else {
      this.state = 'dormant'; // Else, be dormant
    }

    // Random motion for cells in dormant state
    if (this.state === 'dormant') {
      this.xv = randomInRange(-0.5, 0.5);
      this.yv = randomInRange(-0.5, 0.5);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  recharge(deltaTime) {
    this.energy += 0.05 * deltaTime;
    if (this.energy > 100) this.energy = 100;
  }
}

class Food {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#10ff32';
    this.consumed = false;
  }

  draw() {
    if (!this.consumed) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
  }

  consume() {
    this.consumed = true;
  }
}

// Simulation and Game Loop
const cells = [];
const numCells = 100;
const cellRadius = 15;
const foodItems = [];
const numFood = 20;

for (let i = 0; i < numCells; i++) {
  const species = `Species-${i}`;
  const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Unique color for each species
  cells.push(new Cell(Math.random() * canvas.width, Math.random() * canvas.height, cellRadius, color, species, null));
}

for (let i = 0; i < numFood; i++) {
  foodItems.push(new Food(Math.random() * canvas.width, Math.random() * canvas.height, 20));
}

let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const cell of cells) {
    cell.update(deltaTime, cells, foodItems);
    cell.recharge(deltaTime);
    cell.draw();
  }

  for (const food of foodItems) {
    food.draw();
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
