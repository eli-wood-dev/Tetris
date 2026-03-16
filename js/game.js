/**
 * Eli Wood
 * 2026-03-15
 * Contains classes to be used in script.js
 */

/**
 * Class for an individual block
 */
class Block {
    /**
     * Creates a block at a certain point on a grid with the specified colour
     * @param {Number} row the row the block is in
     * @param {Number} col the column the block is in
     * @param {String} colour the colour of the block formatted as "rgb(x,x,x)"
     * @param {String} borderColour the border colour of the block formatted as "rgb(x,x,x)"
     */
    constructor(row, col, colour, borderColour) {
        this.row = row;
        this.col = col;
        this.colour = colour;
        this.borderColour = borderColour;
    }

    /**
     * Draws the block with the specified size
     * @param {*} ctx current drawing context
     * @param {Number} tileSize the size of the tile grid
     * @param {Number} borderWidth The width of the border
     */
    draw(ctx, tileSize, borderWidth) {
        ctx.fillStyle = this.colour
        ctx.strokeStyle = this.borderColour
        ctx.lineWidth = borderWidth;
        let realX = this.col * tileSize
        let realY = this.row * tileSize
        ctx.fillRect(realX, realY, tileSize, tileSize)
        ctx.strokeRect(realX + borderWidth / 2, realY + borderWidth / 2, tileSize - borderWidth, tileSize - borderWidth)
    }

    /**
     * Draws a block at the specified location without needing to make an instance
     * @param {*} ctx current drawing context
     * @param {Number} tileSize the size of the tile grid
     * @param {Number} borderWidth The width of the border
     * @param {Number} row the row the block is in
     * @param {Number} col the column the block is in
     * @param {String} colour the colour of the block formatted as "rgb(x,x,x)"
     * @param {String} borderColour the border colour of the block formatted as "rgb(x,x,x)"
     */
    static draw(ctx, tileSize, borderWidth, row, col, colour, borderColour) {
        ctx.fillStyle = colour
        ctx.strokeStyle = borderColour
        ctx.lineWidth = borderWidth;
        let realX = col * tileSize
        let realY = row * tileSize
        ctx.fillRect(realX, realY, tileSize, tileSize)
        ctx.strokeRect(realX + borderWidth / 2, realY + borderWidth / 2, tileSize - borderWidth, tileSize - borderWidth)
    }
}

/**
 * Class for a falling collection of blocks
 */
class FallingBlock {
    /**
     * Creates a falling block with the specified shape
     * @param {Number} shape a number from 0 to 6 to represent the shape
     */
    constructor(shape) {
        this.reset(shape)
        this.gamePossible = true;
    }

    /**
     * Resets the block to the default state
     * Block colour depends on the shape
     * @param {Number} shape a number from 0 to 6 to represent the shape
     */
    reset(shape) {
        //top left
        this.x = 4;
        this.y = -2;//start off screen

        //3x3 by default, 4x4 for bar or square
        let width = shape >= 5 ? 4 : 3
        let height = shape >= 5 ? 4 : 3

        //initialize the matrix to store the piece, null by default
        let matrix = Array.from({ length: height }, () => new Array(width).fill(null))

        let colour;
        let borderColour;

        switch (shape) {
            case 0://T
                colour = "rgb(153, 0, 255)"
                borderColour = "rgb(91, 0, 136)"
                matrix[0][1] = new Block(this.y, this.x + 1, colour, borderColour)
                matrix[1][0] = new Block(this.y + 1, this.x, colour, borderColour)
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                matrix[1][2] = new Block(this.y + 1, this.x + 2, colour, borderColour)
                break;
            case 1://S
                colour = "rgb(0, 255, 0)"
                borderColour = "rgb(0, 136, 0)"
                matrix[0][1] = new Block(this.y, this.x + 1, colour, borderColour)
                matrix[0][2] = new Block(this.y, this.x + 2, colour, borderColour)
                matrix[1][0] = new Block(this.y + 1, this.x, colour, borderColour)
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                break;
            case 2://Z
                colour = "rgb(255, 0, 0)"
                borderColour = "rgb(136, 0, 0)"
                matrix[0][0] = new Block(this.y, this.x, colour, borderColour)
                matrix[0][1] = new Block(this.y, this.x + 1, colour, borderColour)
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                matrix[1][2] = new Block(this.y + 1, this.x + 2, colour, borderColour)
                break;
            case 3://L
                colour = "rgb(255, 170, 0)"
                borderColour = "rgb(136, 91, 0)"
                matrix[0][2] = new Block(this.y, this.x + 2, colour, borderColour)
                matrix[1][0] = new Block(this.y + 1, this.x, colour, borderColour)
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                matrix[1][2] = new Block(this.y + 1, this.x + 2, colour, borderColour)
                break;
            case 4://J
                colour = "rgb(0, 0, 255)"
                borderColour = "rgb(0, 0, 136)"
                matrix[0][0] = new Block(this.y, this.x, colour, borderColour)
                matrix[1][0] = new Block(this.y + 1, this.x, colour, borderColour)
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                matrix[1][2] = new Block(this.y + 1, this.x + 2, colour, borderColour)
                break;
            case 5://Bar
                colour = "rgb(0, 255, 255)"
                borderColour = "rgb(0, 136, 136)"
                matrix[1][0] = new Block(this.y + 1, this.x, colour, borderColour)
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                matrix[1][2] = new Block(this.y + 1, this.x + 2, colour, borderColour)
                matrix[1][3] = new Block(this.y + 1, this.x + 3, colour, borderColour)
                break;
            default://square
                colour = "rgb(255, 255, 0)"
                borderColour = "rgb(136, 136, 0)"
                matrix[1][1] = new Block(this.y + 1, this.x + 1, colour, borderColour)
                matrix[1][2] = new Block(this.y + 1, this.x + 2, colour, borderColour)
                matrix[2][1] = new Block(this.y + 2, this.x + 1, colour, borderColour)
                matrix[2][2] = new Block(this.y + 2, this.x + 2, colour, borderColour)
                break;
        }

        this.matrix = matrix
    }

    /**
     * Makes all current blocks into static blocks in the given matrix.
     * Used when the falling block can no longer fall.
     * @param {*} staticBlocks 2d array of blocks which store unmoving blocks
     * @returns true if all parts of the falling block land inside the bounds of the game
     */
    makeBlocksStatic(staticBlocks) {
        let possible = true;
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j++) {
                if (this.matrix[i][j] === null) {
                    continue;
                }
                if (i + this.y < 0) {
                    possible = false;
                    continue;
                }
                staticBlocks[i + this.y][j + this.x] = this.matrix[i][j]
            }
        }
        return possible;
    }

    /**
     * Makes the block fall by one tile, checking for collisions with static blocks
     * @param {*} staticBlocks 2d array of blocks which store unmoving blocks
     * @returns true if the block successfully fell
     */
    fall(staticBlocks) {
        //check blocks below
        let height = staticBlocks.length;

        for (const row of this.matrix) {
            for (const block of row) {
                if (block === null) {
                    continue;
                }

                if (block.row == height - 1 || staticBlocks[Math.max(block.row + 1, 0)][block.col] !== null) {
                    this.gamePossible = this.makeBlocksStatic(staticBlocks)
                    return false;
                }
            }
        }

        this.y += 1;
        for (const row of this.matrix) {
            for (const block of row) {
                if (block !== null) {
                    block.row += 1;
                }
            }
        }
        return true
    }

    /**
     * Moves the current block 1 tile in the specified direction if there is nothing in the way.
     * @param {Number} direction -1 for left, 1 for right
     * @param {*} staticBlocks 2d array of blocks which store unmoving blocks
     * @returns true if the block successfully moved
     */
    move(direction, staticBlocks) {
        direction = Math.sign(direction)
        //check blocks below
        let width = staticBlocks[0].length;

        for (const row of this.matrix) {
            for (const block of row) {
                if (block === null) {
                    continue;
                }

                //check for out of bounds
                if ((block.col == 0 && direction == -1) || (block.col == width - 1 && direction == 1) || staticBlocks[Math.max(block.row, 0)][block.col + direction] !== null) {
                    return false;
                }
            }
        }

        this.x += direction;
        for (const row of this.matrix) {
            for (const block of row) {
                if (block !== null) {
                    block.col += direction;
                }
            }
        }
        return true
    }

    /**
     * Attempts to rotate the block in the specified direction.
     * Fails if the rotation would result in the block being inside a static block or out of bounds
     * @param {Boolean} right true to rotate clockwise, false for counterclockwise
     * @param {*} staticBlocks 2d array of blocks which store unmoving blocks
     */
    rotate(right, staticBlocks) {
        const n = this.matrix.length;

        const transpose = () => {
            for (let i = 0; i < n; i++) {
                for (let j = i; j < n; j++) {
                    [this.matrix[i][j], this.matrix[j][i]] = [this.matrix[j][i], this.matrix[i][j]];
                }
            }
        }

        const reverse = () => {
            for (let i = 0; i < n; i++) {
                this.matrix[i].reverse();
            }
        }

        if (right) {
            transpose();
            reverse();
        } else {
            reverse();
            transpose();
        }

        this.fixBlockPlacements()

        //check if inside block, if so undo rotation
        let possible = true;

        for (const row of this.matrix) {
            for (const block of row) {
                if (block === null) {
                    continue;
                }

                if (block.col < 0 || block.col > staticBlocks[0].length || (block.row >= 0 && staticBlocks[Math.max(block.row, 0)][block.col] !== null)) {
                    possible = false;
                }
            }
        }

        if (!possible) {
            this.rotate(!right, staticBlocks)//undo
        }
        //may fail if the block tries to rotate from an impossible position to another impossible position
    }

    /**
     * Makes all the blocks drawing coordinates line up with their position in the matrix.
     * Meant to be used after rotating or moving
     */
    fixBlockPlacements() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix.length; j++) {
                if (this.matrix[i][j] === null) {
                    continue;
                }
                this.matrix[i][j].row = i + this.y
                this.matrix[i][j].col = j + this.x
            }
        }
    }

    /**
     * Draws all blocks in the current falling block
     * @param {*} ctx current drawing context
     * @param {Number} tileSize the size of the tile grid
     * @param {Number} borderWidth The width of the border on each block
     */
    draw(ctx, tileSize, borderWidth) {
        for (const row of this.matrix) {
            for (const block of row) {
                if (block !== null) {
                    block.draw(ctx, tileSize, borderWidth)
                }
            }
        }
    }
}

/**
 * Handles drawing logic for text
 */
class Text {
    /**
     * Creates an object for drawing text on the canvas
     * @param {String} text The text to be displayed
     * @param {Number} x x coordinate of the text origin (left by default)
     * @param {Number} y y coordinate of the top
     * @param {String} colour Text colour formatted like rgb(x,x,x)
     * @param {Number} size Font size in px
     * @param {String} align Text alignment. Defaults to left
     * @param {String} font Font to use for the text. Defaults to sans-serif
     * @param {String} fontStyling additional font styling like italic or bold. Defaults to ""
     */
    constructor(text, x, y, colour, size, align = "left", font = "sans-serif", fontStyling = "") {
        this.text = text;
        this.colour = colour;
        this.x = x;
        this.y = y;
        this.size = size;
        this.align = align;
        this.font = font;
        this.fontStyling = fontStyling;
    }

    /**
     * Formats a number with leading zeros for displaying
     * @param {Number} num the number to be formatted
     * @param {Number} minLength minimum digit count
     */
    setTextNumber(num, minLength) {
        const formattedNum = num.toLocaleString('en-US', {
            minimumIntegerDigits: minLength,
            useGrouping: false
        });
        this.text = formattedNum;
    }

    /**
     * Draws the text based on the data specified in the constructor
     * @param {*} ctx current drawing context
     */
    draw(ctx) {
        ctx.font = this.fontStyling + " " + this.size + "px " + this.font;
        ctx.fillStyle = this.colour;
        ctx.textBaseline = "hanging";
        ctx.textAlign = this.align;
        ctx.fillText(this.text, this.x, this.y);
    }
}