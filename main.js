var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var radianToDegree = 180 / Math.PI;
var degreeToRadian = Math.PI / 180;

function createDiv(content, classList, left, top) {
    var div = document.createElement("div");

    for (var i = 0; i < classList.length; i++) {
        div.className += classList[i];
        if (i !== classList.length - 1) {
            div.className += " ";
        }
    }
    div.style.left = left + "px";
    div.style.top = top + "px";
    div.innerHTML = content;

    return div;
}

function randomInt(min, max) {
    return Math.floor(random(min, max + 0.99999));
}

function random(min, max) {
    return min + (max - min) * Math.random();
}

var Game = function () {
    function Game(elementId, width, height) {
        _classCallCheck(this, Game);

        if (window.gameRef === undefined) {
            this.elemId = elementId;
            this.gameOverElem = document.querySelector("#game-over");
            this.width = width;
            this.height = height;

            // Static reference to the running game
            window.gameRef = this;
            this.gameStarted = false;

            this.addKeyboardListeners();

            this.upEventCallback;
            this.downEventCallback;
            this.leftEventCallback;
            this.rightEventCallback;

            this.testEventCallback;

            this.grid;

            this.restarting = false;
            this.numberMoves = 1;

            this.touchStartPoint = new Vector();
            this.touchEndPoint = new Vector();
            this.moveThreshold = 100;
            this.moveAngleThreshold = 20;
        } else {
            console.error("Can not have more than one Game running at the same time");
        }
    }

    _createClass(Game, [{
        key: "start",
        value: function start() {
            for (var i = 0; i <= this.grid.rows; i++) {
                var halfLineWidth = 10 / 2;
                var horizontalDiv = createDiv("", ["divider-horizontal"], 0, this.grid.tilePadding * 0.5 + i * this.grid.tileSize + this.grid.tilePadding * i - halfLineWidth);
                this.grid.tileElem.appendChild(horizontalDiv);

                var verticalDiv = createDiv("", ["divider-vertical"], this.grid.tilePadding * 0.5 + i * this.grid.tileSize + this.grid.tilePadding * i - halfLineWidth, 0);
                this.grid.tileElem.appendChild(verticalDiv);
            }

            document.querySelector("#retry-button").addEventListener("click", function (event) {
                window.gameRef.restart();
            });

            document.querySelector("#start-button").addEventListener("click", function (event) {
                if (!window.gameRef.gameStarted) {
                    window.gameRef.gameStarted = true;
                    window.gameRef.grid.spawnNewTile(2);

                    var howToPlay = document.querySelector("#how-to-info");
                    howToPlay.style.opacity = 0;
                    setTimeout(function () {
                        howToPlay.style.display = "none";
                    }, 250);
                }
            });
        }
    }, {
        key: "setupScale",
        value: function setupScale() {
            var stageElem = document.querySelector("#stage");
            var stageHeight = 790;
            var stageWidth = 700;

            var scale = 1;

            if (window.innerWidth >= window.innerHeight) {
                // Landscape
                scale = Math.min(window.innerHeight / stageHeight, 1);
                stageElem.style.transformOrigin = "50% 0%";

                if (window.innerHeight >= stageHeight) {
                    var stageTop = (window.innerHeight - stageHeight) * 0.5;
                    stageElem.style.marginTop = stageTop + "px";
                } else {
                    stageElem.style.marginTop = "0px";
                }
            } else {
                // Portrait
                scale = Math.min(window.innerWidth / stageWidth, 1);
                stageElem.style.transformOrigin = "0% 50%";
            }

            stageElem.style.transform = "scale(" + scale + ")";
            stageElem.style.webkitTransform = "scale(" + scale + ")";
            stageElem.style.MozTransform = "scale(" + scale + ")";
        }
    }, {
        key: "attachUpEventCallback",
        value: function attachUpEventCallback(callback) {
            this.upEventCallback = callback;
        }
    }, {
        key: "attachDownEventCallback",
        value: function attachDownEventCallback(callback) {
            this.downEventCallback = callback;
        }
    }, {
        key: "attachLeftEventCallback",
        value: function attachLeftEventCallback(callback) {
            this.leftEventCallback = callback;
        }
    }, {
        key: "attachRightEventCallback",
        value: function attachRightEventCallback(callback) {
            this.rightEventCallback = callback;
        }
    }, {
        key: "attachTestEventCallback",
        value: function attachTestEventCallback(callback) {
            this.testEventCallback = callback;
        }
    }, {
        key: "addKeyboardListeners",
        value: function addKeyboardListeners() {
            document.addEventListener("keydown", window.gameRef.keyDown);
            // document.addEventListener("keyup", window.gameRef.keyUp);
            document.addEventListener("touchstart", window.gameRef.touchStart);
            document.addEventListener("touchend", window.gameRef.touchEnd);
        }
    }, {
        key: "touchStart",
        value: function touchStart(event) {
            //console.log("Touch start: (" + event.changedTouches[0].clientX + "," + event.changedTouches[0].clientY + ")");
            window.gameRef.touchStartPoint.x = event.changedTouches[0].clientX;
            window.gameRef.touchStartPoint.y = event.changedTouches[0].clientY;
        }
    }, {
        key: "touchEnd",
        value: function touchEnd(event) {
            //console.log("Touch start: (" + event.changedTouches[0].clientX + "," + event.changedTouches[0].clientY + ")");
            window.gameRef.touchEndPoint.x = event.changedTouches[0].clientX;
            window.gameRef.touchEndPoint.y = event.changedTouches[0].clientY;

            var directionVector = Vector.subtract(window.gameRef.touchEndPoint, window.gameRef.touchStartPoint);
            console.log(directionVector.sqrMagnitude + " > " + window.gameRef.moveThresholdSqr);

            var angle = directionVector.angle * radianToDegree;

            if (directionVector.sqrMagnitude > window.gameRef.moveThresholdSqr) {
                if (directionVector.y > 0) {
                    // UP
                    // Top Left
                    if (angle > 0) {
                        if (Math.abs(angle) < window.gameRef.moveAngleThreshold) {
                            // console.log("right");
                            window.gameRef.rightButtonDown();
                        } else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold) {
                            // console.log("Down");
                            window.gameRef.downButtonDown();
                        }
                    } else {
                        // Top right
                        if (Math.abs(angle) < window.gameRef.moveAngleThreshold) {
                            // console.log("left");
                            window.gameRef.leftButtonDown();
                        } else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold) {
                            // console.log("Down");
                            window.gameRef.downButtonDown();
                        }
                    }
                } else {
                    // Down
                    // Bottom Right
                    if (angle > 0) {
                        if (Math.abs(angle) < window.gameRef.moveAngleThreshold) {
                            // console.log("left");
                            window.gameRef.leftButtonDown();
                        } else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold) {
                            // console.log("Up");
                            window.gameRef.upButtonDown();
                        }
                    } else {
                        // Bottom left
                        if (Math.abs(angle) < window.gameRef.moveAngleThreshold) {
                            // console.log("right");
                            window.gameRef.rightButtonDown();
                        } else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold) {
                            // console.log("Up");
                            window.gameRef.upButtonDown();
                        }
                    }
                }
            }

            // if (directionVector.sqrMagnitude > window.gameRef.moveThresholdSqr){
            //     // console.log("direction vector: (" + directionVector.x + ", " + directionVector.y + ")");
            //     console.log("angle: " + angle);
            // }
        }
    }, {
        key: "keyDown",
        value: function keyDown(event) {
            // left arrow
            if (event.which === 37) {
                window.gameRef.leftButtonDown();
            }
            // right arrow
            if (event.which === 39) {
                window.gameRef.rightButtonDown();
            }
            // up arrow
            if (event.which === 38) {
                window.gameRef.upButtonDown();
            }
            // down arrow
            if (event.which === 40) {
                window.gameRef.downButtonDown();
            }

            // Q for testing
            if (event.which === 81) {
                if (window.gameRef.testEventCallback !== undefined) {
                    window.gameRef.testEventCallback();
                }
            }
        }
    }, {
        key: "leftButtonDown",
        value: function leftButtonDown() {
            if (window.gameRef.gameOver) {
                return;
            }

            if (window.gameRef.grid.slideLeft()) {
                window.gameRef.grid.spawnNewTile();
                window.gameRef.numberMoves++;
                window.gameRef.checkGameOver();
                // console.table(window.gameRef.grid.tiles);
            }
        }
    }, {
        key: "rightButtonDown",
        value: function rightButtonDown() {
            if (window.gameRef.gameOver) {
                return;
            }

            if (window.gameRef.grid.slideRight()) {
                window.gameRef.grid.spawnNewTile();
                window.gameRef.numberMoves++;
                window.gameRef.checkGameOver();
                // console.table(window.gameRef.grid.tiles);
            }
        }
    }, {
        key: "upButtonDown",
        value: function upButtonDown() {
            if (window.gameRef.gameOver) {
                return;
            }

            if (window.gameRef.grid.slideUp()) {
                window.gameRef.grid.spawnNewTile();
                window.gameRef.numberMoves++;
                window.gameRef.checkGameOver();
                // console.table(window.gameRef.grid.tiles);
            }
        }
    }, {
        key: "downButtonDown",
        value: function downButtonDown() {
            if (window.gameRef.gameOver) {
                return;
            }

            if (window.gameRef.grid.slideDown()) {
                window.gameRef.grid.spawnNewTile();
                window.gameRef.numberMoves++;
                window.gameRef.checkGameOver();
                // console.table(window.gameRef.grid.tiles);
            }
        }
    }, {
        key: "checkGameOver",
        value: function checkGameOver() {
            if (!this.gameOver && !this.grid.openTilesLeft()) {
                if (!this.grid.validMovesLeft()) {
                    setTimeout(function () {
                        window.gameRef.setGameOverState(false);
                    }, 500);
                }
            }
        }
    }, {
        key: "setGameOverState",
        value: function setGameOverState(victory) {
            var titleElem = document.querySelector("#game-over .title");
            var subTitleElem = document.querySelector("#game-over .sub-title");
            var retryButtonElem = document.querySelector("#retry-button");

            if (victory) {
                var randomTest = randomInt(1, 4);
                switch (randomTest) {
                    case 1:
                        titleElem.innerHTML = "Amazing!";
                        break;
                    case 2:
                        titleElem.innerHTML = "Awesome!";
                        break;
                    case 3:
                        titleElem.innerHTML = "Astonishing!";
                        break;
                    case 4:
                        titleElem.innerHTML = "Astounding!";
                        break;
                }
                subTitleElem.innerHTML = "You beat 2048 in " + this.numberMoves + " moves!";
                retryButtonElem.innerHTML = "Play Again";
            } else {
                titleElem.innerHTML = "Game Over";
                subTitleElem.innerHTML = "No more moves available.";
                retryButtonElem.innerHTML = "Try Again";
            }

            this.gameOverElem.style.visibility = "visible";
            this.gameOverElem.style.opacity = "1";
        }
    }, {
        key: "restart",
        value: function restart() {
            var _this = this;

            if (!this.restarting) {
                for (var r = 0; r < this.grid.rows; r++) {
                    for (var c = 0; c < this.grid.cols; c++) {
                        var tiles = this.grid.tiles;
                        if (tiles[r][c] !== undefined) {
                            tiles[r][c].destory();
                            tiles[r][c] = undefined;
                        }
                    }
                }

                this.grid.reset();

                this.grid.spawnNewTile(2);

                this.numberMoves = 1;
                this.gameOverElem.style.opacity = 0;
                setTimeout(function () {
                    _this.gameOverElem.style.visibility = "hidden";
                }, 300);
            }
        }
    }, {
        key: "moveThresholdSqr",
        get: function get() {
            return this.moveThreshold * this.moveThreshold;
        }
    }, {
        key: "gameOver",
        get: function get() {
            if (this.grid.gameOver) {
                return true;
            }
            return false;
        }
    }], [{
        key: "deltaTime",
        get: function get() {
            return 1000 / 60;
        }
    }]);

    return Game;
}();

var Grid = function () {
    function Grid(numRows, gridSize) {
        _classCallCheck(this, Grid);

        this.rows = numRows;
        this.cols = numRows;
        this.gridSize = gridSize;
        this.tilePadding = 10;
        this.tileSize = (this.gridSize - this.tilePadding * (this.rows + 1)) / this.rows;

        this.tiles = [];

        this.updateTiles = false;

        this.winningTile = undefined;

        for (var r = 0; r < this.rows; r++) {
            this.tiles[r] = [];
            for (var c = 0; c < this.cols; c++) {
                this.tiles[r][c] = undefined;
            }
        }

        this.tileElem = document.querySelector("#game");
    }

    _createClass(Grid, [{
        key: "calculateTileTopLeftPoint",
        value: function calculateTileTopLeftPoint(rowIndex, colIndex) {
            var tileTopLeft = new Vector();
            tileTopLeft.y = this.tilePadding + rowIndex * this.tilePadding + rowIndex * this.tileSize;
            tileTopLeft.x = this.tilePadding + colIndex * this.tilePadding + colIndex * this.tileSize;

            return tileTopLeft;
        }
    }, {
        key: "openTilesLeft",
        value: function openTilesLeft() {
            for (var r = 0; r < this.rows; r++) {
                for (var c = 0; c < this.cols; c++) {
                    if (this.tiles[r][c] === undefined) {
                        return true;
                    }
                }
            }

            return false;
        }
    }, {
        key: "validMovesLeft",
        value: function validMovesLeft() {
            for (var r = 0; r < this.rows; r++) {
                for (var c = 0; c < this.cols; c++) {
                    if (this.tileCanNeighbours(this.tiles[r][c])) {
                        return true;
                    }
                }
            }

            return false;
        }
    }, {
        key: "tileCanNeighbours",
        value: function tileCanNeighbours(tile) {
            // top tile
            if (tile.rowIndex > 0) {
                if (this.tiles[tile.rowIndex - 1][tile.colIndex] !== undefined && this.tiles[tile.rowIndex - 1][tile.colIndex].value == tile.value) {
                    return true;
                }
            }

            // bottom tile
            if (tile.rowIndex < this.rows - 1) {
                if (this.tiles[tile.rowIndex + 1][tile.colIndex] !== undefined && this.tiles[tile.rowIndex + 1][tile.colIndex].value == tile.value) {
                    return true;
                }
            }

            // Left tile
            if (tile.colIndex > 0) {
                if (this.tiles[tile.rowIndex][tile.colIndex - 1] !== undefined && this.tiles[tile.rowIndex][tile.colIndex - 1].value == tile.value) {
                    return true;
                }
            }

            // Right tile
            if (tile.colIndex < this.cols - 1) {
                if (this.tiles[tile.rowIndex][tile.colIndex + 1] !== undefined && this.tiles[tile.rowIndex][tile.colIndex + 1].value == tile.value) {
                    return true;
                }
            }
        }
    }, {
        key: "spawnNewTile",
        value: function spawnNewTile(numTiles) {
            if (!this.openTilesLeft()) {
                return;
            }

            if (numTiles === undefined) {
                numTiles = 1;
            }

            for (var i = 0; i < numTiles; i++) {
                var rowIndex = void 0;
                var colIndex = void 0;

                do {
                    rowIndex = randomInt(0, this.rows - 1);
                    colIndex = randomInt(0, this.cols - 1);
                } while (this.tiles[rowIndex][colIndex] !== undefined);

                game.grid.addTile(rowIndex, colIndex);

                // Added tile, doing a safety check
                if (!this.openTilesLeft()) {
                    return;
                }
            }
        }
    }, {
        key: "addTile",
        value: function addTile(rowIndex, colIndex) {
            if (rowIndex >= 0 && rowIndex < this.rows && colIndex >= 0 && colIndex < this.cols) {
                var tileTopLeft = new Vector();
                var newTile = new Tile(new Vector(rowIndex, colIndex), this);

                this.tileElem.appendChild(newTile.tileElem);

                this.tiles[rowIndex][colIndex] = newTile;
            } else {
                console.error("Grid index out of range, trying to add a new tile.");
            }
        }
    }, {
        key: "moveTile",
        value: function moveTile(tileToMove, tileDestinationRow, tileDestinationCol) {
            // Clear the old grid spot
            this.tiles[tileToMove.rowIndex][tileToMove.colIndex] = undefined;

            tileToMove.moveTo(tileDestinationRow, tileDestinationCol);

            if (this.tiles[tileDestinationRow][tileDestinationCol] !== undefined) {
                console.error("this move is invalid");
            }

            // Copy tile to move to new grid spot
            this.tiles[tileDestinationRow][tileDestinationCol] = tileToMove;
        }
    }, {
        key: "tryAbsorb",
        value: function tryAbsorb(currentTile, tileToAbsorb) {
            if (currentTile.value == tileToAbsorb.value) {
                // This tile should absorb the next on in this row
                this.tiles[tileToAbsorb.rowIndex][tileToAbsorb.colIndex] = undefined;
                currentTile.absorb(tileToAbsorb);

                if (currentTile.value == 2048) {
                    this.gameWon(currentTile);
                }
                return true;
            }

            return false;
        }
    }, {
        key: "gameWon",
        value: function gameWon(winningTile) {
            console.warn("GAME WON - need to finish game");

            // Clear the gird
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    if (this.tiles[row][col] !== undefined && this.tiles[row][col] !== winningTile) {
                        this.tiles[row][col].destory();
                    }
                }
            }

            this.winningTile = winningTile;
            winningTile.setWinningBlock();

            setTimeout(function () {
                window.gameRef.setGameOverState(true);
            }, 1000);
        }
    }, {
        key: "slideLeft",
        value: function slideLeft() {
            if (this.gameOver) {
                return;
            }

            var moved = false;
            // Start at the left side of the board
            for (var c = 0; c < this.cols; c++) {
                for (var r = 0; r < this.rows; r++) {
                    var currentTile = this.tiles[r][c];

                    if (currentTile !== undefined) {
                        // We have a tile.
                        for (var testCol = c + 1; testCol < this.cols; testCol++) {
                            var testTile = this.tiles[r][testCol];
                            if (testTile !== undefined && testTile !== currentTile) {
                                // We have another tile
                                if (this.tryAbsorb(currentTile, testTile)) {
                                    // The tile was absorbed
                                    if (this.winningTile !== undefined) {
                                        return;
                                    }
                                    moved = true;
                                }
                                // We do not need to check the rest as we can not absorb through other tiles
                                break;
                            }
                        }

                        // Now that I know the next tile has been taken care of, I need to move the tiles
                        // Start checking the spot directly next to mine
                        for (var colLeftIndex = c - 1; colLeftIndex >= 0; colLeftIndex--) {
                            // The tile should move

                            // Find the first spot that is not open
                            var tileToMove = this.tiles[r][c];
                            var canMove = tileToMove.destinationOpen(tileToMove.rowIndex, colLeftIndex);

                            if (!canMove) {
                                // Is this the first check?
                                if (colLeftIndex !== c - 1) {
                                    // Move to the previous spot
                                    this.moveTile(tileToMove, tileToMove.rowIndex, colLeftIndex + 1);
                                    moved = true;
                                }

                                break;
                            } else if (colLeftIndex == 0) {
                                // Moving to edge
                                this.moveTile(tileToMove, tileToMove.rowIndex, colLeftIndex);
                                moved = true;
                            }
                        }
                    }
                }
            }

            return moved;
        }
    }, {
        key: "slideRight",
        value: function slideRight() {
            if (this.gameOver) {
                return;
            }

            var moved = false;
            // Start on the right side of the board
            for (var c = this.cols - 1; c >= 0; c--) {
                for (var r = 0; r < this.rows; r++) {
                    var currentTile = this.tiles[r][c];

                    if (this.tiles[r][c] !== undefined && !this.tiles[r][c].updated) {
                        // We have a tile.
                        for (var testCol = c - 1; testCol >= 0; testCol--) {
                            var testTile = this.tiles[r][testCol];
                            if (testTile !== undefined && testTile !== currentTile) {
                                // We have another tile
                                if (this.tryAbsorb(currentTile, testTile)) {
                                    // The tile was absorbed
                                    if (this.winningTile !== undefined) {
                                        return;
                                    }
                                    moved = true;
                                }
                                // We do not need to check the rest as we can not absorb through other tiles
                                break;
                            }
                        }

                        // Now that I know the next tile has been taken care of, I need to move the tiles
                        // Start checking the spot directly next to mine
                        for (var colRightIndex = c + 1; colRightIndex <= this.cols - 1; colRightIndex++) {
                            // The tile should move

                            // Find the firs spot that is not open
                            var tileToMove = this.tiles[r][c];
                            var canMove = tileToMove.destinationOpen(tileToMove.rowIndex, colRightIndex);

                            if (!canMove) {
                                // Is this the first check?
                                if (colRightIndex !== c + 1) {
                                    // Move to the previous spot
                                    this.moveTile(tileToMove, tileToMove.rowIndex, colRightIndex - 1);
                                    moved = true;
                                }

                                break;
                            } else if (colRightIndex == this.cols - 1) {
                                // Moving to edge
                                this.moveTile(tileToMove, tileToMove.rowIndex, colRightIndex);
                                moved = true;
                            }
                        }
                    }
                }
            }

            return moved;
        }
    }, {
        key: "slideUp",
        value: function slideUp() {
            if (this.gameOver) {
                return;
            }

            var moved = false;
            // Start at the top of the board
            for (var r = 0; r < this.rows; r++) {
                for (var c = 0; c < this.cols; c++) {
                    var currentTile = this.tiles[r][c];

                    if (this.tiles[r][c] !== undefined && !this.tiles[r][c].updated) {
                        // We have a tile.
                        for (var testRow = r + 1; testRow < this.rows; testRow++) {
                            var testTile = this.tiles[testRow][c];
                            if (testTile !== undefined && testTile !== currentTile) {
                                // We have another tile
                                if (this.tryAbsorb(currentTile, testTile)) {
                                    // The tile was absorbed
                                    if (this.winningTile !== undefined) {
                                        return;
                                    }
                                    moved = true;
                                }
                                // We do not need to check the rest as we can not absorb through other tiles
                                break;
                            }
                        }

                        // Now that I know the next tile has been taken care of, I need to move the tiles
                        // Start checking the spot directly next to mine
                        for (var rowUpIndex = r - 1; rowUpIndex >= 0; rowUpIndex--) {
                            // The tile should move

                            // Find the firs spot that is not open
                            var tileToMove = this.tiles[r][c];
                            var canMove = tileToMove.destinationOpen(rowUpIndex, tileToMove.colIndex);

                            if (!canMove) {
                                // Is this the first check?
                                if (rowUpIndex !== r - 1) {
                                    // Move to the previous spot
                                    this.moveTile(tileToMove, rowUpIndex + 1, tileToMove.colIndex);
                                    moved = true;
                                }

                                break;
                            } else if (rowUpIndex == 0) {
                                // Moving to edge
                                this.moveTile(tileToMove, rowUpIndex, tileToMove.colIndex);
                                moved = true;
                            }
                        }
                    }
                }
            }

            return moved;
        }
    }, {
        key: "slideDown",
        value: function slideDown() {
            if (this.gameOver) {
                return;
            }

            var moved = false;
            // Start at the bottom of the board
            for (var r = this.rows - 1; r >= 0; r--) {
                for (var c = 0; c < this.cols; c++) {
                    var currentTile = this.tiles[r][c];

                    if (this.tiles[r][c] !== undefined && !this.tiles[r][c].updated) {
                        // We have a tile.
                        for (var testRow = r - 1; testRow >= 0; testRow--) {
                            var testTile = this.tiles[testRow][c];
                            if (testTile !== undefined && testTile !== currentTile) {
                                // We have another tile
                                if (this.tryAbsorb(currentTile, testTile)) {
                                    // The tile was absorbed
                                    if (this.winningTile !== undefined) {
                                        return;
                                    }
                                    moved = true;
                                }
                                // We do not need to check the rest as we can not absorb through other tiles
                                break;
                            }
                        }

                        // Now that I know the next tile has been taken care of, I need to move the tiles
                        // Start checking the spot directly next to mine
                        for (var rowDownIndex = r + 1; rowDownIndex <= this.rows - 1; rowDownIndex++) {
                            // The tile should move

                            // Find the firs spot that is not open
                            var tileToMove = this.tiles[r][c];
                            var canMove = tileToMove.destinationOpen(rowDownIndex, tileToMove.colIndex);

                            if (!canMove) {
                                // Is this the first check?
                                if (rowDownIndex !== r + 1) {
                                    // Move to the previous spot
                                    this.moveTile(tileToMove, rowDownIndex - 1, tileToMove.colIndex);
                                    moved = true;
                                }

                                break;
                            } else if (rowDownIndex == this.rows - 1) {
                                // Moving to edge
                                this.moveTile(tileToMove, rowDownIndex, tileToMove.colIndex);
                                moved = true;
                            }
                        }
                    }
                }
            }

            return moved;
        }
    }, {
        key: "reset",
        value: function reset() {
            this.winningTile = undefined;
        }
    }, {
        key: "gameOver",
        get: function get() {
            return this.winningTile !== undefined;
        }
    }]);

    return Grid;
}();

var Tile = function () {
    function Tile(gridIndex, gridRef) {
        _classCallCheck(this, Tile);

        this.gridRef = gridRef;
        this.topLeftPoint = this.gridRef.calculateTileTopLeftPoint(gridIndex.x, gridIndex.y);

        this.rowIndex = gridIndex.x;
        this.colIndex = gridIndex.y;

        this.value = random(0, 1) > 0.35 ? 2 : 4;

        this.tileElem = createDiv(this.value, [styleNames.newBlock, styleNames.grey], this.topLeftPoint.x, this.topLeftPoint.y);

        var tile = this;
        setTimeout(function () {
            tile.changeSize();
        }, random(Game.deltaTime * 5, Game.deltaTime * 17));
    }

    _createClass(Tile, [{
        key: "changeColour",
        value: function changeColour(newColourClass) {
            if (!this.tileElem.classList.contains(newColourClass)) {
                this.removeColourClass();
                this.tileElem.classList.add(newColourClass);
            }
        }
    }, {
        key: "changeSize",
        value: function changeSize() {
            var destory = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (destory) {
                this.removeSizeClass();
                this.addClass(styleNames.newBlock);
            } else {
                this.removeSizeClass();
                this.addClass(styleNames.small);
            }
        }
    }, {
        key: "removeSizeClass",
        value: function removeSizeClass() {
            this.removeClass(styleNames.newBlock);
            this.removeClass(styleNames.small);
            this.removeClass(styleNames.winning);
        }
    }, {
        key: "removeColourClass",
        value: function removeColourClass() {
            this.removeClass(styleNames.grey);
            this.removeClass(styleNames.blue);
            this.removeClass(styleNames.green);
            this.removeClass(styleNames.purple);
            this.removeClass(styleNames.pink);
            this.removeClass(styleNames.yellow);
            this.removeClass(styleNames.red);
            this.removeClass(styleNames.orange);
        }
    }, {
        key: "addClass",
        value: function addClass(classToAdd) {
            if (!this.tileElem.classList.contains(classToAdd)) {
                this.tileElem.classList.add(classToAdd);
            }
        }
    }, {
        key: "removeClass",
        value: function removeClass(classToRemove) {
            if (this.tileElem.classList.contains(classToRemove)) {
                this.tileElem.classList.remove(classToRemove);
            }
        }
    }, {
        key: "moveTo",
        value: function moveTo(rowIndex, colIndex) {
            var temp = this.gridRef.calculateTileTopLeftPoint(rowIndex, colIndex);

            this.rowIndex = rowIndex;
            this.colIndex = colIndex;

            this.tileElem.style.left = temp.x + "px";
            this.tileElem.style.top = temp.y + "px";
        }
    }, {
        key: "absorb",
        value: function absorb(tileToAbsorb) {
            // Prevent tiles larger than 1 x 1 from absorbing themselves
            if (tileToAbsorb == this) {
                return;
            }

            if (this.value === tileToAbsorb.value) {
                this.value += tileToAbsorb.value;
                tileToAbsorb.destory;

                this.tileElem.innerHTML = this.value;

                this.setColourBasedValue();

                // Finally the absorbed tile should be destoryd
                tileToAbsorb.moveTo(this.rowIndex, this.colIndex);
                tileToAbsorb.destory();
            }
        }
    }, {
        key: "destinationOpen",
        value: function destinationOpen(destinationRow, destinationCol) {

            var tiles = this.gridRef.tiles;

            if (destinationRow >= this.gridRef.rows || destinationRow < 0 || destinationCol >= this.gridRef.cols || destinationCol < 0) {
                return false;
            }

            if (tiles[destinationRow][destinationCol] !== undefined) {
                if (tiles[destinationRow][destinationCol] != this) {
                    return false;
                }
            }

            return true;
        }
    }, {
        key: "setColourBasedValue",
        value: function setColourBasedValue() {
            switch (this.value) {
                case 2:
                    this.changeColour(styleNames.grey);
                    break;
                case 4:
                    this.changeColour(styleNames.grey);
                    break;
                case 8:
                    this.changeColour(styleNames.blue);
                    break;
                case 16:
                    this.changeColour(styleNames.blue);
                    break;
                case 32:
                    this.changeColour(styleNames.green);
                    break;
                case 64:
                    this.changeColour(styleNames.green);
                    break;
                case 128:
                    this.changeColour(styleNames.purple);
                    break;
                case 256:
                    this.changeColour(styleNames.pink);
                    break;
                case 512:
                    this.changeColour(styleNames.yellow);
                    break;
                case 1024:
                    this.changeColour(styleNames.red);
                    break;
                case 2048:
                    this.changeColour(styleNames.orange);
                    break;
            }
        }
    }, {
        key: "destory",
        value: function destory() {
            var _this2 = this;

            this.changeSize(true);
            setTimeout(function () {
                if (_this2.tileElem.parentNode != null) {
                    _this2.tileElem.parentNode.removeChild(_this2.tileElem);
                    delete _this2;
                }
            }, 250);
        }
    }, {
        key: "setWinningBlock",
        value: function setWinningBlock() {
            this.changeColour(styleNames.orange);
            this.moveTo(0, 0);
            this.removeSizeClass();
            this.addClass(styleNames.winning);
        }
    }]);

    return Tile;
}();

var styleNames = {
    newBlock: "new-block",
    small: "small-block",
    winning: "winning-block",

    grey: "grey-block",
    blue: "blue-block",
    green: "green-block",
    purple: "purple-block",
    pink: "pink-block",
    yellow: "yellow-block",
    red: "red-block",
    orange: "orange-block"
};

var Vector = function () {
    function Vector(x, y) {
        _classCallCheck(this, Vector);

        this.x = x;
        this.y = y;
    }

    _createClass(Vector, [{
        key: "equal",
        value: function equal(otherVector) {
            return this.x == otherVector.x && this.y == otherVector.y;
        }
    }, {
        key: "sqrMagnitude",
        get: function get() {
            return Math.pow(this.x, 2) + Math.pow(this.y, 2);
        }
    }, {
        key: "magnitude",
        get: function get() {
            return Math.sqrt(this.sqrMagnitude);
        }
    }, {
        key: "angle",
        get: function get() {
            return Math.atan(this.y / this.x);
        }
    }], [{
        key: "add",
        value: function add(vectorA, vectorB) {
            return new Vector(vectorA.x + vectorB.x, vectorA.y + vectorB.y);
        }

        // Subtract in this way: VectorA - VectorB

    }, {
        key: "subtract",
        value: function subtract(vectorA, vectorB) {
            return new Vector(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
        }
    }, {
        key: "left",
        get: function get() {
            return new Vector(-1, 0);
        }
    }, {
        key: "right",
        get: function get() {
            return new Vector(1, 0);
        }
    }, {
        key: "up",
        get: function get() {
            return new Vector(0, 1);
        }
    }, {
        key: "down",
        get: function get() {
            return new Vector(0, -1);
        }
    }]);

    return Vector;
}();

var game = void 0;

window.onload = function () {
    game = new Game("game", 512, 512);
    game.grid = new Grid(4, 650);
    game.start();
    game.setupScale();
};

window.onresize = function () {
    window.gameRef.setupScale();
};