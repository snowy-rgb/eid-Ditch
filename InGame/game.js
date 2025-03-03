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

// ✅ 캔버스 크기 업데이트 함수
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ✅ 전체 화면이 해제되었을 때 메시지를 띄우고 게임 화면을 숨기기
document.addEventListener("fullscreenchange", () => {
    const fullscreenPrompt = document.getElementById("fullscreenPrompt");
    
    if (!document.fullscreenElement) {
        console.log("❌ 전체 화면이 해제됨! 다시 요청 필요");
        fullscreenPrompt.style.display = "block"; // 메시지 표시
        canvas.style.display = "none"; // 게임 화면 숨기기
    } else {
        console.log("✅ 전체 화면 모드 활성화됨");
        fullscreenPrompt.style.display = "none"; // 메시지 숨기기
        canvas.style.display = "block"; // 게임 화면 다시 보이기
    }
});

// ✅ 메시지를 클릭하거나 아무 키나 누르면 다시 전체 화면 전환
document.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        requestFullScreen();
    }
});

document.addEventListener("keydown", () => {
    if (!document.fullscreenElement) {
        requestFullScreen();
    }
});

// ✅ 전체 화면 실행 함수 (다시 추가)
function requestFullScreen() {
    let element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
            console.log("✅ 전체 화면으로 복귀");
        }).catch(err => {
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


// ✅ 전체 화면 변경 감지 → 캔버스 크기 업데이트
document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        console.log("✅ 전체 화면 모드 활성화됨");
    } else {
        console.log("❌ 전체 화면 해제됨! 캔버스 크기 업데이트");
    }
    updateCanvasSize();
});

// ✅ 화면 크기 변경 감지 → 캔버스 크기 업데이트
window.addEventListener("resize", updateCanvasSize);

// ✅ 유저 입력이 감지되면 전체 화면 실행
document.addEventListener("click", requestFullScreen);
document.addEventListener("keydown", requestFullScreen);
document.addEventListener("touchstart", requestFullScreen);

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

const rainParticles = []; // 비 입자
const splashParticles = []; // 물 튀김 효과
const fogParticles = []; // 안개 효과

// 비 애니메이션 생성 (Rainy Forest에서만 실행)
function createRain() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌧 RainForest에서만 작동

    rainParticles.length = 0; // 기존 비 제거 후 새로 생성
    for (let i = 0; i < 50; i++) {
        rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 3 + 2
        });
    }
}

// 안개 애니메이션 생성 (Rainy Forest에서만 실행)
function createFog() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌫 RainForest에서만 작동

    fogParticles.length = 0; // 기존 안개 제거 후 새로 생성
    for (let i = 0; i < 30; i++) {
        fogParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            opacity: Math.random() * 0.3 + 0.2, // 안개 투명도
            speedX: Math.random() * 0.5, // 천천히 이동
        });
    }
}

// 물 튀기는 효과 생성 (Rainy Forest에서만 실행)
function createSplash(x, y) {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌧 RainForest에서만 작동

    for (let i = 0; i < 5; i++) {
        splashParticles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 2, // 랜덤한 좌우 방향
            velocityY: Math.random() * -2, // 위로 튀는 힘
            alpha: 1 // 점점 사라지게 만들기
        });
    }
}

// 비 업데이트 (Rainy Forest에서만 실행)
function updateRain() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌧 RainForest에서만 작동

    rainParticles.forEach((particle, index) => {
        particle.y += particle.speed;

        // 바닥과 충돌하면 물방울 생성
        if (particle.y >= ground.y) {
            createSplash(particle.x, ground.y);
            rainParticles.splice(index, 1); // 원래 비는 제거
            rainParticles.push({ x: Math.random() * canvas.width, y: 0, speed: Math.random() * 3 + 2 });
        }
    });
}

// 안개 업데이트 (Rainy Forest에서만 실행)
function updateFog() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌫 RainForest에서만 작동

    fogParticles.forEach((particle) => {
        particle.x += particle.speedX;
        if (particle.x > canvas.width) {
            particle.x = -50; // 안개가 화면 끝에 닿으면 다시 왼쪽에서 등장
        }
    });
}

// 물 튀기는 효과 업데이트 (Rainy Forest에서만 실행)
function updateSplash() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌧 RainForest에서만 작동

    splashParticles.forEach((particle, index) => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityY += 0.1; // 중력 적용
        particle.alpha -= 0.05; // 점점 사라짐

        if (particle.alpha <= 0) {
            splashParticles.splice(index, 1); // 완전히 사라지면 제거
        }
    });
}

// 비 & 물 튀기는 효과 그리기 (Rainy Forest에서만 실행)
function drawRain() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌧 RainForest에서만 작동

    ctx.fillStyle = "blue";
    rainParticles.forEach(particle => {
        ctx.fillRect(particle.x, particle.y, 2, 10);
    });
}

// 물 튀기는 효과 그리기 (Rainy Forest에서만 실행)
function drawSplash() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌧 RainForest에서만 작동

    ctx.fillStyle = "rgba(173, 216, 230, 0.7)"; // 연한 파란색
    splashParticles.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1; // 원래대로 돌려놓기
}

// 안개 효과 그리기 (Rainy Forest에서만 실행)
function drawFog() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌫 RainForest에서만 작동

    ctx.fillStyle = "rgba(200, 200, 200, 0.2)";
    fogParticles.forEach(particle => {
        ctx.globalAlpha = particle.opacity;
        ctx.fillRect(particle.x, particle.y, 100, 50); // 안개 크기
    });
    ctx.globalAlpha = 1;
}

// 기존 게임 루프에 추가
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateRain(); // 🌧 RainForest에서만 실행
    updateFog(); // 🌫 RainForest에서만 실행
    updateSplash(); // 🌧 RainForest에서만 실행
    
    drawBackground();
    drawGround();
    drawRain(); // 🌧 RainForest에서만 실행
    drawSplash(); // 🌧 RainForest에서만 실행
    drawFog(); // 🌫 RainForest에서만 실행

    requestAnimationFrame(gameLoop);
}

// 게임 시작 시 초기 환경 설정
function initializeEnvironment() {
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        createRain();
        createFog();
    }
}

// 게임 시작
initializeEnvironment();
gameLoop();



