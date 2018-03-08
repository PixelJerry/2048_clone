class Game {
    constructor( elementId, width, height){
        if (window.gameRef === undefined){
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
        }
        else
        {
            console.error("Can not have more than one Game running at the same time")
        }
    }

    static get deltaTime(){return 1000 / 60;}

    get moveThresholdSqr(){ return this.moveThreshold * this.moveThreshold; }

    start(){
        for (let i = 0; i <= this.grid.rows; i++){
            let halfLineWidth = 10 / 2;
            let horizontalDiv = createDiv("", ["divider-horizontal"], 0, (this.grid.tilePadding * 0.5) + (i * this.grid.tileSize) + (this.grid.tilePadding * i) - halfLineWidth);
            this.grid.tileElem.appendChild(horizontalDiv);

            let verticalDiv = createDiv("", ["divider-vertical"], (this.grid.tilePadding * 0.5) + (i * this.grid.tileSize) + (this.grid.tilePadding * i) - halfLineWidth, 0);
            this.grid.tileElem.appendChild(verticalDiv);
        }

        document.querySelector("#retry-button").addEventListener("click", (event) => {
            window.gameRef.restart();
        });

        document.querySelector("#start-button").addEventListener("click", (event) => {
            if (!window.gameRef.gameStarted){
                window.gameRef.gameStarted = true;
                window.gameRef.grid.spawnNewTile(2);

                let howToPlay = document.querySelector("#how-to-info");
                howToPlay.style.opacity = 0;
                setTimeout(() => {howToPlay.style.display = "none";}, 250);
            }
        });
    }

    setupScale(){
        let stageElem = document.querySelector("#stage");
        let stageHeight = 790;
        let stageWidth = 700;

        let scale = 1;

        if (window.innerWidth >= window.innerHeight){
            // Landscape
            scale = Math.min(window.innerHeight / stageHeight, 1);
            stageElem.style.transformOrigin = "50% 0%";

            if (window.innerHeight >= stageHeight){
                let stageTop = (window.innerHeight - stageHeight) * 0.5;
                stageElem.style.marginTop = stageTop + "px";
            }
            else{
                stageElem.style.marginTop = "0px";
                
            }
        }
        else{
            // Portrait
            scale = Math.min(window.innerWidth / stageWidth, 1);
            stageElem.style.transformOrigin = "0% 50%";
        }

        stageElem.style.transform = "scale(" + scale + ")";
		stageElem.style.webkitTransform = "scale(" + scale + ")";
		stageElem.style.MozTransform = "scale(" + scale + ")";
    }

    attachUpEventCallback(callback){this.upEventCallback = callback;}
    attachDownEventCallback(callback){this.downEventCallback = callback;}
    attachLeftEventCallback(callback){this.leftEventCallback = callback;}
    attachRightEventCallback(callback){this.rightEventCallback = callback;}
    attachTestEventCallback(callback){this.testEventCallback = callback;}

    addKeyboardListeners(){
		document.addEventListener("keydown", window.gameRef.keyDown);
        // document.addEventListener("keyup", window.gameRef.keyUp);
        document.addEventListener("touchstart", window.gameRef.touchStart);
        document.addEventListener("touchend", window.gameRef.touchEnd);
    }
    
    touchStart(event){
        //console.log("Touch start: (" + event.changedTouches[0].clientX + "," + event.changedTouches[0].clientY + ")");
        window.gameRef.touchStartPoint.x = event.changedTouches[0].clientX;
        window.gameRef.touchStartPoint.y = event.changedTouches[0].clientY;
    }

    touchEnd(event){
        //console.log("Touch start: (" + event.changedTouches[0].clientX + "," + event.changedTouches[0].clientY + ")");
        window.gameRef.touchEndPoint.x = event.changedTouches[0].clientX;
        window.gameRef.touchEndPoint.y = event.changedTouches[0].clientY;

        let directionVector = Vector.subtract(window.gameRef.touchEndPoint, window.gameRef.touchStartPoint);
        console.log(directionVector.sqrMagnitude + " > " + window.gameRef.moveThresholdSqr);

        let angle = directionVector.angle * radianToDegree;

        if (directionVector.sqrMagnitude > window.gameRef.moveThresholdSqr){
            if (directionVector.y > 0){
                // UP
                // Top Left
                if (angle > 0){
                    if (Math.abs(angle) < window.gameRef.moveAngleThreshold){
                        // console.log("right");
                        window.gameRef.rightButtonDown();
                    }
                    else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold){
                        // console.log("Down");
                        window.gameRef.downButtonDown();
                    }
                }
                else{ // Top right
                    if (Math.abs(angle) < window.gameRef.moveAngleThreshold){
                        // console.log("left");
                        window.gameRef.leftButtonDown();
                    }
                    else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold){
                        // console.log("Down");
                        window.gameRef.downButtonDown();
                    }
                }
            }
            else{
                // Down
                // Bottom Right
                if (angle > 0){
                    if (Math.abs(angle) < window.gameRef.moveAngleThreshold){
                        // console.log("left");
                        window.gameRef.leftButtonDown();
                    }
                    else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold){
                        // console.log("Up");
                        window.gameRef.upButtonDown();
                    }
                }
                else{ // Bottom left
                    if (Math.abs(angle) < window.gameRef.moveAngleThreshold){
                        // console.log("right");
                        window.gameRef.rightButtonDown();
                    }
                    else if (Math.abs(angle) > 90 - window.gameRef.moveAngleThreshold){
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

	keyDown(event){
        // left arrow
         if (event.which === 37){
             window.gameRef.leftButtonDown();
         }
        // right arrow
        if (event.which === 39){
            window.gameRef.rightButtonDown();
        }
        // up arrow
        if (event.which === 38){
            window.gameRef.upButtonDown();
        }
        // down arrow
        if (event.which === 40){
            window.gameRef.downButtonDown();
        }

        // Q for testing
        if (event.which === 81){
            if (window.gameRef.testEventCallback !== undefined){
                window.gameRef.testEventCallback();
            }
        }
    }
    
    leftButtonDown(){
        if (window.gameRef.gameOver) { return; }

        if (window.gameRef.grid.slideLeft()){
            window.gameRef.grid.spawnNewTile();
            window.gameRef.numberMoves++;
            window.gameRef.checkGameOver();
            // console.table(window.gameRef.grid.tiles);
        }
    }

    rightButtonDown(){
        if (window.gameRef.gameOver) { return; }

        if (window.gameRef.grid.slideRight()){
            window.gameRef.grid.spawnNewTile();
            window.gameRef.numberMoves++;
            window.gameRef.checkGameOver();
            // console.table(window.gameRef.grid.tiles);
        }
    }

    upButtonDown(){
        if (window.gameRef.gameOver) { return; }

        if (window.gameRef.grid.slideUp()){
            window.gameRef.grid.spawnNewTile();
            window.gameRef.numberMoves++;
            window.gameRef.checkGameOver();
            // console.table(window.gameRef.grid.tiles);
        }
    }
    
    downButtonDown(){
        if (window.gameRef.gameOver) { return; }

        if (window.gameRef.grid.slideDown()){
            window.gameRef.grid.spawnNewTile();
            window.gameRef.numberMoves++;
            window.gameRef.checkGameOver();
            // console.table(window.gameRef.grid.tiles);
        }
    }

    checkGameOver(){
        if(!this.gameOver && !this.grid.openTilesLeft()){
            if(!this.grid.validMovesLeft()){
                setTimeout(() => {window.gameRef.setGameOverState(false)}, 500);
            }
        }
    }

    setGameOverState(victory){
        let titleElem = document.querySelector("#game-over .title");
        let subTitleElem = document.querySelector("#game-over .sub-title");
        let retryButtonElem = document.querySelector("#retry-button");

        if (victory){
            let randomTest = randomInt(1, 4);
            switch(randomTest){
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
        }
        else{
            titleElem.innerHTML = "Game Over";
            subTitleElem.innerHTML = "No more moves available.";
            retryButtonElem.innerHTML = "Try Again";
        }

        this.gameOverElem.style.visibility = "visible";
        this.gameOverElem.style.opacity = "1";
    }

    get gameOver(){
        if (this.grid.gameOver){
            return true;
        }
        return false;
    }

    restart(){
        if (!this.restarting){
            for(let r = 0; r < this.grid.rows; r++){
                for(let c = 0; c < this.grid.cols; c++){
                    let tiles = this.grid.tiles;
                    if (tiles[r][c] !== undefined){
                        tiles[r][c].destory();
                        tiles[r][c] = undefined;
                    }
                }
            }
    
            this.grid.reset();

            this.grid.spawnNewTile(2);
    
            this.numberMoves = 1;
            this.gameOverElem.style.opacity = 0;
            setTimeout(() => {
                this.gameOverElem.style.visibility = "hidden";
            }, 300);
        }
    }
}
