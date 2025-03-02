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
        ground: { x: 0, y: canvas.height - 50, width: canvas.width * 2, height: 50 }, // 바닥 추가
        platforms: [{ x: 200, y: 400, width: 150, height: 20 }],
        obstacles: [{ x: 400, y: 450, width: 50, height: 50 }]
    },
    2: {
        environment: "Snowy Hill",
        ground: { x: 0, y: canvas.height - 50, width: canvas.width * 2, height: 50 }, // 바닥 추가
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

// 배경 색상 및 이미지 설정
function drawBackground() {
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        ctx.fillStyle = "#1d1f2a"; // 어두운 숲 배경
    } else if (chunkSeeds[currentSeed].environment === "Snowy Hill") {
        ctx.fillStyle = "#d6e6f2"; // 밝은 눈 덮인 배경
    }
    ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
}

function initializeEnvironment() {
    let env = chunkSeeds[currentSeed].environment;

    if (env === "Rainy Forest") {
        createRain(); // 비 생성
    } else if (env === "Snowy Hill") {
        createSnow(); // 눈 생성
    }
}

// 바닥 데이터 추가
const ground = {
    x: 0,
    y: canvas.height - 50,
    width: canvas.width * 2, // 넓게 설정
    height: 50
};

// 바닥 그리기 함수
function drawGround() {
    const ground = chunkSeeds[currentSeed].ground; // 현재 청크의 바닥 정보 가져오기
    if (!ground) return; // 바닥이 없으면 그리지 않음

    ctx.fillStyle = "#3d3d3d"; // 바닥 색상 (짙은 회색)
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
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
        // 바닥 충돌 감지
        if (player.y + player.height > chunkSeeds[currentSeed].ground.y) {
            player.y = chunkSeeds[currentSeed].ground.y - player.height; // 바닥 위에 고정
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
    ctx.fillStyle = "blue"; // 플랫폼 색상
    chunkSeeds[currentSeed].platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    ctx.fillStyle = "red"; // 장애물 색상
    chunkSeeds[currentSeed].obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// 전체 화면 모드 활성화
function enterFullScreen() {
    let element = document.getElementById("gameCanvas"); // 캔버스를 전체 화면으로 변경
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}



// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    updateCamera();
    updateParticles(); // 자연 효과 업데이트

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    drawBackground(); // 배경 먼저 그리기
    drawGround(); // 청크 기반 바닥 추가
    drawChunkObjects(); // 플랫폼 & 장애물
    drawParticles(); // 비 & 눈 추가

    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore();

    requestAnimationFrame(gameLoop);
}


document.addEventListener("DOMContentLoaded", () => {
    // 세션 스토리지에서 "fullscreen" 값을 확인
    let shouldGoFullscreen = sessionStorage.getItem("fullscreen");
    if (shouldGoFullscreen === "true") {
        sessionStorage.removeItem("fullscreen"); // 전체화면 모드 실행 후 값 제거
        requestFullScreen();
    }
});

// 전체 화면 실행 함수
function requestFullScreen() {
    let element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.log(`❌ 전체 화면 활성화 실패: ${err.message}`);
        });
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// 전체 화면 해제 감지 → 다시 실행
document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        console.log("❌ 전체 화면이 해제됨! 다시 실행 대기 중...");
    }
});

// 종료 창 표시 여부
let isExitPromptVisible = false;

// 종료 확인 창 표시
function showExitPrompt() {
    const exitPrompt = document.getElementById("exitPrompt");
    if (exitPrompt) {
        exitPrompt.style.display = "block";
        isExitPromptVisible = true;
    }
}

// 종료 확인 창 숨기기
function hideExitPrompt() {
    const exitPrompt = document.getElementById("exitPrompt");
    if (exitPrompt) {
        exitPrompt.style.display = "none";
        isExitPromptVisible = false;
    }
}

// 전체 화면 실행 함수
function requestFullScreen() {
    let element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.log(`❌ 전체 화면 활성화 실패: ${err.message}`);
        });
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// ESC 키 기본 동작 차단 & 종료 창 띄우기
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault(); // 🔥 ESC 기본 동작 차단 (전체 화면 해제 방지)

        if (!isExitPromptVisible) {
            showExitPrompt(); // 종료 창 표시
        } else {
            hideExitPrompt(); // 종료 창 숨기기
        }
    }
});

// ENTER 키로 게임 종료, ESC로 계속 진행
document.addEventListener("keydown", (event) => {
    if (isExitPromptVisible) {
        if (event.key === "Enter") {
            window.location.href = "index.html"; // 메인 화면으로 이동
        } else if (event.key === "Escape") {
            hideExitPrompt(); // ESC로 창 닫기
        }
    }
});

// 전체 화면이 해제되면 다시 실행
document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        console.log("❌ 전체 화면이 해제됨! 다시 실행!");
        requestFullScreen(); // 🔥 다시 전체 화면 실행
    }
});

// 유저 입력이 감지되면 전체 화면 실행
document.addEventListener("click", requestFullScreen);
document.addEventListener("keydown", requestFullScreen);
document.addEventListener("touchstart", requestFullScreen);






// 게임 시작
gameLoop();



