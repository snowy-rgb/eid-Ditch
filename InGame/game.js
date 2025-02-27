const TILE_SIZE = 40;
const ROOM_WIDTH = 20;
const ROOM_HEIGHT = 12;
const GAME_WIDTH = TILE_SIZE * ROOM_WIDTH;
const GAME_HEIGHT = TILE_SIZE * ROOM_HEIGHT;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = '100vw';
canvas.style.height = '100vh';

const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: TILE_SIZE * 0.6,
    speed: 2.5
};

const keys = { w: false, a: false, s: false, d: false };

// 🛠 **방 클래스 (출구 문제 해결 & 장애물 위치 수정)**
class Room {
    constructor(x, y, previousRoom = null) {
        this.x = x;
        this.y = y;
        this.width = ROOM_WIDTH;
        this.height = ROOM_HEIGHT;
        this.grid = this.generateRoom(previousRoom);
        this.objects = this.generateObjects(); // 장애물도 타일 단위로 생성
    }

    // 🎯 **출구가 보장되는 랜덤 방 생성**
    generateRoom(previousRoom) {
        let grid = Array.from({ length: this.height }, () =>
            Array(this.width).fill(0)
        );

        // 벽 생성 (경계선)
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (i === 0 || i === this.height - 1 || j === 0 || j === this.width - 1) {
                    grid[i][j] = 1; // 벽
                }
            }
        }

        // 출입구 좌표
        let exits = {
            top: { x: Math.floor(this.width / 2), y: 0 },
            bottom: { x: Math.floor(this.width / 2), y: this.height - 1 },
            left: { x: 0, y: Math.floor(this.height / 2) },
            right: { x: this.width - 1, y: Math.floor(this.height / 2) }
        };

        // 🔥 **최소 하나의 출구 보장**
        let exitKeys = Object.keys(exits);
        let forcedExit = exitKeys[Math.floor(Math.random() * exitKeys.length)];
        grid[exits[forcedExit].y][exits[forcedExit].x] = 2; // 출구 강제 추가

        // 🔄 **이전 방과 연결된 출구 유지**
        if (previousRoom) {
            if (previousRoom.y < this.y) grid[exits.top.y][exits.top.x] = 2;
            if (previousRoom.y > this.y) grid[exits.bottom.y][exits.bottom.x] = 2;
            if (previousRoom.x < this.x) grid[exits.left.y][exits.left.x] = 2;
            if (previousRoom.x > this.x) grid[exits.right.y][exits.right.x] = 2;
        }

        return grid;
    }

    // 🎯 **장애물 생성 (타일 단위)**
    generateObjects() {
        let objects = [];
        let numObjects = Math.floor(Math.random() * 4) + 2; // 2~5개 생성

        for (let i = 0; i < numObjects; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.width - 2)) + 1;
                y = Math.floor(Math.random() * (this.height - 2)) + 1;
            } while (this.grid[y][x] !== 0); // 바닥(0) 위에만 생성

            objects.push({ x, y, size: TILE_SIZE, type: "장애물" });
            this.grid[y][x] = 3; // 장애물은 '3'으로 표시
        }

        return objects;
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

// 🎯 **플레이어 이동 & 충돌 체크**
function movePlayer() {
    let nextX = player.x;
    let nextY = player.y;

    if (keys.w) nextY -= player.speed;
    if (keys.s) nextY += player.speed;
    if (keys.a) nextX -= player.speed;
    if (keys.d) nextX += player.speed;

    let tileX = Math.floor(nextX / TILE_SIZE);
    let tileY = Math.floor(nextY / TILE_SIZE);

    // 벽 & 장애물 충돌 방지
    if (currentRoom.grid[tileY][tileX] !== 1 && currentRoom.grid[tileY][tileX] !== 3) {
        player.x = nextX;
        player.y = nextY;
    }

    // 출입구 이동
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
        visitedRooms[roomKey] = new Room(x, y, currentRoom);
    }

    currentRoom = visitedRooms[roomKey];
    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT / 2;
}

// 🎯 **방 & 장애물 그리기**
function drawRoom() {
    for (let i = 0; i < currentRoom.height; i++) {
        for (let j = 0; j < currentRoom.width; j++) {
            let tile = currentRoom.grid[i][j];

            if (tile === 1) {
                ctx.fillStyle = "darkgray"; // 벽
            } else if (tile === 2) {
                ctx.fillStyle = "yellow"; // 출입구
            } else if (tile === 3) {
                ctx.fillStyle = "red"; // 장애물
            } else {
                ctx.fillStyle = "black"; // 바닥
            }

            ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoom();
    movePlayer();
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);
    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();

