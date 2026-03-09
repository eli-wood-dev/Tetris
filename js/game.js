class Block{
    constructor(row, col, colour, borderColour){
        this.row = row;
        this.col = col;
        this.colour = colour;
        this.borderColour = borderColour;
    }

    draw(ctx, tileSize, borderWidth){
        ctx.fillStyle = this.colour
        ctx.strokeStyle = this.borderColour
        ctx.lineWidth = borderWidth;
        let realX = this.col * tileSize
        let realY = this.row * tileSize
        ctx.fillRect(realX, realY, tileSize, tileSize)
        ctx.strokeRect(realX+borderWidth/2, realY+borderWidth/2, tileSize-borderWidth, tileSize-borderWidth)
    }
}

class FallingBlock{
    constructor(){

    }
}