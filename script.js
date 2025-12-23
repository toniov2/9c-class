let currentGame = 'runner'; // Текущая выбранная игра
let isGameRunning = false;
let animationId;
let score = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreSpan = document.getElementById('finalScore');

// --- НАВИГАЦИЯ ---
function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active-section'));
    document.getElementById(id).classList.add('active-section');
    document.querySelectorAll('.nav-buttons .glass-btn').forEach(b => b.classList.remove('active-btn'));
    btn.classList.add('active-btn');
    stopCurrentGame();
}

function switchGame(type) {
    currentGame = type;
    resetCurrentGame();
}

function stopCurrentGame() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.add('hidden');
}

function resetCurrentGame() {
    stopCurrentGame();
    if (currentGame === 'runner') initRunner();
    else if (currentGame === 'snake') initSnake();
}

// --- ИГРА 1: РАННЕР (Побег от двоек) ---
let player, obstacles, gameSpeed;

function initRunner() {
    isGameRunning = true; score = 0; gameSpeed = 6; obstacles = [];
    player = { x: 50, y: 360, w: 40, h: 40, dy: 0, jump: -15, g: 0.8, ground: false };
    animateRunner();
}

function animateRunner() {
    if (!isGameRunning) return;
    animationId = requestAnimationFrame(animateRunner);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Физика игрока
    player.dy += player.g; player.y += player.dy;
    if (player.y + player.h > canvas.height) { player.y = canvas.height - player.h; player.ground = true; player.dy = 0; }

    ctx.shadowBlur = 15; ctx.shadowColor = "#00f2fe"; ctx.fillStyle = "#00f2fe";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    if (Math.random() < 0.02 && (obstacles.length === 0 || canvas.width - obstacles[obstacles.length-1].x > 300)) {
        obstacles.push({ x: canvas.width, y: canvas.height - 40, w: 30, h: 40 });
    }

    obstacles.forEach((obs, i) => {
        obs.x -= gameSpeed;
        ctx.fillStyle = "#ff4757"; ctx.shadowColor = "#ff4757";
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        if (player.x < obs.x + obs.w && player.x + player.w > obs.x && player.y < obs.y + obs.h && player.y + player.h > obs.y) endGame();
        if (obs.x + obs.w < 0) { obstacles.splice(i, 1); score++; gameSpeed += 0.1; }
    });
    drawScore();
}

// --- ИГРА 2: СЛОЖНАЯ ЗМЕЙКА ---
let snake, food, direction, nextDir;

function initSnake() {
    isGameRunning = true; score = 0; direction = 'RIGHT'; nextDir = 'RIGHT';
    snake = [{x: 200, y: 200}, {x: 180, y: 200}, {x: 160, y: 200}];
    spawnFood();
    animateSnake();
}

function spawnFood() {
    food = { x: Math.floor(Math.random() * 39) * 20, y: Math.floor(Math.random() * 19) * 20 };
}

let lastTime = 0;
function animateSnake(time) {
    if (!isGameRunning) return;
    animationId = requestAnimationFrame(animateSnake);
    if (time - lastTime < 100) return; // Ограничение скорости змейки
    lastTime = time;

    direction = nextDir;
    let head = { ...snake[0] };
    if (direction === 'UP') head.y -= 20;
    if (direction === 'DOWN') head.y += 20;
    if (direction === 'LEFT') head.x -= 20;
    if (direction === 'RIGHT') head.x += 20;

    // Столкновения
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame(); return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; spawnFood(); } else { snake.pop(); }

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 10; ctx.shadowColor = "#2ed573"; ctx.fillStyle = "#2ed573";
    snake.forEach(s => ctx.fillRect(s.x, s.y, 18, 18));
    ctx.fillStyle = "#ffa502"; ctx.shadowColor = "#ffa502";
    ctx.fillRect(food.x, food.y, 18, 18);
    drawScore();
}

// УПРАВЛЕНИЕ
window.addEventListener('keydown', e => {
    if (currentGame === 'runner' && e.code === 'Space') jump();
    if (currentGame === 'snake') {
        if (e.code === 'ArrowUp' && direction !== 'DOWN') nextDir = 'UP';
        if (e.code === 'ArrowDown' && direction !== 'UP') nextDir = 'DOWN';
        if (e.code === 'ArrowLeft' && direction !== 'RIGHT') nextDir = 'LEFT';
        if (e.code === 'ArrowRight' && direction !== 'LEFT') nextDir = 'RIGHT';
    }
});
canvas.addEventListener('touchstart', jump); // Для мобилок

function jump() { if (currentGame === 'runner' && player.ground) { player.dy = player.jump; player.ground = false; } }

function drawScore() {
    ctx.shadowBlur = 0; ctx.fillStyle = "white"; ctx.font = "20px Poppins";
    ctx.fillText("Счет: " + score, 20, 30);
}

function endGame() {
    isGameRunning = false;
    finalScoreSpan.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// Запуск по умолчанию
initRunner();
