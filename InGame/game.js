// 캔버스 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기 설정
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 바닥 데이터 추가
const ground = {
    x: 0,
    y: canvas.height - 30, // 기존보다 살짝 낮게 설정
    width: canvas.width * 2, // 더 넓게 설정
    height: 100 // 바닥을 두껍게 해서 화면 아래까지 확장
};

// 플레이어 속성
const player = {
    x: 100,
    y: ground.y - 50, // 땅 위에 정확히 위치
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


// 🌧 비 효과 관리 클래스
// 🌧 RainEffectManager 클래스 (비 내리는 효과 개선)
class RainEffectManager {
    constructor() {
        this.rainParticles = [];
    }

    // 비 생성
    initialize() {
        if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return;

        this.rainParticles = [];

        for (let i = 0; i < 150; i++) { // ✅ 더 많은 비 생성
            this.rainParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * 6 + 4, // ✅ 비가 더 빠르게 내리도록 설정 (기존 3 + 2 → 6 + 4)
                opacity: Math.random() * 0.5 + 0.3, // ✅ 반투명 효과 적용 (0.3 ~ 0.8)
                length: Math.random() * 15 + 10 // ✅ 빗방울 길이 추가 (10 ~ 25px)
            });
        }
    }

    // 비 업데이트
    update() {
        if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return;

        this.rainParticles.forEach((particle) => {
            particle.y += particle.speed;

            // 바닥에 도달하면 다시 위로
            if (particle.y >= ground.y) {
                particle.y = 0;
                particle.x = Math.random() * canvas.width;
            }
        });
    }

    // 비 그리기
    draw() {
        if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"; // ✅ 흰색 비 (투명도 추가)
        ctx.lineWidth = 2;

        this.rainParticles.forEach(particle => {
            ctx.globalAlpha = particle.opacity;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x, particle.y + particle.length); // ✅ 비 길이 반영
            ctx.stroke();
        });

        ctx.globalAlpha = 1; // 투명도 초기화
        
    }

// ✅ RainEffectManager 인스턴스 생성
const rainEffect = new RainEffectManager();

// ✅ 환경 초기화 (Rainy Forest에서만 비 생성)
function initializeEnvironment() {
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        rainEffect.initialize(); // 🌧 비 & 안개 초기화
    }
}

// ✅ 게임 루프에서 반영
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    updateCamera();

    drawBackground();
    drawGround();

    rainEffect.update(); // 🌧 비 업데이트
    rainEffect.draw();   // 🌧 비 그리기

    requestAnimationFrame(gameLoop);
}
    // 물 튀기는 효과 추가
    createSplash(x, y) {
        if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return;

        for (let i = 0; i < 5; i++) {
            this.splashParticles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: Math.random() * -2,
                alpha: 1
            });
        }
    }


    // 업데이트 (비, 물 튀김, 안개)
    update() {
        if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return;

        // 비 업데이트
        this.rainParticles.forEach((particle, index) => {
            particle.y += particle.speed;
            if (particle.y >= chunkSeeds[currentSeed].ground.y) {
                this.createSplash(particle.x, chunkSeeds[currentSeed].ground.y);
                this.rainParticles.splice(index, 1);
                this.rainParticles.push({ x: Math.random() * canvas.width, y: 0, speed: Math.random() * 3 + 2 });
            }
        });


        // 물 튀김 효과 업데이트
        this.splashParticles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.1;
            particle.alpha -= 0.05;
            if (particle.alpha <= 0) {
                this.splashParticles.splice(index, 1);
            }
        });
    }

    // 그리기 (비, 물 튀김, 안개)
    draw() {
        if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return;

        // 비 그리기
        ctx.fillStyle = "blue";
        this.rainParticles.forEach(particle => {
            ctx.fillRect(particle.x, particle.y, 2, 10);
        });

        // 물 튀기는 효과
        ctx.fillStyle = "rgba(173, 216, 230, 0.7)";
        this.splashParticles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

    }
}

// 🌧 RainEffectManager 인스턴스 생성
const rainEffect = new RainEffectManager();

// 배경 색상 및 이미지 설정
function drawBackground() {
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        ctx.fillStyle = "#B4D9D5"; // 어두운 숲 배경
    } else if (chunkSeeds[currentSeed].environment === "Snowy Hill") {
        ctx.fillStyle = "#d6e6f2"; // 밝은 눈 덮인 배경
    }
    ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
}


function drawVignette() {
    if (chunkSeeds[currentSeed].environment !== "Rainy Forest") return; // 🌫 RainForest에서만 실행

    let gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width / 4, // 중심부 (더 작은 크기)
        canvas.width / 2, canvas.height / 2, canvas.width // 바깥쪽
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");   // 중심부는 완전 투명
    gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.5)"); // 중간 부분은 연한 어둠
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");   // 가장자리 안개 강화

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



function initializeEnvironment() {
    let env = chunkSeeds[currentSeed].environment;

    if (env === "Rainy Forest") {
        createRain(); // 비 생성
    } else if (env === "Snowy Hill") {
        createSnow(); // 눈 생성
    }
}



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


// 기존 게임 루프에 추가
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    updateCamera();

    // 🌧 Rainy Forest에서만 비 & 안개 & 물 튀기는 효과 업데이트
    rainEffect.update();  

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    drawBackground();
    drawGround();
    
    // 🌧 Rainy Forest에서만 효과 그리기
    rainEffect.draw();  

    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore();

    drawVignette(); // 🌫 비네트 효과 추가 (RainForest에서만)

    requestAnimationFrame(gameLoop);
}


// 게임 시작 시 초기 환경 설정
function initializeEnvironment() {
    if (chunkSeeds[currentSeed].environment === "Rainy Forest") {
        rainEffect.initialize(); // ✅ 비 & 안개 초기화
    }
}

// 게임 시작
initializeEnvironment();
gameLoop();



