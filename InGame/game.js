const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 플레이어 정보
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 5
};

// 키 입력 저장
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// 키 입력 감지
window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// 플레이어 이동 로직
function movePlayer() {
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    // 화면 밖으로 나가지 않게 제한
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 이동
    movePlayer();

    // 플레이어 그리기
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
