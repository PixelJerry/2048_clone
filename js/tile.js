class Tile{
    constructor(gridIndex, gridRef){
        this.gridRef = gridRef;
        this.topLeftPoint = this.gridRef.calculateTileTopLeftPoint(gridIndex.x, gridIndex.y);

        this.rowIndex = gridIndex.x;
        this.colIndex = gridIndex.y;

        this.value = (random(0, 1) > 0.35) ? 2 : 4;

        this.tileElem = createDiv(this.value, [styleNames.newBlock, styleNames.grey], this.topLeftPoint.x, this.topLeftPoint.y);

        let tile = this;
        setTimeout(() => { tile.changeSize(); }, random(Game.deltaTime * 5, Game.deltaTime * 17));
    }

    changeColour(newColourClass){
        if (!this.tileElem.classList.contains(newColourClass)){
            this.removeColourClass();
            this.tileElem.classList.add(newColourClass);
        }
    }

    changeSize(destory = false){
        if (destory){
            this.removeSizeClass();
            this.addClass(styleNames.newBlock);
        }
        else{
            this.removeSizeClass();
            this.addClass(styleNames.small);
        }
    }

    removeSizeClass(){
        this.removeClass(styleNames.newBlock);
        this.removeClass(styleNames.small);
        this.removeClass(styleNames.winning);
    }

    removeColourClass(){
        this.removeClass(styleNames.grey);
        this.removeClass(styleNames.blue);
        this.removeClass(styleNames.green);
        this.removeClass(styleNames.purple);
        this.removeClass(styleNames.pink);
        this.removeClass(styleNames.yellow);
        this.removeClass(styleNames.red);        
        this.removeClass(styleNames.orange);        
    }

    addClass(classToAdd){
        if (!this.tileElem.classList.contains(classToAdd)){
            this.tileElem.classList.add(classToAdd);            
        }
    }

    removeClass(classToRemove){
        if (this.tileElem.classList.contains(classToRemove)){
            this.tileElem.classList.remove(classToRemove);            
        }
    }

    moveTo(rowIndex, colIndex){
        let temp = this.gridRef.calculateTileTopLeftPoint(rowIndex, colIndex);

        this.rowIndex = rowIndex;
        this.colIndex = colIndex;

        this.tileElem.style.left = temp.x + "px";
        this.tileElem.style.top = temp.y + "px";
    }

    absorb(tileToAbsorb){
        // Prevent tiles larger than 1 x 1 from absorbing themselves
        if (tileToAbsorb == this){return;}

        if (this.value === tileToAbsorb.value){
            this.value += tileToAbsorb.value;
            tileToAbsorb.destory;

            this.tileElem.innerHTML = this.value;

            this.setColourBasedValue();

            // Finally the absorbed tile should be destoryd
            tileToAbsorb.moveTo(this.rowIndex, this.colIndex);
            tileToAbsorb.destory();
        }
    }

    destinationOpen(destinationRow, destinationCol){
        
        let tiles = this.gridRef.tiles;

        if (destinationRow >= this.gridRef.rows || destinationRow < 0 || destinationCol >= this.gridRef.cols || destinationCol < 0){
            return false;
        }

        if (tiles[destinationRow][destinationCol] !== undefined){
            if (tiles[destinationRow][destinationCol] != this){
                return false;
            }   
        }

        return true;
    }

    setColourBasedValue(){
        switch(this.value){
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

    destory(){
        this.changeSize(true);
        setTimeout(() => {
            if(this.tileElem.parentNode != null){
                this.tileElem.parentNode.removeChild(this.tileElem);
                delete this;
            }
        }, 250)
    }

    setWinningBlock(){
        this.changeColour(styleNames.orange);
        this.moveTo(0, 0);
        this.removeSizeClass();
        this.addClass(styleNames.winning);
    }
}

let styleNames = {
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
}