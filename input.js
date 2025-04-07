function setupInput(players) {
    window.addEventListener('keydown', e => {
        for (const p of players) {
            if (Object.values(p.keys).includes(e.code)) {
                p.input[e.code] = true;
            }
        }
    });

    window.addEventListener('keyup', e => {
        for (const p of players) {
            if (Object.values(p.keys).includes(e.code)) {
                p.input[e.code] = false;
            }
        }
    });
}
