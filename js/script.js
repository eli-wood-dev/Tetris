window.addEventListener("load", ()=>{
    const tilesAcross = 10;
    const tilesTall = 18;//gameboy size

    const tickInterval = 500;

    const c = document.querySelector("#canvas")
    const canvasContainer = document.querySelector("#canvas-container")

    c.width = canvasContainer.clientWidth;
    const tileSize = c.width/tilesAcross//check for smallest of width*10 and height*18
    c.height = tilesTall * tileSize

    const ctx = c.getContext("2d")
    ctx.fillRect(0, 0, c.width, c.height);

    let staticBlocks = Array.from({ length: tilesTall }, () => new Array(tilesAcross).fill(null))

    staticBlocks[17][5] = new Block(17,5,"rgb(255,0,0)", "rgb(136, 0, 0)");
    staticBlocks[17][4] = new Block(17,4,"rgb(255,0,0)", "rgb(136, 0, 0)")
    staticBlocks[16][4] = new Block(16,4,"rgb(255,0,0)", "rgb(136, 0, 0)")
    staticBlocks[16][3] = new Block(16,3,"rgb(255,0,0)", "rgb(136, 0, 0)")

    staticBlocks[17][3] = new Block(17,3,"rgb(0,0,255)", "rgb(0, 0, 136)")
    staticBlocks[17][2] = new Block(17,2,"rgb(0,0,255)", "rgb(0, 0, 136)")
    staticBlocks[17][1] = new Block(17,1,"rgb(0,0,255)", "rgb(0, 0, 136)")
    staticBlocks[17][0] = new Block(17,0,"rgb(0,0,255)", "rgb(0, 0, 136)")

    staticBlocks[17][6] = new Block(17,6,"rgb(0,255,0)", "rgb(0, 136, 0)")
    staticBlocks[17][7] = new Block(17,7,"rgb(0,255,0)", "rgb(0, 136, 0)")
    staticBlocks[17][8] = new Block(17,8,"rgb(0,255,0)", "rgb(0, 136, 0)")
    staticBlocks[17][9] = new Block(17,9,"rgb(0,255,0)", "rgb(0, 136, 0)")

    setInterval(tick, tickInterval)

    function tick(){
        clearScreen(c, ctx)

        //handle falling blocks

        //handle static blocks
        removeRows(staticBlocks, checkRows(staticBlocks))
        fixDisplayRows(staticBlocks)
        drawBlocks(ctx, staticBlocks, tileSize)
    }
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
    return toRemove
}

function removeRows(blocks, rows){
    for (row of rows){
        removeRow(blocks, row)
    }
    fixDisplayRows(blocks)
}

function removeRow(blocks, row){
    blocks.pop(row)
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