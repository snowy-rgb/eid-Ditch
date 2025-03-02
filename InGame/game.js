// 캔버스 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기 설정
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 플레이어 속성
const player = {
    x: 100,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    speed: 5,
    velocityY: 0,
    gravity: 0.5,
    jumpPower: -10,
    onGround: false
};

// 키 입력 상태 저장
const keys = {
    left: false,
    right: false,
    jump: false
};

// 키 입력 감지
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a") keys.left = true;
    if (event.key === "ArrowRight" || event.key === "d") keys.right = true;
    if ((event.key === "ArrowUp" || event.key === "w" || event.key === " ") && player.onGround) {
        keys.jump = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a") keys.left = false;
    if (event.key === "ArrowRight" || event.key === "d") keys.right = false;
    if (event.key === "ArrowUp" || event.key === "w" || event.key === " ") keys.jump = false;
});

// 플레이어 이동 함수
function movePlayer() {
    // 좌우 이동
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;

    // 점프
    if (keys.jump) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
        keys.jump = false;
    }

    // 중력 적용
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // 바닥 충돌 감지
    if (player.y + player.height >= canvas.height - 50) {
        player.y = canvas.height - player.height - 50;
        player.velocityY = 0;
        player.onGround = true;
    }
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 이동 적용
    movePlayer();

    // 플레이어 그리기
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();


