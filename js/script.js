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

    let holdingTimer;
    let holding = false;

    let paused = false;

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

    const titleContainer = document.querySelector("#title-container")

    titleContainer.style.width = (tilesAcross * tileSize)/dpr + "px";

    const ctx = c.getContext("2d");

    const arrowLeftBtn = document.querySelector("#arrow-left")
    const arrowRightBtn = document.querySelector("#arrow-right")
    const rotateLeftBtn = document.querySelector("#rotate-left")
    const rotateRightBtn = document.querySelector("#rotate-right")
    const pauseBtn = document.querySelector("#pause")

    const helpBtn = document.querySelector("#help-button")

    const replayBtn = document.querySelector("#replay-button")

    let highScores = localStorage.getItem("scores")
    if(highScores === null){
        highScores = []
    } else {
        highScores = JSON.parse(highScores)
    }
    
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

        replayBtn.classList.add("hidden")

        rotateLeftBtn.classList.remove("hidden")
        rotateRightBtn.classList.remove("hidden")
        arrowLeftBtn.classList.remove("hidden")
        arrowRightBtn.classList.remove("hidden")
        pauseBtn.classList.remove("hidden")

        holding = false;

        ctx.fillRect(0, 0, c.width, c.height);

        staticBlocks = Array.from({ length: tilesTall }, () => new Array(tilesAcross).fill(null))

        fb = new FallingBlock(Math.floor(Math.random()*7))

        scoreDisplay = new Text("", 0, 5, "rgb(255,255,255)", 32)
        scoreDisplay.setTextNumber(score, 8);

        levelDisplay = new Text("Level 1", 0, 40, "rgb(255,255,255)", 32)

        gameInterval = startGameInterval();
    }

    function startGameInterval(){
        paused = false;
        gameInterval = setInterval(()=>{
            if(fb.gamePossible){
                tick();
            } else{
                // console.log("Game Over")
                gameActive = false;
                highScores.push({
                    "score": score,
                    "level": level
                })
                clearInterval(gameInterval)

                highScores.sort((a, b) => b.score - a.score);

                localStorage.setItem("scores", JSON.stringify(highScores));

                setTimeout(()=>{
                    clearScreen(c, ctx)

                    replayBtn.classList.remove("hidden")
                    rotateLeftBtn.classList.add("hidden")
                    rotateRightBtn.classList.add("hidden")
                    arrowLeftBtn.classList.add("hidden")
                    arrowRightBtn.classList.add("hidden")
                    pauseBtn.classList.add("hidden")

                    let title = new Text("High Scores", c.width/2, 5, "rgb(255,255,255)", 56, "center")
                    title.draw(ctx)

                    let scoreSize = 36;
                    let scoreGap = 6;

                    let scoresToDisplay = Math.floor((c.height - 68)/(scoreSize+scoreGap))

                    let hasShown = false;

                    for(let i = 0; i < scoresToDisplay; i++){
                        let savedScore = 0;
                        let level = 1;
                        let textColour = "rgb(255,255,255)"
                        if(i < highScores.length){
                            savedScore = highScores[i].score
                            level = highScores[i].level
                        }
                        if(score == savedScore && !hasShown){
                            textColour = "rgb(0, 225, 255)"
                            hasShown = true;
                        }
                        let levelText = new Text("Level " + level, 0, 68 + i*scoreSize + i*scoreGap, textColour, scoreSize, "left")
                        levelText.draw(ctx)
                        let scoreText = new Text("", c.width, 64 + i*scoreSize + i*scoreGap, textColour, scoreSize, "right")
                        scoreText.setTextNumber(savedScore, 8)
                        levelText.draw(ctx)
                        scoreText.draw(ctx)
                    }

                }, 500)
            }
        }, tickInterval)
        return gameInterval;
    }

    function pauseInterval(interval){
        paused = true;
        clearInterval(interval)
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
    function togglePause(){
        if(paused){
            gameInterval = startGameInterval();
            pauseBtn.src = "images/pause.svg"
        } else{
            pauseInterval(gameInterval)
            let pausedText = new Text("PAUSED", c.width/2, c.height/2-26, "rgb(255,255,255)", 52, "center")
            pausedText.draw(ctx)
            pauseBtn.src = "images/resume.svg"
        }
    }

    helpBtn.addEventListener("click", ()=>{
        togglePause()
        clearScreen(c, ctx);

        new Text("CONTROLS", c.width/2, 5, "rgb(255,255,255)", 52, "center").draw(ctx)
        new Text("Move: arrow keys or arrow buttons", c.width/2, 60, "rgb(255,255,255)", 24, "center").draw(ctx)
        new Text("Rotate: Q E or rotate buttons", c.width/2, 90, "rgb(255,255,255)", 24, "center").draw(ctx)
        new Text("Soft Fall: down arrow or press and hold", c.width/2, 120, "rgb(255,255,255)", 24, "center").draw(ctx)
        new Text("Hard Fall: up arrow or tap screen", c.width/2, 150, "rgb(255,255,255)", 24, "center").draw(ctx)
        new Text("Pause: P or pause button", c.width/2, 180, "rgb(255,255,255)", 24, "center").draw(ctx)
        new Text("Unpause or press help again to clear", c.width/2, 210, "rgb(255,255,255)", 24, "center").draw(ctx)
    })

    replayBtn.addEventListener("click", ()=>{
        gameInit();
    })

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
            if(ev.key === "p"){
                togglePause()
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

    pauseBtn.addEventListener("click", ()=>{
        togglePause()
    })

    //doesn't work on mobile for some reason
    canvasContainer.addEventListener("dblclick", ()=>{
        if(gameActive){
            hardFall();
        }
    })

    canvasContainer.addEventListener("touchstart", (ev)=>{
        ev.preventDefault();
        holdingTimer = setTimeout(()=>{
            holding = true;
            softFallStart();
        }, 300)
    })

    canvasContainer.addEventListener("touchend", ()=>{
        clearInterval(holdingTimer)
        if(gameActive){
            if(holding){
                softFallEnd();
            } else{
                hardFall();
            }
        }
        holding = false;
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