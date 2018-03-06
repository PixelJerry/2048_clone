let game;

window.onload = function(){
    game = new Game("game", 512, 512);
    game.grid = new Grid(4, 650);
    game.start();
    game.setupScale();
}

window.onresize = function(){
    window.gameRef.setupScale();
}