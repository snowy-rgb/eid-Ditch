const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 고정된 비율 설정 (16:9)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// 플레이어 정보 (속도를 느리게 조정)
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: 20,
    speed: 3 // 기존 5 → 3으로 느리게 조정
};

// 키 입력 저장
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// 방 데이터 구조
class Room {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        this.objects = this.generateObjects();
    }

    // 랜덤 오브젝트 생성
    generateObjects() {
        let objects = [];
        const numObjects = Math.floor(Math.random() * 4) + 1; // 1~4개 생성

        for (let i = 0; i < numObjects; i++) {
            objects.push({
                x: Math.random() * (this.width - 30),
                y: Math.random() * (this.height - 30),
                size: 15,
                type: Math.random() > 0.8 ? "이드" : "장애물"
            });
        }

        return objects;
    }
}

// 현재 방 설정
let currentRoom = new Room(0, 0);
const visitedRooms = { "0,0": currentRoom };

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

// 플레이어 이동 로직 & 방 이동 체크
function movePlayer() {
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    // 방 이동 체크 (화면 경계 넘어가면 이동)
    if (player.x < 0) {
        player.x = GAME_WIDTH - player.size;
        moveToRoom(currentRoom.x - 1, currentRoom.y);
    } else if (player.x + player.size > GAME_WIDTH) {
        player.x = 0;
        moveToRoom(currentRoom.x + 1, currentRoom.y);
    }

    if (player.y < 0) {
        player.y = GAME_HEIGHT - player.size;
        moveToRoom(currentRoom.x, currentRoom.y - 1);
    } else if (player.y + player.size > GAME_HEIGHT) {
        player.y = 0;
        moveToRoom(currentRoom.x, currentRoom.y + 1);
    }
}

// 방 이동 함수
function moveToRoom(x, y) {
    const roomKey = `${x},${y}`;

    if (!visitedRooms[roomKey]) {
        visitedRooms[roomKey] = new Room(x, y);
    }

    currentRoom = visitedRooms[roomKey];
}

// 조명 효과
function drawLighting() {
    const gradient = ctx.createRadialGradient(
        player.x + player.size / 2, player.y + player.size / 2, 20,
        player.x + player.size / 2, player.y + player.size / 2, 150
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 방 배경 (어두운 느낌)
    ctx.fillStyle = "rgba(20, 20, 20, 1)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 랜덤 오브젝트 그리기
    currentRoom.objects.forEach(obj => {
        ctx.fillStyle = obj.type === "이드" ? "red" : "gray";
        ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
    });

    // 플레이어 이동
    movePlayer();

    // 플레이어 그리기
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // 조명 효과 적용
    drawLighting();

    requestAnimationFrame(gameLoop);
}

// 화면 크기 변경 시 비율 유지
window.addEventListener("resize", () => {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
});

// 게임 시작
gameLoop();
