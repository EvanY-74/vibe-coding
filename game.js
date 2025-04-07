const gravity = 0.5;
const moveSpeed = 2;
const jumpPower = -10;
const dashSpeed = 5;
const dashCooldown = 3000;

function updateGame(players, timestamp) {
    for (const p of players) {
        handleInput(p, timestamp);
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y + p.height >= canvas.height) {
            p.y = canvas.height - p.height;
            p.vy = 0;
            p.onGround = true;
        } else {
            p.onGround = false;
        }

        p.vx = 0;
    }

    handleCombat(players);
}

function handleInput(p, timestamp) {
    const { left, right, jump, block, dash, attack } = p.keys;

    if (p.input[left]) p.vx = -moveSpeed;
    if (p.input[right]) p.vx = moveSpeed;

    if (p.input[jump] && p.onGround) {
        p.vy = jumpPower;
        p.onGround = false;
    }

    p.blocking = !!p.input[block];

    const canDash = timestamp - p.lastDash > dashCooldown;
    p.isDashing = false;

    if (p.input[dash] && canDash) {
        p.lastDash = timestamp;
        p.vx = p.input[right] ? dashSpeed : p.input[left] ? -dashSpeed : 0;
        p.isDashing = true;
    }

    if (p.input[attack]) {
        p.attackPending = true;
    }
}

function handleCombat(players) {
    const [p1, p2] = players;

    for (const a of players) {
        const b = a === p1 ? p2 : p1;
        if (a.attackPending) {
            a.attackPending = false;

            const inRange = Math.abs(a.x - b.x) < 60 && Math.abs(a.y - b.y) < 80;
            if (inRange && !b.blocking) {
                const dmg = a.isDashing ? 15 : 10;
                b.health -= dmg;
            }
        }
    }
}

function drawGame(ctx, players) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of players) {
        ctx.fillStyle = 'black';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(p.x, p.y - 10, p.health, 5);
    }
}
