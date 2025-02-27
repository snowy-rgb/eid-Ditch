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

// 방 데이터 구조
class Room {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = canvas.width;
        this.height = canvas.height;
        this.exits = {}; // 방의 출입구 (위, 아래, 왼쪽, 오른쪽)
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
    let prevX = player.x;
    let prevY = player.y;

    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    // 화면 밖으로 나갔을 때 방 이동 처리
    if (player.x < 0) {
        player.x = canvas.width - player.size;
        moveToRoom(currentRoom.x - 1, currentRoom.y);
    } else if (player.x + player.size > canvas.width) {
        player.x = 0;
        moveToRoom(currentRoom.x + 1, currentRoom.y);
    }

    if (player.y < 0) {
        player.y = canvas.height - player.size;
        moveToRoom(currentRoom.x, currentRoom.y - 1);
    } else if (player.y + player.size > canvas.height) {
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

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 이동
    movePlayer();

    // 플레이어 그리기
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // 방 표시
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
