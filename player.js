function createPlayers(players) {
    players.push(createPlayer(100, 300, {
        left: 'A', right: 'D', jump: 'W', block: 'S', dash: 'ShiftLeft', attack: 'Space'
    }));
    players.push(createPlayer(600, 300, {
        left: 'J', right: 'L', jump: 'I', block: 'K', dash: 'KeyB', attack: 'AltLeft'
    }));
}

function createPlayer(x, y, keys) {
    return {
        x, y,
        vx: 0, vy: 0,
        width: 50, height: 80,
        keys,
        onGround: false,
        health: 100,
        blocking: false,
        lastDash: 0,
        isDashing: false,
        input: {}
    };
}
