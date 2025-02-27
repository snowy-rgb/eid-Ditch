const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 고정된 타일 크기 & 방 크기
const TILE_SIZE = 40;
const ROOM_WIDTH = 20;
const ROOM_HEIGHT = 12;
const GAME_WIDTH = TILE_SIZE * ROOM_WIDTH;
const GAME_HEIGHT = TILE_SIZE * ROOM_HEIGHT;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = '100vw';
canvas.style.height = '100vh';

// 플레이어 정보
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: TILE_SIZE * 0.6,
    speed: 2.5
};

// 키 입력 저장
const keys = { w: false, a: false, s: false, d: false };

// 방 데이터 구조
class Room {
    constructor(x, y, previousRoom = null) {
        this.x = x;
        this.y = y;
        this.width = ROOM_WIDTH;
        this.height = ROOM_HEIGHT;
        this.grid = this.generateRoom(previousRoom);
    }

    // 랜덤 방 생성 (벽, 바닥, 출입구 포함)
    generateRoom(previousRoom) {
        let grid = [];

        // 기본 맵 생성
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

        // 출입구 좌표
        let exits = {
            top: { x: Math.floor(this.width / 2), y: 0 },
            bottom: { x: Math.floor(this.width / 2), y: this.height - 1 },
            left: { x: 0, y: Math.floor(this.height / 2) },
            right: { x: this.width - 1, y: Math.floor(this.height / 2) }
        };

        // 이전 방과 연결되는 출입구 유지
        if (previousRoom) {
            if (previousRoom.y < this.y) grid[exits.top.y][exits.top.x] = 2; // 위쪽 출입구
            if (previousRoom.y > this.y) grid[exits.bottom.y][exits.bottom.x] = 2; // 아래쪽 출입구
            if (previousRoom.x < this.x) grid[exits.left.y][exits.left.x] = 2; // 왼쪽 출입구
            if (previousRoom.x > this.x) grid[exits.right.y][exits.right.x] = 2; // 오른쪽 출입구
        }

        // 랜덤 출입구 추가 (기본적으로 연결 보장 후 추가 출입구 생성)
        Object.values(exits).forEach(exit => {
            if (Math.random() < 0.5) grid[exit.y][exit.x] = 2;
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
        visitedRooms[roomKey] = new Room(x, y, currentRoom);
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

    requestAnimationFrame(gameLoop);
}

// 화면 크기 변경 시 비율 유지
window.addEventListener("resize", () => {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
});

// 게임 시작
gameLoop();
