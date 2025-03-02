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

// 카메라 설정
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// 시드 기반 청크 데이터
const chunkSeeds = {
    1: {
        environment: "Rainy Forest",
        platforms: [{ x: 200, y: 400, width: 150, height: 20 }],
        obstacles: [{ x: 400, y: 450, width: 50, height: 50 }]
    },
    2: {
        environment: "Snowy Hill",
        platforms: [{ x: 100, y: 350, width: 200, height: 20 }],
        obstacles: [{ x: 300, y: 420, width: 50, height: 50 }]
    }
};

const rainParticles = [];
const snowParticles = [];

// 비 애니메이션 생성
function createRain() {
    for (let i = 0; i < 50; i++) {
        rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 3 + 2
        });
    }
}

// 눈 애니메이션 생성
function createSnow() {
    for (let i = 0; i < 50; i++) {
        snowParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 3 + 2
        });
    }
}

// 비 & 눈 업데이트
function updateParticles() {
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        rainParticles.forEach(particle => {
            particle.y += particle.speed;
            if (particle.y > canvas.height) {
                particle.y = 0;
                particle.x = Math.random() * canvas.width;
            }
        });
    } else if (chunkSeeds[currentSeed].environment === "Snowy Hill") {
        snowParticles.forEach(particle => {
            particle.y += particle.speed;
            if (particle.y > canvas.height) {
                particle.y = 0;
                particle.x = Math.random() * canvas.width;
            }
        });
    }
}

// 비 & 눈 그리기
function drawParticles() {
    ctx.fillStyle = "blue";
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        rainParticles.forEach(particle => {
            ctx.fillRect(particle.x, particle.y, 2, 10);
        });
    }

    ctx.fillStyle = "white";
    if (chunkSeeds[currentSeed].environment === "Snowy Hill") {
        snowParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}


// 현재 청크의 시드 값
let currentSeed = 1;


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

    // 플랫폼 충돌 감지
    chunkSeeds[currentSeed].platforms.forEach(platform => {
        if (
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + 10 &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        }
    });

    // 장애물 충돌 감지
    chunkSeeds[currentSeed].obstacles.forEach(obstacle => {
        if (
            player.x + player.width > obstacle.x &&
            player.x < obstacle.x + obstacle.width &&
            player.y + player.height > obstacle.y &&
            player.y < obstacle.y + obstacle.height
        ) {
            player.x -= player.speed * (keys.right ? 1 : -1); // 장애물 충돌 시 이동 차단
        }
    });
}

// 카메라 업데이트 함수 (플레이어를 따라가기)
function updateCamera() {
    camera.x += (player.x - camera.x - canvas.width / 2) * 0.1;
    camera.y += (player.y - camera.y - canvas.height / 2) * 0.1;
}

// 청크 내 오브젝트(플랫폼 & 장애물) 그리기
function drawChunkObjects() {
    chunkSeeds[currentSeed].platforms.forEach(platform => {
        ctx.fillStyle = "blue";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    chunkSeeds[currentSeed].obstacles.forEach(obstacle => {
        ctx.fillStyle = "red";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 이동 적용
    movePlayer();

    // 카메라 업데이트
    updateCamera();

    // 자연 환경 업데이트 (비 & 눈)
    updateParticles(); 

    // 캔버스를 기준으로 좌표 이동
    ctx.save();
    ctx.translate(-camera.x, -camera.y); // 카메라 위치 보정

    // 청크 내 오브젝트 그리기
    drawChunkObjects();

    // 자연 효과(비 & 눈) 그리기
    drawParticles(); 

    // 플레이어 그리기
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore(); // 원래 상태로 복귀

    // 게임 루프 반복 (한 번만 실행)
    requestAnimationFrame(gameLoop);
}


// 게임 시작
gameLoop();



