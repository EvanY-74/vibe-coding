const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keysDown = {};

class Player {
    constructor(x, keys, color) {
        this.x = x;
        this.y = canvas.height - 150;
        this.vx = 0;
        this.vy = 0;
        this.width = 50;
        this.height = 100;
        this.color = color;
        this.health = 100;
        this.blocking = false;
        this.attacking = false;
        this.dashing = false;
        this.onGround = true;
        this.lastDash = 0;
        this.keys = keys;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.health / 100 * this.width, 5);
    }

    update() {
        const speed = 3;
        if (keysDown[this.keys.left]) this.vx = -speed;
        else if (keysDown[this.keys.right]) this.vx = speed;
        else this.vx = 0;

        if (keysDown[this.keys.jump] && this.onGround) {
            this.vy = -12;
            this.onGround = false;
        }

        this.blocking = !!keysDown[this.keys.block];

        const now = performance.now();
        if (keysDown[this.keys.dash] && now - this.lastDash > 3000) {
            this.vx *= 4;
            this.dashing = true;
            this.lastDash = now;
        } else {
            this.dashing = false;
        }

        this.attacking = !!keysDown[this.keys.attack];

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.6;

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.vy = 0;
            this.onGround = true;
        }

        this.draw();
    }

    tryAttack(opponent) {
        if (this.attacking) {
            const dashAttack = this.dashing;
            const inRange = Math.abs(this.x - opponent.x) < 60;
            if (inRange && !opponent.blocking) {
                const dmg = dashAttack ? 15 : 10;
                opponent.health = Math.max(0, opponent.health - dmg);
            }
        }
    }
}

const players = [
    new Player(100, {
        jump: 'KeyW', left: 'KeyA', right: 'KeyD', block: 'KeyS', dash: 'ShiftLeft', attack: 'Space'
    }, 'blue'),
    new Player(canvas.width - 150, {
        jump: 'KeyI', left: 'KeyJ', right: 'KeyL', block: 'KeyK', dash: 'KeyB', attack: 'AltRight'
    }, 'green')
];

window.addEventListener('keydown', e => keysDown[e.code] = true);
window.addEventListener('keyup', e => keysDown[e.code] = false);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players[0].update();
    players[1].update();
    players[0].tryAttack(players[1]);
    players[1].tryAttack(players[0]);
    requestAnimationFrame(gameLoop);
}
gameLoop();
