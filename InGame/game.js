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
function moveToRoom(x, y) {
    const roomKey = `${x},${y}`;
    
    console.log(`🗺 방 이동: (${x}, ${y})`); // 🔥 디버깅 로그 추가

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

    // 플레이어를 방 중앙으로 이동
    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT / 2;
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
    let tile = currentRoom.grid[tileY][tileX];

    console.log(`플레이어 위치: (${tileX}, ${tileY}), 현재 타일: ${tile}`); // 🔥 디버깅

    // 🚧 벽(1) & 장애물(3)은 이동 불가
    if (tile === 1 || tile === 3) return;

    if (tile === 2) {
    console.log("🚪 출입구를 밟음! 방 이동 시작!");
    
        if (tileY === 0) moveToRoom(currentRoom.x, currentRoom.y - 1); // 위쪽 출입구
        else if (tileY === ROOM_HEIGHT - 1) moveToRoom(currentRoom.x, currentRoom.y + 1); // 아래쪽 출입구
        else if (tileX === 0) moveToRoom(currentRoom.x - 1, currentRoom.y); // 왼쪽 출입구
        else if (tileX === ROOM_WIDTH - 1) moveToRoom(currentRoom.x + 1, currentRoom.y); // 오른쪽 출입구
    }


    // 🔥 함정(6) - 이동 속도 감소
    if (tile === 6) {
        console.log("⚠️ 함정을 밟음! 속도 감소!");
        player.speed = 1.5; // 속도 감소
        setTimeout(() => { player.speed = 2.5; }, 2000); // 2초 후 복구
    }

    // 🎁 아이템(4) - 획득 후 제거
    if (tile === 4) {
        console.log("🎁 아이템 획득!");
        currentRoom.grid[tileY][tileX] = 0; // 아이템 삭제
    }

    // 👿 이드(5) - 게임 오버
    if (tile === 5) {
        console.log("💀 이드에게 당했다! 게임 오버!");
    }


    player.x = nextX;
    player.y = nextY;
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
                ctx.fillStyle = "gray"; // 벽
            } else if (tile === 2) {
                ctx.fillStyle = "yellow"; // 출입구
            } else if (tile === 3) {
                ctx.fillStyle = "red"; // 장애물
            } else if (tile === 4) {
                ctx.fillStyle = "blue"; // 아이템
            } else if (tile === 5) {
                ctx.fillStyle = "purple"; // 이드 (적)
            } else if (tile === 6) {
                ctx.fillStyle = "orange"; // 함정
            } else {
                ctx.fillStyle = "black"; // 바닥
            }

            ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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

