const HEIGHT = 15;
const WIDTH = 20;
var SCORE = 0;
var LIVES = 5;
var GAMES = 5;
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
            "touching": 0,
            "died": false,
            "flashlight": false,
            "litup": false,
            "heart": false
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
                } else if (touching > 1) {
                    className = 'seen-low';
                } else if (touching > 0) {
                    className = 'seen-very-low';
                } else {
                    className = 'seen';
                }
            } else if (BOARD[i][j].tried) {
                className = 'tried';
            } else if (BOARD[i][j].goal) {
                className = 'goal';
            }
            if (BOARD[i][j].litup) {
                className += ' bordered'
            }

            html += `<div class="square ${className}">`;
            if (BOARD[i][j].death) {
                html += '<img class="game-piece" src="./skull.png">'
            } else if (BOARD[i][j].player) {
                html += '<img class="game-piece" src="./walk.gif">'
            } else if (BOARD[i][j].heart && (BOARD[i][j].heart.seen || b)) {
                html += '<p>❤️</p>'
            } else if (BOARD[i][j].flashlight && (BOARD[i][j].flashlight.seen || b)) {
                html += '<p>🔦</p>'
            }

            if (BOARD[i][j].died) {
                html += '<p>💀</p>'
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
    let skulls = '';
    for (let s = 0; s < GAMES; s++) {
        skulls += '💀';
    }
    document.getElementById('games').innerText = skulls;
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

            if (BOARD[newI][newJ].heart && !BOARD[newI][newJ].heart.seen) {
                BOARD[newI][newJ].heart.seen = true;
                LIVES++;
            }

            if (BOARD[newI][newJ].flashlight && !BOARD[newI][newJ].flashlight.seen) {
                BOARD[newI][newJ].flashlight.seen = true;
                for (let x = -2; x <= 2; x++) {
                    let xi = newI + x;
                    if (xi >= 0 && xi < BOARD.length) {
                        for (let y = -2; y <= 2; y++) {
                            let yj = newJ + y;
                            if (yj >= 0 && yj < BOARD[xi].length) {
                                BOARD[xi][yj].litup = true;
                                if (BOARD[xi][yj].path) {
                                    BOARD[xi][yj].seen = true;
                                }
                            }
                        }
                    }
                }
            }

            if (newI == (HEIGHT - 1) && newJ == (WIDTH - 1)) {
                gameWin();
                return true;
            }
        } else if (!BOARD[newI][newJ].tried) {
            BOARD[newI][newJ].tried = true;
            LIVES--;
            if (LIVES < 1) {
                GAMES--;
                if (GAMES < 1) {
                    gameOver();
                    return true;
                }
                LIVES = 5
                resetGame(newI, newJ);
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


    let values = [];
    for (let i = 0; i < BOARD.length; i++) {
        for (let j = 0; j < BOARD[i].length; j++) {
            if (BOARD[i][j].path) {
                values.push({
                    "i": i, "j": j
                });
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

    let heartIndex = Math.floor(Math.random() * values.length);
    let lightIndex = heartIndex;
    while (lightIndex == heartIndex) {
        lightIndex = Math.floor(Math.random() * values.length);
    }
    let pos = values[heartIndex];
    BOARD[pos.i][pos.j].heart = { 'seen': false };
    pos = values[lightIndex];
    BOARD[pos.i][pos.j].flashlight = { 'seen': false };
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

function resetGame(lastI, lastJ) {
    BOARD[lastI][lastJ].died = true;
    let path = [];
    for (let i = 0; i < BOARD.length; i++) {
        for (let j = 0; j < BOARD[i].length; j++) {
            BOARD[i][j].seen = false;
            BOARD[i][j].tried = false;
            BOARD[i][j].player = false;
            BOARD[i][j].heart = false;
            BOARD[i][j].flashlight = false;
            BOARD[i][j].seen = false;
            BOARD[i][j].litup = false;
            if (BOARD[i][j].path) {
                path.push({ "i": i, "j": j });
            }
        }
    }

    BOARD[0][0].player = true;
    BOARD[0][0].seen = true;
    STEPS = 0;

    let heartIndex = Math.floor(Math.random() * path.length);
    let lightIndex = heartIndex;
    while (lightIndex == heartIndex) {
        lightIndex = Math.floor(Math.random() * path.length);
    }
    let pos = path[heartIndex];
    BOARD[pos.i][pos.j].heart = { 'seen': false };
    pos = path[lightIndex];
    BOARD[pos.i][pos.j].flashlight = { 'seen': false };
}