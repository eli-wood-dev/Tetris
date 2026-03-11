window.addEventListener("load", ()=>{
    const tilesAcross = 10;
    const tilesTall = 18;//gameboy size

    const tickInterval = 20;
    const baseFallFrequency = 25;
    let fallFrequency = baseFallFrequency;
    const maxLevel = 16;
    let level = 1;
    let levelIncreaseFrequency = 10;
    let totalBlocks = 1;
    let frame = 0;

    let score = 0;

    const c = document.querySelector("#canvas")
    const canvasContainer = document.querySelector("#canvas-container")

    const dpr = window.devicePixelRatio || 1;

    let maxWidth = canvasContainer.clientWidth * dpr;
    let maxHeight = canvasContainer.clientHeight * dpr;

    console.log(maxHeight)
    console.log(maxWidth)

    const tileSize = Math.min(maxHeight/tilesTall, maxWidth/tilesAcross);
    c.width = tilesAcross * tileSize;
    // const tileSize = c.width/tilesAcross//check for smallest of width*10 and height*18
    c.height = tilesTall * tileSize


    const ctx = c.getContext("2d")

    // ctx.scale(dpr, dpr)

    ctx.fillRect(0, 0, c.width, c.height);

    let staticBlocks = Array.from({ length: tilesTall }, () => new Array(tilesAcross).fill(null))

    let gameInterval;
    gameInterval = setInterval(()=>{
        if(fb.gamePossible){
            tick();
        } else{
            console.log("Game Over")
            clearInterval(gameInterval)
        }
    }, tickInterval)

    let fb = new FallingBlock(Math.floor(Math.random()*7))

    let scoreDisplay = new Text("", 0, 5, "rgb(255,255,255)", 32)
    scoreDisplay.setTextNumber(score, 8);

    let levelDisplay = new Text("Level 1", 0, 40, "rgb(255,255,255)", 32)

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
        }

        fb.draw(ctx, tileSize, 2)

        //handle static blocks
        let toRemove = checkRows(staticBlocks)
        if(toRemove.length >= 1){
            score += toRemove.length * 1000 * level
        }

        scoreDisplay.setTextNumber(score, 8);

        removeRows(staticBlocks, toRemove)
        fixDisplayRows(staticBlocks)
        drawBlocks(ctx, staticBlocks, tileSize)
        
        scoreDisplay.draw(ctx)
        levelDisplay.draw(ctx)
    }

    //temporary
    document.addEventListener("keydown", (ev)=>{
        if(ev.key === "ArrowLeft"){
            fb.move(-1, staticBlocks)
        }
        if(ev.key === "ArrowRight"){
            fb.move(1, staticBlocks)
        }
        if(ev.key === "ArrowUp"){
            while(fb.fall(staticBlocks));
            fb.reset(Math.floor(Math.random()*7))
            totalBlocks++;

            if(totalBlocks % levelIncreaseFrequency == 0){
                level = Math.min(level+1, maxLevel);
                fallFrequency = baseFallFrequency - (level-1);
                levelDisplay.text = "Level " + level;
            }
        }
        if(ev.key === "ArrowDown"){
            if(!ev.repeat){//first time only
                fallFrequency = Math.round(fallFrequency/10);
            }
        }
        if(ev.key === "q"){
            fb.rotate(false, staticBlocks)
        }
        if(ev.key === "e"){
            fb.rotate(true, staticBlocks)
        }
    })

    document.addEventListener("keyup", (ev)=>{
        if(ev.key === "ArrowDown"){
            fallFrequency = baseFallFrequency - (level-1);
        }
    })
})

function drawBlocks(ctx, blocks, size){
    for (col of blocks){
        for (block of col){
            if(block !== null){
                block.draw(ctx, size, 2)
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
    if(toRemove.length > 0){
        console.log(toRemove)
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