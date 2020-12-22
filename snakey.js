const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

/** CONFIGURATION */
const initialSnakePos = [
    {x: 0, y: 0},
    {x: 0, y: 1},
    {x: 0, y: 2}
];

const obstacles = [
    ...getStarObstacle(11),
    ...getStarObstacle(20),
    {
        x: 11,
        y: 22
    }
];

/**
 * in miliseconds
 */
const SNAKE_SPEED = 150;

const scoreEl = document.getElementById("score");

const COLOR_PALLETE = {
    snake: '#284e06',
    food: '#284e06',
    superFood: '#9b59b6',
    obstacles: 'red'
}

const GAME_WIDTH = 350;
const GAME_HEIGHT = 300;

const UP = 38;
const LEFT= 37;
const DOWN = 40;
const RIGHT = 39;


let snakeArr = [...initialSnakePos];
let foodPos = {x: 7, y: 7};
let specialFoodHasSpawned = false;

const foodProvider = {
    food: foodPos,
    superfood: {}
}

let keyPressed = DOWN;

/**
 * ACTUAL GAMEPLAY
 */
window.addEventListener("load", (event) => {
    /**
     * Game interval
     */
    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDrawable(snakeArr);
        drawDrawable(obstacles, COLOR_PALLETE.obstacles);
        drawFood(foodProvider.food.x,foodProvider.food.y);

        if (specialFoodHasSpawned) {
            drawFood(foodProvider.superfood.x, foodProvider.superfood.y, COLOR_PALLETE.superFood);
        }

        /**
         * Create a copy of the snake without the head
         * to test if the snake collides with itself.
         */
        let sncp = [...snakeArr];
        sncp.pop();

        if (isCollision(snakeArr[snakeArr.length - 1], [...sncp]) || isCollision(snakeArr[snakeArr.length - 1], obstacles)) {
            resetGame();
        }
        
        if (
            snakeArr[snakeArr.length - 1].x === foodProvider.food.x &&
            snakeArr[snakeArr.length - 1].y === foodProvider.food.y
        ) {
            foodProvider.food = updateFoodPos();

            snakeArr = addTail(snakeArr, keyPressed);
        }

        if (
            snakeArr[snakeArr.length - 1].x === foodProvider.superfood.x &&
            snakeArr[snakeArr.length - 1].y === foodProvider.superfood.y
        ) {
            for (let i=0;i<foodProvider.superfood.value;i++) {
                snakeArr = addTail(snakeArr, keyPressed);
            }
            foodProvider.superfood = {};
        }

        switch(keyPressed) {
            case DOWN:
                snakeArr = moveDown(snakeArr);
                break;
            case UP:
                snakeArr = moveUp(snakeArr);
                break;
            case LEFT:
                snakeArr = moveLeft(snakeArr);
                break;
            case RIGHT:
                snakeArr = moveRight(snakeArr);
                break;
        }
    }, SNAKE_SPEED);

    /**
     * Add special food
     */
    setInterval( () => {
        specialFoodHasSpawned = true;
        foodProvider.superfood = updateFoodPos();
        foodProvider.superfood.value = Math.floor(Math.random() * 4) + 2;

        setTimeout( () => {
            foodProvider.superfood = {};
            specialFoodHasSpawned = false;
        }, 5000);
    }, 15 * 1000);

    window.addEventListener("keydown", (e) => {
        if (keyPressed === UP && e.keyCode === DOWN) return;
        if (keyPressed === DOWN && e.keyCode === UP) return;
        if (keyPressed === LEFT && e.keyCode === RIGHT) return;
        if (keyPressed === RIGHT && e.keyCode === LEFT) return; 
        keyPressed = e.keyCode
    });
})

function resetGame() {
    snakeArr = [...initialSnakePos];
    currentPoints = 0;
    scoreEl.innerHTML = "0000";
}

/**
 * @param {} head 
 * @param {} item
 * @returns {boolean}
 */
function isCollision(head, item) {

    let isCollision = false; 
    item.map( coordinates => {
        if (head.x === coordinates.x && head.y === coordinates.y) {
            isCollision = true;
        }
    })
    return isCollision;
}

function addTail(snake, keycode) {
    switch(keycode) {
        case UP:
            snake.unshift({x: snake[0].x,y: snake[0].y - 1});
            break;
        case DOWN:
            snake.unshift({x: snake[0].x,y: snake[0].y + 1});
            break;
        case LEFT:
            snake.unshift({x: snake[0].x + 1,y: snake[0].y});
            break;
        case RIGHT:
            snake.unshift({x: snake[0].x - 1,y: snake[0].y});
            break;
    }
    addPoints(scoreEl, 4);
    return snake;
}

function moveUp(snake) {
    let newX = snake[snakeArr.length - 1].x;
    let newY = snake[snakeArr.length - 1].y - 1;

    if (newY < 0) {
        newY = Math.floor(GAME_HEIGHT/10);
    }

    return setNewSnake(snake, newX, newY);  
}

function moveLeft(snake) {
    let newX = snake[snakeArr.length - 1].x - 1;
    let newY = snake[snakeArr.length - 1].y;

    if (newX < 0) {
        newX = Math.floor(GAME_WIDTH/10);
        console.log(newX);
    }

    return setNewSnake(snake, newX, newY); 
}

function moveDown(snake) {

    let newX = snake[snakeArr.length - 1].x;
    
    let newY = snake[snakeArr.length - 1].y + 1;
    if (newY >= Math.floor(GAME_HEIGHT/10)) {
        newY = 0;
    }

    return setNewSnake(snake, newX, newY);
}

function moveRight(snake) {
    let newX = snake[snakeArr.length - 1].x + 1;
    let newY = snake[snakeArr.length - 1].y;

    if (newX >= Math.floor(GAME_WIDTH/10)) {
        newX = 0;
    }

    return setNewSnake(snake, newX, newY); 
}

function updateFoodPos() {
    let x, y;

    let rerun;
    do {
        x = Math.floor(Math.random() * (parseInt((GAME_WIDTH/10))-1));
        y = Math.floor(Math.random() * (parseInt((GAME_HEIGHT/10))-1));

        rerun = false;
        for (let i=0;i<obstacles.length;i++) {
            if (obstacles[i].x === x && obstacles[i].y === y) {
                rerun = true;
            }
        }
        console.log(x,y);
    } while (rerun);

    return {x,y};
}

function setNewSnake(snake, x , y) {
    snake.shift();
    snake.push({x,y});
    return snake;
}

function drawSquare(x, y, size) {
    ctx.fillRect(x,y,size, size);
}

function drawFood(x,y, color = COLOR_PALLETE.food) {
    ctx.fillStyle = color;
    drawSquare(x * 10,y * 10,9);
}

function drawDrawable(snake, color = COLOR_PALLETE.snake) {
    ctx.fillStyle = color;
    snake.map( item => {
        drawSquare(item.x * 10, item.y * 10, 9);
    });
}

function addPoints(el, points) {
    let currentPoints = parseInt(el.innerHTML);
    currentPoints += points;

    if (currentPoints < 10) {
        el.innerHTML = `000${currentPoints}`;
    } else if (currentPoints < 100) {
        el.innerHTML = `00${currentPoints}`;
    } else if (currentPoints < 1000) {
        el.innerHTML = `0${currentPoints}`;
    } else {
        el.innerHTML = currentPoints;
    }
}

function getStarObstacle(center) {
    return [
        {x: center - 1, y: center - 1},
        {x: center, y: center - 1},
        {x: center + 1, y: center - 1},
        {x: center, y: center},
        {x: center, y: center - 2}
    ]
}

/** MOBILE GAMING */
function getTouchPos(canvas, touchEvent) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
}

canvas.addEventListener("touchstart", (e) => {
    let touchPos = getTouchPos(canvas, e);
    let snakeHeadPos = snakeArr[snakeArr.length - 1];

    console.log(touchPos, snakeHeadPos);

    if (keyPressed === UP || keyPressed === DOWN) {
        if (touchPos.x > snakeHeadPos.x * 10) keyPressed = RIGHT;
        if (touchPos.x < snakeHeadPos.x * 10) keyPressed = LEFT;
    } else {
        if (touchPos.y > snakeHeadPos.y * 10) keyPressed = DOWN;
        if (touchPos.y < snakeHeadPos.y * 10) keyPressed = UP;
    }

    console.log(keyPressed);
});