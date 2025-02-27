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

//음악
document.addEventListener("DOMContentLoaded", () => {
    let startScreen = document.getElementById("startScreen");
    let bgm = document.getElementById("bgm");

    function startGame() {
        // 🔥 BGM 재생
        bgm.play().then(() => {
            console.log("🎵 배경음 재생 성공!");
        }).catch(error => {
            console.log("🔇 자동 재생 실패:", error);
        });

        // 🔥 시작 화면 서서히 사라지기
        startScreen.style.opacity = "0";
        setTimeout(() => {
            startScreen.style.display = "none";
        }, 1000); // 1초 후 완전히 제거

        // 더 이상 이벤트가 실행되지 않도록 리스너 제거
        document.removeEventListener("click", startGame);
        document.removeEventListener("keydown", startGame);
    }

    // 🔥 사용자 입력 감지 (클릭, 키 입력 시 실행)
    document.addEventListener("click", startGame);
    document.addEventListener("keydown", startGame);
});

