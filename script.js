const HEIGHT = 6;
const WIDTH = 8;
var SCORE = 0;
// makes board
var BOARD = [];
for (let i = 0; i < HEIGHT; i++) {
    let row = [];
    for (let j = 0; j < WIDTH; j++) {
        row.push({
            "player": false,
            "path": false,
            "death": false
        });
    }
    BOARD.push(row.slice());
}

function drawGameBoard(b) {
    let html = '';
    for (let i = 0; i < BOARD.length; i++) { // for every row
        html += '<div class="row">';
        for (let j = 0; j < BOARD[i].length; j++) { // for every block in the row
            let className = 'light';
            if ((i + j) % 2) { // alternates the colors by checking to see if the sum of the two numbers is odd or even
                className = 'dark';
            }
            if (BOARD[i][j].path && b) {
                className = 'red';
            }
            html += `<div class="square ${className}">`;
            if (BOARD[i][j].death) {
                html += '<img class="game-piece" src="./skull.jpeg">'
            } else if (BOARD[i][j].player) {
                html += '<img class="game-piece" src="./walk.gif">'
            }
            html += '</div>'
        }
        html += '</div>';
    }
    document.getElementById('container').innerHTML = html;
    document.getElementById('score').innerText = SCORE;
}


function getCurrentPosition(key) {
    for (let i = 0; i < BOARD.length; i++) {
        for (let j = 0; j < BOARD[i].length; j++) {
            if (BOARD[i][j][key]) {
                return { "i": i, "j": j };
            }
        }
    }
}

function movePlayer(event) {
    let key = event.key;
    let moves = {
        'ArrowUp': { "i": -1, "j": 0 },
        'ArrowDown': { "i": 1, "j": 0 },
        'ArrowRight': { "i": 0, "j": 1 },
        'ArrowLeft': { "i": 0, "j": -1 }
    }
    if (key in moves) {
        let move = moves[key];
        let pos = getCurrentPosition("player");
        let newI = Math.max(0, Math.min(pos.i + move.i, BOARD.length - 1));
        let newJ = Math.max(0, Math.min(pos.j + move.j, BOARD[newI].length - 1));
        BOARD[pos.i][pos.j].player = false;
        BOARD[newI][newJ].player = true;
        console.log(`${key}: (${pos.i}, ${pos.j}) -> (${newI}, ${newJ})`);
        if (BOARD[newI][newJ].path) {
            SCORE++;
            if (newI == (HEIGHT - 1) && newJ == (WIDTH - 1)) {
                gameWin();
            }
        } else {
            gameOver();
        }
        drawGameBoard();
    }
}

document.addEventListener('keydown', movePlayer);

// when dom is ready it will run this function
document.addEventListener("DOMContentLoaded", function () {
    BOARD[0][0].player = true;
    BOARD[0][0].path = true;
    let path = [0, 0];
    while (!BOARD[HEIGHT - 1][WIDTH - 1].path) {
        let index = Math.round(Math.random());
        if (index) {
            path[index] = Math.min(path[index] + 1, WIDTH - 1);
        } else {
            path[index] = Math.min(path[index] + 1, HEIGHT - 1);
        }
        BOARD[path[0]][path[1]].path = true;
    }
    drawGameBoard();
});


function gameOver() {
    console.log("GAME OVER");
    let pos = getCurrentPosition("player");
    BOARD[pos.i][pos.j].death = true;
    document.removeEventListener('keydown', movePlayer, false);
    document.getElementById("message").innerText = "You Lose";
    drawGameBoard();
}

function gameWin() {
    console.log("YOU WIN");
    document.removeEventListener('keydown', movePlayer, false);
    document.getElementById("message").innerText = "CONGRATULATIONS";
    drawGameBoard(true);
}