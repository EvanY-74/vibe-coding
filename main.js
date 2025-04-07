const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hexSize = 30;
const cols = 10;
const rows = 10;
const hexWidth = Math.sqrt(3) * hexSize;
const hexHeight = 2 * hexSize;

const directions = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

let snake = [{ x: 5, y: 5 }];
let food = { x: 3, y: 3 };
let direction = directions.RIGHT;
let gameInterval;

function hexToPixel(x, y) {
    const px = hexWidth * (x + 0.5 * (y % 2));
    const py = hexHeight * y;
    return { x: px, y: py };
}

function drawHexagon(x, y) {
    const { x: px, y: py } = hexToPixel(x, y);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const xCoord = px + hexSize * Math.cos(angle);
        const yCoord = py + hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(xCoord, yCoord);
        else ctx.lineTo(xCoord, yCoord);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawSnake() {
    snake.forEach(segment => {
        const { x, y } = hexToPixel(segment.x, segment.y);
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(x, y, hexSize / 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawFood() {
    const { x, y } = hexToPixel(food.x, food.y);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, hexSize / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function update() {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (head.x === food.x && head.y === food.y) {
        snake.unshift(head);
        food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } else {
        snake.unshift(head);
        snake.pop();
    }

    if (checkCollision()) {
        clearInterval(gameInterval);
        alert('Game Over!');
    }

    drawGame();
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return true;
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            drawHexagon(x, y);
        }
    }
    drawSnake();
    drawFood();
}

function changeDirection(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== directions.DOWN) direction = directions.UP;
            break;
        case 'ArrowDown':
            if (direction !== directions.UP) direction = directions.DOWN;
            break;
        case 'ArrowLeft':
            if (direction !== directions.RIGHT) direction = directions.LEFT;
            break;
        case 'ArrowRight':
            if (direction !== directions.LEFT) direction = directions.RIGHT;
            break;
    }
}

document.addEventListener('keydown', changeDirection);

function startGame() {
    gameInterval = setInterval(update, 100);
}

startGame();
