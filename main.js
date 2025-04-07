const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const players = [];
players.push(createPlayer(100, 300, {
    left: 'KeyA',
    right: 'KeyD',
    jump: 'KeyW',
    block: 'KeyS',
    dash: 'ShiftLeft',
    attack: 'Space'
}));

players.push(createPlayer(600, 300, {
    left: 'KeyJ',
    right: 'KeyL',
    jump: 'KeyI',
    block: 'KeyK',
    dash: 'KeyB',
    attack: 'AltLeft'
}));


createPlayers(players);
setupInput(players);

function gameLoop(timestamp) {
    updateGame(players, timestamp);
    drawGame(ctx, players);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
