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
        this.attackCooldown = 0;
        this.keys = keys;
    }

    draw() {
        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, 25, 50, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.health / 100 * this.width, 5);

        // Block indicator
        if (this.blocking) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }

        // Attack indicator
        if (this.attacking) {
            ctx.fillStyle = 'orange';
            const attackX = this.x < canvas.width / 2 ? this.x + this.width : this.x - 20;
            ctx.fillRect(attackX, this.y + 20, 20, 20);
        }
    }

    update() {
        const speed = 3;
        const now = performance.now();

        // Movement
        if (keysDown[this.keys.left]) this.vx = -speed;
        else if (keysDown[this.keys.right]) this.vx = speed;
        else this.vx = 0;

        // Jump
        if (keysDown[this.keys.jump] && this.onGround) {
            this.vy = -12;
            this.onGround = false;
        }

        // Blocking and attacking logic
        const isBlocking = !!keysDown[this.keys.block];
        const isAttacking = !!keysDown[this.keys.attack] && this.attackCooldown <= 0;

        if (isBlocking) {
            this.blocking = true;
            this.attacking = false;
        } else if (isAttacking) {
            this.attacking = true;
            this.blocking = false;
            this.attackCooldown = 1000;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 16;
            if (this.attackCooldown < 750) this.attacking = false; // Attack lasts 250ms
        }

        // Dashing
        if (keysDown[this.keys.dash] && now - this.lastDash > 3000) {
            this.vx = (this.vx >= 0 ? 1 : -1) * speed * 4;
            this.dashing = true;
            this.lastDash = now;
        } else {
            this.dashing = false;
        }

        // Physics
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.6;

        // Ground check
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
