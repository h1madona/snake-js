//creating the game in a self-executing function, to enhance security.
var game = (function(){
    //all settings related to the game goas in a settings object.
    var settings = {
        status: "started",
        cellSize: 40,
        netHeight: 15,
        netWidth: 15,
        canvas: null,
        ctx: null
    };
    //this function will initialize the game with the default settings.
    var init = function(){
        settings.status = "started";
		drawGrid();
        snake.direction = "right";
        snake.speed = 300;
        snake.cells = [[Math.floor(settings.netWidth/2), Math.floor(settings.netHeight/2)]];
        snake.draw(snake.cells[snake.cells.length-1]);
        food.draw();
        snake.move("right");

    };
    
    //this function will draw the grid of (15*15) cells, with a default size 40 for each cell.
    var drawGrid = function(){
        settings.canvas = document.getElementById("canvas");
        settings.canvas.width = settings.netWidth * settings.cellSize;
        settings.canvas.height = settings.netHeight* settings.cellSize;
        settings.ctx = settings.canvas.getContext("2d");
      //looping through and draw each line in our two-dimentional grid.
        for(var i=0; i<settings.netHeight; i++){
            for(var j=0; j<settings.netWidth; j++){
                settings.ctx.beginPath();
                settings.ctx.moveTo(i*settings.cellSize, j*settings.cellSize);
                settings.ctx.lineTo(i*settings.cellSize, j*settings.cellSize+settings.cellSize);
                settings.ctx.lineTo(i*settings.cellSize+settings.cellSize, j*settings.cellSize+settings.cellSize);
                settings.ctx.lineTo(i*settings.cellSize+settings.cellSize, j*settings.cellSize);
                settings.ctx.lineTo(i*settings.cellSize, j*settings.cellSize);
                settings.ctx.stroke();
            }
        }
    };
    //a snake object that will handle the properties of the snake, like color, size, and how to draw and erase the snake.
    var snake = {
        cells: [[Math.floor(settings.netWidth/2), Math.floor(settings.netHeight/2)]],
        direction: "right",
        color: "#6e9be5",
        speed: 300,
        canChangeDirection: true, // this property exists to prevent unwanted effect of quickly pressing different keys.
        draw: function(coords, color){   
           settings.ctx.beginPath();
            //if the color is undefined, then draw a normal snake cell, other wise, draw a white cell to simulate erasing.
            settings.ctx.fillStyle = color === undefined ? this.color:color;
            settings.ctx.fillRect(coords[0]*settings.cellSize+3,
                                 coords[1]*settings.cellSize+3,
                                 settings.cellSize-6,
                                 settings.cellSize-6);
            settings.ctx.stroke();
        },
        //this function will handle the movement of the snake in different directions.
        move: function(direction){
            if(settings.status === "stopped")
                return; // if the game status is stopped, you can't move.
            var xPos = snake.cells[snake.cells.length-1][0];
            var yPos = snake.cells[snake.cells.length-1][1];
            switch(snake.direction){
                case "right":
                   xPos = xPos+1;
                    break;
                case "left":
                    xPos = xPos-1;
                    break;
                case "up":
                    yPos = yPos-1;
                    break;
                case "down":
                    yPos = yPos+1;
                    break;
            }
            snake.canChangeDirection = true;
            snake.cells.push([xPos, yPos]);
            if(snake.checkCollision([xPos, yPos])){
                return;
            }
            snake.draw(snake.cells[snake.cells.length-1]);
            if(snake.cells[snake.cells.length-1][0] === food.coords[0] && snake.cells[snake.cells.length-1][1] === food.coords[1] ){
                console.log("food eaten..");
                snake.speed-=40; // the less the number, the faster the snake will move.
               food.coords = getCoords();
                food.draw();
            }else{
                snake.erase(snake.cells.shift());
            }
             setTimeout(snake.move,snake.speed);
        },
        erase: function(coords){
            //draw a cell with the color white to simulte erasing it.
            var color = "#FFFFFF";
            snake.draw(coords, color);  
        },
        //a function to change the direction of the snake and preventing it from moving backward.
        setDirection: function(direction){
            if(snake.canChangeDirection){
                switch(direction){
                    case "left":
                        if(snake.direction !== "right")
                            snake.direction = direction;
                        break;
                    case "right":
                         if(snake.direction !== "left")
                            snake.direction = direction;
                        break;
                    case "up":
                         if(snake.direction !== "down")
                            snake.direction = direction;
                        break;
                    case "down":
                         if(snake.direction !== "up")
                            snake.direction = direction;
                        break;
                }
            }
            snake.canChangeDirection = false;
            
        },
        //this function will check if a collision has happened and will change the game status to stopped.
        checkCollision: function(coords){
            if(coords[0]<0 || coords[1]<0 || coords[0]>settings.netWidth-1 || coords[1]> settings.netHeight-1){
                console.log("wall collision!!!"); 
                settings.status = "stopped";
                return true;
            }else{
                 for(var i=0; i<snake.cells.length-1; i++){
                    if(snake.cells[i][0] === coords[0] && snake.cells[i][1] === coords[1]){
                        console.log("self collision!!!");
                        settings.status = "stopped";
                        return true;
                    }
                 }
                return false;
            }
        }
        
    };
    
    //this function will return a random coordinates, without colliding with the snake cells coordinates.
    var getCoords = function(){
      var xPos = Math.floor(Math.random()*settings.netWidth);
        var yPos = Math.floor(Math.random()*settings.netHeight);
        for(var i=0; i<snake.cells.length; i++){
            if(snake.cells[i][0] === xPos || snake.cells[i][1] === yPos){
                return getCoords();
            }
        }
        return [xPos, yPos];
    };
    
    //the food object handles the food properties, like color,  and drawing the food in a random position.
    var food = {
        coords: getCoords(),
        color: "#71edab",
        draw: function(){ 
            
            settings.ctx.beginPath();
            settings.ctx.fillStyle = this.color;
            settings.ctx.arc(this.coords[0]*settings.cellSize+settings.cellSize/2, this.coords[1]*settings.cellSize+settings.cellSize/2, settings.cellSize/2.5, 0, 2*Math.PI);
            settings.ctx.fill();

        } 
    };
    
    
    
    


    return {
        init: init,
        direction: snake.setDirection,
        getStatus: function(){
           return settings.status
        }
    };
})();

//setting listener on the arraws and space keys to change direction of the snake, and to restart the game when stopped.
document.onkeyup = function(event){
    switch(event.keyCode){
        case 32: //if the game status is stopped, restart the game when space bar is pressed.
            if(game.getStatus() === "stopped"){
                  game.init()
            }
            break;
        case 37:
            game.direction("left");
            break;
        case 38:
            game.direction("up");
            break;
        case 39:
            game.direction("right");
            break;
        case 40:
            game.direction("down");
            break;
    }
};

//calling the game initializer after the window has loaded.
window.onload = function(){
    game.init(); 

}