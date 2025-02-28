const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const numStars = 100; // 별 개수

// 별 클래스
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2;
        this.opacity = Math.random();
        this.speed = Math.random() * 0.5;
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    update() {
        this.opacity += this.speed * 0.02;
        if (this.opacity > 1 || this.opacity < 0.1) {
            this.speed *= -1;
        }
    }
}

// 별 초기화
for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
}

// 애니메이션 루프
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// 윈도우 크기 변경 시 캔버스 크기 조정
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

//음악및 시작 인터페이스
document.addEventListener("DOMContentLoaded", () => {
    let openingScreen = document.getElementById("openingScreen");
    let creatorText = document.getElementById("creatorText");
    let gameTitle = document.getElementById("gameTitle");
    let introText = document.getElementById("introText");
    let startPrompt = document.getElementById("startPrompt");
    let bgm = document.getElementById("bgm");

    const prologueTexts = [
        "깨어날 수 없는 꿈...",
        "당신은 어디에 있는가?",
        "이 곳은 현실인가, 허상인가?"
    ];

    let currentIndex = 0;

    function showIntroText() {
        if (currentIndex < prologueTexts.length) {
            introText.innerText = prologueTexts[currentIndex];
            introText.style.opacity = "1";
            currentIndex++;
            setTimeout(() => {
                introText.style.opacity = "0";
                setTimeout(showIntroText, 2000);
            }, 2000);
        } else {
            setTimeout(() => {
                startPrompt.style.opacity = "1"; // "아무 키를 누르세요" 표시
            }, 2000);
        }
    }

    // 순차적으로 텍스트 등장
    setTimeout(() => creatorText.style.opacity = "1", 1000);
    setTimeout(() => creatorText.style.opacity = "0", 3000);
    setTimeout(() => gameTitle.style.opacity = "1", 4000);
    setTimeout(() => gameTitle.style.opacity = "0", 6000);
    setTimeout(() => showIntroText(), 7000);

    function startGame() {
        // 🔥 배경음이 정상적으로 실행되도록 설정
        bgm.muted = false; // 음소거 해제
        bgm.volume = 1.0; // 볼륨 100%
        
        bgm.play().then(() => {
            console.log("🎵 배경음 재생 성공!");
        }).catch(error => {
            console.log("🔇 자동 재생 실패:", error);
        });

        // 🔥 인트로 화면 서서히 사라지기
        openingScreen.style.transition = "opacity 1.5s ease-in-out";
        openingScreen.style.opacity = "0";
        setTimeout(() => {
            openingScreen.style.display = "none";
        }, 1500);

        document.removeEventListener("click", startGame);
        document.removeEventListener("keydown", startGame);
        document.removeEventListener("touchstart", startGame);
        document.removeEventListener("touchend", startGame);
    }

    // 🔥 모든 사용자 입력을 감지 (클릭, 키 입력, 터치)
    document.addEventListener("click", startGame, { once: true });
    document.addEventListener("keydown", startGame, { once: true });
    document.addEventListener("touchstart", startGame, { once: true });
    document.addEventListener("touchend", startGame, { once: true }); // ✅ 모바일 터치 대응 추가
});



