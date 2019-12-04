const HEIGHT = 15;
const WIDTH = 20;
var SCORE = 0;
var LIVES = 10;
// makes board
var BOARD = [];
for (let i = 0; i < HEIGHT; i++) {
    let row = [];
    for (let j = 0; j < WIDTH; j++) {
        row.push({
            "player": false,
            "path": false,
            "seen": false,
            "tried": false,
            "death": false,
            "goal": false,
            "touching": 0
        });
    }
    BOARD.push(row.slice());
}
BOARD[0][0].seen = true;
BOARD[HEIGHT - 1][WIDTH - 1].goal = true;


function drawGameBoard(b) {
    let html = '';
    for (let i = 0; i < BOARD.length; i++) { // for every row
        html += '<div class="row">';
        for (let j = 0; j < BOARD[i].length; j++) { // for every block in the row
            let className = '';
            if (BOARD[i][j].path && b) {
                className = 'path';
            }
            if (BOARD[i][j].seen) {
                let touching = BOARD[i][j].touching;
                if (touching > 4) {
                    className = 'seen-high';
                } else if (touching > 2) {
                    className = 'seen-medium';
                } else if (touching > 0) {
                    className = 'seen-low';
                } else {
                    className = 'seen';
                }
            } else if (BOARD[i][j].tried) {
                className = 'tried';
            } else if (BOARD[i][j].goal) {
                className = 'goal';
            }
            html += `<div class="square ${className}">`;
            if (BOARD[i][j].death) {
                html += '<img class="game-piece" src="./skull.png">'
            } else if (BOARD[i][j].player) {
                html += '<img class="game-piece" src="./walk.gif">'
            }
            html += '</div>'
        }
        html += '</div>';
    }
    document.getElementById('container').innerHTML = html;
    document.getElementById('score').innerText = SCORE;
    let hearts = '';
    for (let h = 0; h < LIVES; h++) {
        hearts += '❤️';
    }
    document.getElementById('lives').innerText = hearts;
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
        if (BOARD[newI][newJ].path) {
            BOARD[pos.i][pos.j].player = false;
            BOARD[newI][newJ].player = true;
            if (!BOARD[newI][newJ].seen) {
                SCORE++;
            }
            BOARD[newI][newJ].seen = true;

            if (newI == (HEIGHT - 1) && newJ == (WIDTH - 1)) {
                gameWin();
                return true;
            }
        } else if (!BOARD[newI][newJ].tried) {
            BOARD[newI][newJ].tried = true;
            LIVES--;
            if (LIVES < 1) {
                gameOver();
                return true;
            }
        }
        drawGameBoard();
    }
}

document.addEventListener('keydown', movePlayer);


function loadBoard() {
    let path = [0, 0];
    while (!BOARD[HEIGHT - 1][WIDTH - 1].path) {
        var i = path[0];
        var j = path[1];
        let options = [];
        for (let iStep = -1; iStep <= 1; iStep++) {
            for (let jStep = -1; jStep <= 1; jStep++) {
                if ((iStep ** 2 + jStep ** 2) == 1) {
                    let newI = i + iStep;
                    let newJ = j + jStep
                    if (newI >= 0 && newI < BOARD.length && newJ >= 0 && newJ < BOARD[newI].length && (!BOARD[newI][newJ].path)) {
                        options.push({
                            'i': newI,
                            'j': newJ
                        });
                    }
                }
            }
        }
        if (options.length > 0) {
            let pos = options[Math.floor(Math.random() * options.length)];
            i = pos.i;
            j = pos.j;
            BOARD[i][j].path = true;
            path = [i, j];
        } else {
            for (let iSub = 0; iSub < BOARD.length; iSub++) {
                for (let jSub = 0; jSub < BOARD[iSub].length; jSub++) {
                    if (BOARD[iSub][jSub].path && (iSub ** 2 + jSub ** 2) > (i ** 2 + j ** 2)) {
                        path = [iSub, jSub];
                    }
                }
            }

        }
        if (BOARD[i][j].path) {
            continue;
        } else {
            BOARD[i][j].path = true;
            path = [i, j];
        }
    }

    for (let i = 0; i < BOARD.length; i++) {
        for (let j = 0; j < BOARD[0].length; j++) {
            for (let n = -1; n <= 1; n++) {
                let newI = i + n;
                for (let m = -1; m <= 1; m++) {
                    let newJ = j + m;
                    if (newI >= 0 && newI < BOARD.length && newJ >= 0 && newJ < BOARD[newI].length) {
                        if (!BOARD[newI][newJ].path) {
                            BOARD[i][j].touching++;
                        }
                    }
                }
            }
        }
    }
}


// when dom is ready it will run this function
document.addEventListener("DOMContentLoaded", function () {
    BOARD[0][0].player = true;
    BOARD[0][0].path = true;

    loadBoard();

    drawGameBoard();
});


function gameOver() {
    console.log("GAME OVER");
    let pos = getCurrentPosition("player");
    BOARD[pos.i][pos.j].death = true;
    drawGameBoard(true);
    document.removeEventListener('keydown', movePlayer, false);
    document.getElementById("message").innerText = "You Lose";
}

function gameWin() {
    console.log("YOU WIN");
    drawGameBoard(true);
    document.removeEventListener('keydown', movePlayer, false);
    document.getElementById("message").innerText = "CONGRATULATIONS";
}