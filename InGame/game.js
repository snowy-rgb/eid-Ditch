const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 고정된 비율 설정 (16:9)
const TILE_SIZE = 40;
const ROOM_WIDTH = 20;
const ROOM_HEIGHT = 12;
const GAME_WIDTH = TILE_SIZE * ROOM_WIDTH;
const GAME_HEIGHT = TILE_SIZE * ROOM_HEIGHT;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// 플레이어 정보 (속도 조정)
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: TILE_SIZE * 0.6,
    speed: 2.5 // 기존 3 → 2.5로 더 부드럽게 조정
};

// 키 입력 저장
const keys = { w: false, a: false, s: false, d: false };

// 방 데이터 구조
class Room {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = ROOM_WIDTH;
        this.height = ROOM_HEIGHT;
        this.grid = this.generateRoom();
    }

    // 랜덤 방 생성 (벽, 바닥, 출입구 포함)
    generateRoom() {
        let grid = [];

        for (let i = 0; i < this.height; i++) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                if (i === 0 || i === this.height - 1 || j === 0 || j === this.width - 1) {
                    row.push(1); // 벽(1)
                } else {
                    row.push(Math.random() < 0.1 ? 1 : 0); // 바닥(0) + 랜덤 벽 생성
                }
            }
            grid.push(row);
        }

        // 출입구 추가 (랜덤한 위치)
        let exits = [
            { x: Math.floor(this.width / 2), y: 0 }, // 위쪽
            { x: Math.floor(this.width / 2), y: this.height - 1 }, // 아래쪽
            { x: 0, y: Math.floor(this.height / 2) }, // 왼쪽
            { x: this.width - 1, y: Math.floor(this.height / 2) } // 오른쪽
        ];

        exits.forEach(exit => {
            if (Math.random() < 0.7) grid[exit.y][exit.x] = 2; // 출입구(2)
        });

        return grid;
    }
}

// 현재 방 설정
let currentRoom = new Room(0, 0);
const visitedRooms = { "0,0": currentRoom };

// 키 입력 감지
window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// 플레이어 이동 & 충돌 체크
function movePlayer() {
    let nextX = player.x;
    let nextY = player.y;

    if (keys.w) nextY -= player.speed;
    if (keys.s) nextY += player.speed;
    if (keys.a) nextX -= player.speed;
    if (keys.d) nextX += player.speed;

    // 타일 좌표 변환
    let tileX = Math.floor(nextX / TILE_SIZE);
    let tileY = Math.floor(nextY / TILE_SIZE);

    // 벽 충돌 검사
    if (currentRoom.grid[tileY][tileX] !== 1) {
        player.x = nextX;
        player.y = nextY;
    }

    // 출입구를 통해 새로운 방으로 이동
    if (currentRoom.grid[tileY][tileX] === 2) {
        if (tileY === 0) moveToRoom(currentRoom.x, currentRoom.y - 1);
        if (tileY === ROOM_HEIGHT - 1) moveToRoom(currentRoom.x, currentRoom.y + 1);
        if (tileX === 0) moveToRoom(currentRoom.x - 1, currentRoom.y);
        if (tileX === ROOM_WIDTH - 1) moveToRoom(currentRoom.x + 1, currentRoom.y);
    }
}

// 방 이동 함수
function moveToRoom(x, y) {
    const roomKey = `${x},${y}`;

    if (!visitedRooms[roomKey]) {
        visitedRooms[roomKey] = new Room(x, y);
    }

    currentRoom = visitedRooms[roomKey];

    // 플레이어를 새로운 방의 출입구 근처로 이동
    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT / 2;
}

// 방을 그리는 함수
function drawRoom() {
    for (let i = 0; i < currentRoom.height; i++) {
        for (let j = 0; j < currentRoom.width; j++) {
            let tile = currentRoom.grid[i][j];

            if (tile === 1) {
                ctx.fillStyle = "darkgray"; // 벽
            } else if (tile === 2) {
                ctx.fillStyle = "yellow"; // 출입구
            } else {
                ctx.fillStyle = "black"; // 바닥
            }

            ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// 조명 효과
function drawLighting() {
    const gradient = ctx.createRadialGradient(
        player.x + player.size / 2, player.y + player.size / 2, 50,
        player.x + player.size / 2, player.y + player.size / 2, 200
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 방 그리기
    drawRoom();

    // 플레이어 이동
    movePlayer();

    // 플레이어 그리기
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // 조명 효과
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
