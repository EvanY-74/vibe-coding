const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('keydown', e => {
    if (validKeys.has(e.code)) keysDown[e.code] = true;
});

window.addEventListener('keyup', e => {
    if (validKeys.has(e.code)) keysDown[e.code] = false;
});

const players = [
    new Player(100, {
        jump: 'KeyW', left: 'KeyA', right: 'KeyD', block: 'KeyS', dash: 'ShiftLeft', attack: 'Space'
    }, 'blue'),
    new Player(canvas.width - 150, {
        jump: 'KeyI', left: 'KeyJ', right: 'KeyL', block: 'KeyK', dash: 'KeyB', attack: 'AltRight'
    }, 'green')
];

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players[0].update();
    players[1].update();
    players[0].tryAttack(players[1]);
    players[1].tryAttack(players[0]);
    requestAnimationFrame(gameLoop);
}
gameLoop();
