window.addEventListener("load", ()=>{
    const tilesAcross = 10;
    const tilesTall = 18;//gameboy size

    const tickInterval = 20;
    const baseFallFrequency = 25;
    let fallFrequency = baseFallFrequency;
    const maxLevel = 16;

    //declare variables for global use, initialized in gameInit
    let staticBlocks
    let fb
    let scoreDisplay
    let gameInterval;
    let level
    let levelDisplay
    let levelIncreaseFrequency
    let totalBlocks
    let frame
    let score
    let fastFalling

    let gameActive = false;

    const c = document.querySelector("#canvas")
    const canvasContainer = document.querySelector("#canvas-container")

    const dpr = window.devicePixelRatio || 1;

    const maxWidth = canvasContainer.clientWidth * dpr;
    const maxHeight = canvasContainer.clientHeight * dpr;

    const tileSize = Math.min(maxHeight/tilesTall, maxWidth/tilesAcross);
    c.width = tilesAcross * tileSize;
    c.height = tilesTall * tileSize

    c.style.height = (tilesTall * tileSize)/dpr + "px";
    c.style.width = (tilesAcross * tileSize)/dpr + "px";

    canvasContainer.style.height = (tilesTall * tileSize)/dpr + "px";

    const controlContainer = document.querySelector("#controls-container")

    controlContainer.style.width = (tilesAcross * tileSize)/dpr + "px";

    const ctx = c.getContext("2d");

    const arrowLeftBtn = document.querySelector("#arrow-left")
    const arrowRightBtn = document.querySelector("#arrow-right")
    const rotateLeftBtn = document.querySelector("#rotate-left")
    const rotateRightBtn = document.querySelector("#rotate-right")
    
    gameInit();

    function tick(){
        frame++;

        clearScreen(c, ctx)

        //handle falling blocks
        if(frame % fallFrequency == 0){
            let success = fb.fall(staticBlocks)

            if(!success){
                fb.reset(Math.floor(Math.random()*7))
                totalBlocks++;

                if(totalBlocks % levelIncreaseFrequency == 0){
                    level = Math.min(level+1, maxLevel);
                    fallFrequency = baseFallFrequency - (level-1);
                    levelDisplay.text = "Level " + level;
                }
            }

            if(fastFalling){
                score++
            }
        }

        //handle static blocks
        let toRemove = checkRows(staticBlocks)
        if(toRemove.length >= 1){
            score += toRemove.length * 100 * level
        }

        scoreDisplay.setTextNumber(score, 8);

        removeRows(staticBlocks, toRemove)
        fixDisplayRows(staticBlocks)
        drawBlocks(ctx, staticBlocks, tileSize)

        //draw falling block after static blocks to preserve outline
        fb.draw(ctx, tileSize, 2)
        
        scoreDisplay.draw(ctx)
        levelDisplay.draw(ctx)
    }

    function gameInit(){
        //initalize all global variables
        fallFrequency = baseFallFrequency;
        level = 1;
        levelIncreaseFrequency = 10;
        totalBlocks = 1;
        frame = 0;
        score = 0;
        fastFalling = false;

        gameActive = true;

        ctx.fillRect(0, 0, c.width, c.height);

        staticBlocks = Array.from({ length: tilesTall }, () => new Array(tilesAcross).fill(null))

        fb = new FallingBlock(Math.floor(Math.random()*7))

        scoreDisplay = new Text("", 0, 5, "rgb(255,255,255)", 32)
        scoreDisplay.setTextNumber(score, 8);

        levelDisplay = new Text("Level 1", 0, 40, "rgb(255,255,255)", 32)

        gameInterval = setInterval(()=>{
            if(fb.gamePossible){
                tick();
            } else{
                console.log("Game Over")
                gameActive = false;
                clearInterval(gameInterval)
            }
        }, tickInterval)
    }

    //define input functions to be used with ui or keyboard controls
    function moveLeft(){
        fb.move(-1, staticBlocks)
    }
    function moveRight(){
        fb.move(1, staticBlocks)
    }
    function hardFall(){
        while(fb.fall(staticBlocks)){
            score += 2;
        }

        scoreDisplay.setTextNumber(score, 8);

        fb.reset(Math.floor(Math.random()*7))
        totalBlocks++;

        if(totalBlocks % levelIncreaseFrequency == 0){
            level = Math.min(level+1, maxLevel);
            fallFrequency = baseFallFrequency - (level-1);
            levelDisplay.text = "Level " + level;
        }
    }
    /**
     * Begins soft falling.
     * Must only be called once when soft falling begins.
     */
    function softFallStart(){
        fallFrequency = Math.round(fallFrequency/10);
        fastFalling = true;
    }
    /**
     * Stops soft falling.
     */
    function softFallEnd(){
        fallFrequency = baseFallFrequency - (level-1);
        fastFalling = false;
    }
    function rotateLeft(){
        fb.rotate(false, staticBlocks)
    }
    function rotateRight(){
        fb.rotate(true, staticBlocks)
    }

    document.addEventListener("keydown", (ev)=>{
        //ignore user input when game is not being played
        if(gameActive){
            if(ev.key === "ArrowLeft"){
                moveLeft();
            }
            if(ev.key === "ArrowRight"){
                moveRight();
            }
            if(ev.key === "ArrowUp"){
                hardFall();
            }
            if(ev.key === "ArrowDown"){
                if(!ev.repeat){//first time only
                    softFallStart();
                }
            }
            if(ev.key === "q"){
                rotateLeft();
            }
            if(ev.key === "e"){
                rotateRight();
            }
        }
    })

    document.addEventListener("keyup", (ev)=>{
        if(gameActive){
            if(ev.key === "ArrowDown"){
                softFallEnd();
            }
        }
    })

    arrowLeftBtn.addEventListener("click", ()=>{
        if(gameActive){
            moveLeft();
        }
    })

    arrowRightBtn.addEventListener("click", ()=>{
        if(gameActive){
            moveRight();
        }
    })

    rotateLeftBtn.addEventListener("click", ()=>{
        if(gameActive){
            rotateLeft();
        }
    })

    rotateRightBtn.addEventListener("click", ()=>{
        if(gameActive){
            rotateRight();
        }
    })

    //doesn't work on mobile for some reason
    canvasContainer.addEventListener("dblclick", ()=>{
        if(gameActive){
            hardFall();
        }
    })
})

function drawBlocks(ctx, blocks, size){
    for (let i = 0; i < blocks.length; i++){
        for (let j = 0; j < blocks[i].length; j++){
            if(blocks[i][j] !== null){
                blocks[i][j].draw(ctx, size, 2)
            } else {
                Block.draw(ctx, size, 2, i, j, "rgba(0, 0, 0, 0)", "rgb(50, 50, 50)")
            }
        }
    }
}

function clearScreen(c, ctx){
    ctx.clearRect(0, 0, c.width, c.height);
}

function checkRows(blocks){
    let toRemove = [];
    for(let i = 0; i < blocks.length; i++){
        let remove = true;
        for(let j = 0; j < blocks[i].length; j++){
            if(blocks[i][j] === null){
                remove = false;
                break;
            }
        }
        if(remove){
            toRemove.push(i)
        }
    }
    return toRemove
}

function removeRows(blocks, rows){
    for (const row of rows){
        removeRow(blocks, row)
    }
    fixDisplayRows(blocks)
}

function removeRow(blocks, row){
    blocks.splice(row, 1)
    blocks.unshift(new Array(blocks[0].length).fill(null));
}

function fixDisplayRows(blocks){
    for(let i = 0; i < blocks.length; i++){
        for(let j = 0; j < blocks[i].length; j++){
            if(blocks[i][j] !== null){
                blocks[i][j].row = i;
                blocks[i][j].col = j;
            }
        }
    }
}