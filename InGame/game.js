const canvas = document.getElementById("gameCanvas"); // 캔버스 요소 가져오기
const ctx = canvas.getContext("2d");

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

//방 랜덤
function moveToRoom(x, y, entryDirection) {
    const roomKey = `${x},${y}`;
    
    console.log(`🗺 방 이동: (${x}, ${y}) 방향: ${entryDirection}`);

    // 새로운 방을 불러오거나 생성
    if (!visitedRooms[roomKey]) {
        if (roomsData[roomKey]) {
            console.log("🗂 미리 만들어진 방 로드!");
            visitedRooms[roomKey] = new Room(x, y);
            visitedRooms[roomKey].grid = roomsData[roomKey].grid; // 저장된 방 데이터 사용
        } else {
            console.log("🎲 새로운 랜덤 방 생성!");
            visitedRooms[roomKey] = new Room(x, y);
        }
    }

    // 현재 방을 이동한 방으로 변경
    currentRoom = visitedRooms[roomKey];

    // 🚪 이동 후 반대편 출입구로 나오도록 설정
    if (entryDirection === "down") {
        player.x = GAME_WIDTH / 2;
        player.y = TILE_SIZE * 1.5; // 위쪽 출입구로 이동
    } else if (entryDirection === "up") {
        player.x = GAME_WIDTH / 2;
        player.y = GAME_HEIGHT - TILE_SIZE * 1.5; // 아래쪽 출입구로 이동
    } else if (entryDirection === "right") {
        player.x = TILE_SIZE * 1.5;
        player.y = GAME_HEIGHT / 2; // 왼쪽 출입구로 이동
    } else if (entryDirection === "left") {
        player.x = GAME_WIDTH - TILE_SIZE * 1.5;
        player.y = GAME_HEIGHT / 2; // 오른쪽 출입구로 이동
    }

    console.log(`✅ 플레이어 위치: (${player.x}, ${player.y})`);
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

    // 🔥 실제 타일 위치를 정확하게 계산
    let tileX = Math.floor(nextX / TILE_SIZE);
    let tileY = Math.floor(nextY / TILE_SIZE);
    let tile = currentRoom.grid[tileY][tileX];

    console.log(`플레이어 위치: (${tileX}, ${tileY}), 현재 타일: ${tile}`);

    // 🚧 벽(1) 충돌 방지
    if (tile === 1) return;

    // 🚪 출입구(2) 이동 처리
    if (tile === 2) {
        console.log("🚪 출입구를 밟음! 방 이동 시작!");
        
        if (tileY === 0) moveToRoom(currentRoom.x, currentRoom.y - 1, "up");
        else if (tileY === ROOM_HEIGHT - 1) moveToRoom(currentRoom.x, currentRoom.y + 1, "down");
        else if (tileX === 0) moveToRoom(currentRoom.x - 1, currentRoom.y, "left");
        else if (tileX === ROOM_WIDTH - 1) moveToRoom(currentRoom.x + 1, currentRoom.y, "right");
    }

    player.x = nextX;
    player.y = nextY;
}



// 🎯 **방 & 장애물 그리기**
function drawRoom() {
    for (let i = 0; i < currentRoom.height; i++) {
        for (let j = 0; j < currentRoom.width; j++) {
            let tile = currentRoom.grid[i][j];

            // 🔥 보이는 타일과 충돌 판정이 동일하도록 정확한 크기와 위치 설정
            let drawX = j * TILE_SIZE;
            let drawY = i * TILE_SIZE;

            if (tile === 1) {
                ctx.fillStyle = "gray"; // 벽
            } else if (tile === 2) {
                ctx.fillStyle = "yellow"; // 출입구
            } else {
                ctx.fillStyle = "black"; // 빈 공간
            }

            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        }
    }
}





// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 초기화

    drawRoom(); // 방 그리기 (이 코드가 빠져있으면 화면이 안 보임)

    movePlayer(); // 플레이어 이동 처리

    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size); // 플레이어 그리기

    requestAnimationFrame(gameLoop);
}

console.log("Canvas 크기:", canvas.width, canvas.height); // 🔥 캔버스 크기 디버깅

// 캔버스 크기가 0이면 다시 설정
if (canvas.width === 0 || canvas.height === 0) {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}



// 게임 시작
gameLoop();

