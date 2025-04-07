const keysDown = {};
const validKeys = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space',
    'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyB', 'AltRight'
]);

window.addEventListener('keydown', e => {
    if (validKeys.has(e.code)) keysDown[e.code] = true;
});

window.addEventListener('keyup', e => {
    if (validKeys.has(e.code)) keysDown[e.code] = false;
});
