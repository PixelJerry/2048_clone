class Grid{
    constructor(numRows, gridSize){
        this.rows = numRows;
        this.cols = numRows;
        this.gridSize = gridSize;
        this.tilePadding = 10;
        this.tileSize = (this.gridSize - (this.tilePadding * (this.rows + 1))) / this.rows;

        this.tiles = [];

        this.updateTiles = false;

        this.winningTile = undefined;

        for(let r = 0; r < this.rows; r++){
            this.tiles[r] = [];
            for(let c = 0; c < this.cols; c++){
                this.tiles[r][c] = undefined;
            }            
        }

        this.tileElem = document.querySelector("#game");
    }

    calculateTileTopLeftPoint(rowIndex, colIndex){
        let tileTopLeft = new Vector();
        tileTopLeft.y = this.tilePadding + (rowIndex * this.tilePadding) + (rowIndex * this.tileSize);
        tileTopLeft.x = this.tilePadding + (colIndex * this.tilePadding) + (colIndex * this.tileSize);

        return tileTopLeft;
    }

    openTilesLeft(){
        for(let r = 0; r < this.rows; r++){
            for(let c = 0; c < this.cols; c++){
                if (this.tiles[r][c] === undefined){ return true; }
            }
        }

        return false;
    }

    validMovesLeft(){
        for(let r = 0; r < this.rows; r++){
            for(let c = 0; c < this.cols; c++){
                if (this.tileCanNeighbours(this.tiles[r][c])){
                    return true;
                }
            }
        }

        return false;
    }

    tileCanNeighbours(tile){
        // top tile
        if (tile.rowIndex > 0) {
            if (this.tiles[tile.rowIndex - 1][tile.colIndex] !== undefined && 
                this.tiles[tile.rowIndex - 1][tile.colIndex].value == tile.value ){
                    return true;
                }
        }

        // bottom tile
        if (tile.rowIndex < this.rows - 1) {
            if (this.tiles[tile.rowIndex + 1][tile.colIndex] !== undefined && 
                this.tiles[tile.rowIndex + 1][tile.colIndex].value == tile.value ){
                    return true;
                }
        }

        // Left tile
        if (tile.colIndex > 0) {
            if (this.tiles[tile.rowIndex][tile.colIndex - 1] !== undefined && 
                this.tiles[tile.rowIndex][tile.colIndex - 1].value == tile.value ){
                    return true;
                }
        }

        // Right tile
        if (tile.colIndex < this.cols - 1) {
            if (this.tiles[tile.rowIndex][tile.colIndex + 1] !== undefined && 
                this.tiles[tile.rowIndex][tile.colIndex + 1].value == tile.value ){
                    return true;
                }
        }
    }

    spawnNewTile(numTiles){
        if (!this.openTilesLeft()){ return; }

        if (numTiles === undefined) { numTiles = 1; }

        for (let i = 0; i < numTiles; i++){
            let rowIndex;
            let colIndex;
    
            do{
                rowIndex = randomInt(0, this.rows - 1);
                colIndex = randomInt(0, this.cols - 1);
            }while(this.tiles[rowIndex][colIndex] !== undefined);
            
            game.grid.addTile(rowIndex, colIndex);

            // Added tile, doing a safety check
            if (!this.openTilesLeft()){ return; }
        }
    }

    addTile(rowIndex, colIndex){
        if (rowIndex >= 0 && rowIndex < this.rows &&
        colIndex >= 0 && colIndex < this.cols){
            let tileTopLeft = new Vector();
            let newTile = new Tile(new Vector(rowIndex, colIndex), this);

            this.tileElem.appendChild(newTile.tileElem);

            this.tiles[rowIndex][colIndex] = newTile;
        }
        else{ console.error("Grid index out of range, trying to add a new tile."); }
    }

    moveTile(tileToMove, tileDestinationRow, tileDestinationCol){
        // Clear the old grid spot
        this.tiles[tileToMove.rowIndex][tileToMove.colIndex] = undefined;

        tileToMove.moveTo(tileDestinationRow, tileDestinationCol);
        

        if (this.tiles[tileDestinationRow][tileDestinationCol] !== undefined){ 
            console.error("this move is invalid");
        }

        // Copy tile to move to new grid spot
        this.tiles[tileDestinationRow][tileDestinationCol] = tileToMove;
    }

    tryAbsorb(currentTile, tileToAbsorb){
        if (currentTile.value == tileToAbsorb.value){
            // This tile should absorb the next on in this row
            this.tiles[tileToAbsorb.rowIndex][tileToAbsorb.colIndex] = undefined;
            currentTile.absorb(tileToAbsorb);

            if (currentTile.value == 2048){ 
                this.gameWon(currentTile);
            }
            return true;
        }

        return false;
    }

    gameWon(winningTile){
        console.warn("GAME WON - need to finish game");

        // Clear the gird
        for(let row = 0; row < this.rows; row++){
            for(let col = 0; col < this.cols; col++){
                if (this.tiles[row][col] !== undefined && this.tiles[row][col] !== winningTile){
                    this.tiles[row][col].destory();
                }
            }
        }

        this.winningTile = winningTile;
        winningTile.setWinningBlock();

        setTimeout(() =>{
            window.gameRef.setGameOverState(true);
        }, 1000);
    }

    get gameOver(){
        //TODO Need to check if we have moves remaining
        if(this.winningTile == undefined){ return false; }
        
        return true;
    }

    slideLeft(){
        if (this.gameOver) { return; }

        let moved = false;
        // Start at the left side of the board
        for (let c = 0; c < this.cols; c++){
            for(let r = 0; r < this.rows; r++){
                let currentTile = this.tiles[r][c];

                if (currentTile !== undefined){
                    // We have a tile.
                    for(let testCol = c + 1; testCol < this.cols; testCol++){
                        let testTile = this.tiles[r][testCol];
                        if (testTile !== undefined && testTile !== currentTile){
                            // We have another tile
                            if (this.tryAbsorb(currentTile, testTile)){
                                // The tile was absorbed
                                if (this.winningTile !== undefined){
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
                    for(let colLeftIndex = c - 1; colLeftIndex >= 0; colLeftIndex--){
                        // The tile should move

                        // Find the first spot that is not open
                        let tileToMove = this.tiles[r][c];
                        let canMove = tileToMove.destinationOpen(tileToMove.rowIndex, colLeftIndex);

                        if (!canMove){
                            // Is this the first check?
                            if (colLeftIndex !== c - 1){
                                // Move to the previous spot
                                this.moveTile(tileToMove, tileToMove.rowIndex, colLeftIndex + 1);
                                moved = true;
                            }

                            break;
                        }
                        else if (colLeftIndex == 0){
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

    slideRight(){
        if (this.gameOver) { return; }
        
        let moved = false;
        // Start on the right side of the board
        for (let c = this.cols - 1; c >= 0; c--){
            for(let r = 0; r < this.rows; r++){
                let currentTile = this.tiles[r][c];

                if (this.tiles[r][c] !== undefined && !this.tiles[r][c].updated){
                    // We have a tile.
                    for(let testCol = c - 1; testCol >= 0; testCol--){
                        let testTile = this.tiles[r][testCol];
                        if (testTile !== undefined && testTile !== currentTile){
                            // We have another tile
                            if (this.tryAbsorb(currentTile, testTile)){
                                // The tile was absorbed
                                if (this.winningTile !== undefined){
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
                    for(let colRightIndex = c + 1; colRightIndex <= this.cols - 1; colRightIndex++){
                        // The tile should move

                        // Find the firs spot that is not open
                        let tileToMove = this.tiles[r][c];
                        let canMove = tileToMove.destinationOpen(tileToMove.rowIndex, colRightIndex);

                        if (!canMove){
                            // Is this the first check?
                            if (colRightIndex !== c + 1){
                                // Move to the previous spot
                                this.moveTile(tileToMove, tileToMove.rowIndex, colRightIndex - 1);
                                moved = true;
                            }

                            break;
                        }
                        else if (colRightIndex == this.cols - 1){
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

    slideUp(){
        if (this.gameOver) { return; }
        
        let moved = false;
        // Start at the top of the board
        for(let r = 0; r < this.rows; r++){
            for (let c = 0; c < this.cols; c++){
                let currentTile = this.tiles[r][c];

                if (this.tiles[r][c] !== undefined && !this.tiles[r][c].updated){
                    // We have a tile.
                    for(let testRow = r + 1; testRow < this.rows; testRow++){
                        let testTile = this.tiles[testRow][c];
                        if (testTile !== undefined && testTile !== currentTile){
                            // We have another tile
                            if (this.tryAbsorb(currentTile, testTile)){
                                // The tile was absorbed
                                if (this.winningTile !== undefined){
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
                    for(let rowUpIndex = r - 1; rowUpIndex >= 0; rowUpIndex--){
                        // The tile should move

                        // Find the firs spot that is not open
                        let tileToMove = this.tiles[r][c];
                        let canMove = tileToMove.destinationOpen(rowUpIndex, tileToMove.colIndex);

                        
                        if (!canMove){
                            // Is this the first check?
                            if (rowUpIndex !== r - 1){
                                // Move to the previous spot
                                this.moveTile(tileToMove, rowUpIndex + 1, tileToMove.colIndex);
                                moved = true;
                            }

                            break;
                        }
                        else if (rowUpIndex == 0){
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

    slideDown(){
        if (this.gameOver) { return; }
        
        let moved = false;
        // Start at the bottom of the board
        for(let r = this.rows - 1; r >= 0; r--){
            for (let c = 0; c < this.cols; c++){
                let currentTile = this.tiles[r][c];

                if (this.tiles[r][c] !== undefined && !this.tiles[r][c].updated){
                    // We have a tile.
                    for(let testRow = r - 1; testRow >= 0; testRow--){
                        let testTile = this.tiles[testRow][c];
                        if (testTile !== undefined && testTile !== currentTile){
                            // We have another tile
                            if (this.tryAbsorb(currentTile, testTile)){
                                // The tile was absorbed
                                if (this.winningTile !== undefined){
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
                    for(let rowDownIndex = r + 1; rowDownIndex <= this.rows - 1; rowDownIndex++){
                        // The tile should move

                        // Find the firs spot that is not open
                        let tileToMove = this.tiles[r][c];
                        let canMove = tileToMove.destinationOpen(rowDownIndex, tileToMove.colIndex);

                        if (!canMove){
                            // Is this the first check?
                            if (rowDownIndex !== r + 1){
                                // Move to the previous spot
                                this.moveTile(tileToMove, rowDownIndex - 1, tileToMove.colIndex);
                                moved = true;
                            }

                            break;
                        }
                        else if (rowDownIndex == this.rows - 1){
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

    reset(){
        this.winningTile = undefined;
    }

    get gameOver(){
        return this.winningTile !== undefined;
    }
}