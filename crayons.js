var drawingColor = "black", // default drawing color
    canvas = document.getElementById("canvas"); // canvas    
    canvasX = 0, // mouse horizontal position on canvas
    canvasY = 0, // and vertical   
    ctx = canvas.getContext("2d"), // canvas context
    mouseDown = false, // when mouse is pressed; 
    tool = "draw", // the default tool is simple drawing
    toolSettings = { // the collection of the tools attributes
        drawingWidth : "5",
    };

addPencilMouseListeners();
addColorPaletteMouseListener();
addCursorOverCanvasListener();
addMouseUpDownListener();

function addPencilMouseListeners() {
    const colors = ["red", "pink", "orange", "yellow", "purple", "green", "blue", "brown", "white", "gray", "black"];
    // add eventlisteners to all the pencils dinamically, mapping through the color names
    colors.map((color) => {
        const pseudo = document.getElementById(`${color}-pencil-pseudo`),
              element = document.getElementById(`pencil-${color}`);
        pseudo.addEventListener("mouseenter", () => { 
            element.style.animation = "pencil-move-out 0.3s linear";
            element.style.WebkitAnimation = "pencil-move-out 0.3s linear";
            element.style.left = "-90px";
        });  // end of mouseenter
        pseudo.addEventListener("mouseout", () => { 
            element.style.animation = "pencil-move-in 0.6s linear"; 
            element.style.WebkitAnimation = "pencil-move-in 0.6s linear"; 
            element.style.left = "-60px";
        }); // end of mouseout    
        pseudo.addEventListener("click", ()=> {
            drawingColor = color;
            document.getElementById("color-display").style.background = color;
            // color dialog doesn't seem to accept html color names, so we'll convert them
            const colorMatrix = [["red", "ff0000"],["pink", "ffc0cb"],["orange", "ffa500"],["yellow", "ffff00"],["purple", "800080"],["green", "008000"],["blue", "0000ff"],["brown", "a52a2a"],["white", "ffffff"],["gray", "808080"],["black", "000000"]];
            const htmlColorToHex = (col) => `#${colorMatrix.filter(e => e[0] === col)[0][1]}`; // if [0] matches return [1]
            // when pencil is selected, color palettes dialog box default value changes as well
            document.getElementById("color-selector-dialog-box").value = htmlColorToHex(drawingColor);            
        }); // end of click 
    }); // end of color mapping
} // end of addPencilMouseListener

function addColorPaletteMouseListener() {
    const palette = document.getElementById("palette-icon");
    palette.addEventListener("click", () => {
        const dialog = document.getElementById("color-selector-dialog-box");
        dialog.addEventListener("change", () => { 
            drawingColor = dialog.value;
            document.getElementById("color-display").style.background = dialog.value;
        }); // end of change listener        
        dialog.click();
        dialog.style.backgroundColor = "#282c34";
        console.log(window.getComputedStyle(dialog).backgroundColor);
    }); // end of click listener
} // end of addColorPaletteMouseListener

function addCursorOverCanvasListener() {    
    canvas.addEventListener("mousemove", function(e) {
        const rect = e.target.getBoundingClientRect(); // get relative coordinates
        X = Math.round(e.pageX - rect.left); // calculate canvas X & Y (starngely returns decimal point numbers, so they're rounded)
        Y = Math.round(e.pageY - rect.top);
        canvasX = X; canvasY = Y;   // pass values to global vars    
        console.log(canvasX + " " + canvasY);
        if(mouseDown) {
            switch (tool) {
                case "draw" : drawOnCanvas();
            } // end of tool switch
        } // end of if mousedown                       
    }); // end of mousemove listener        
} // end of addCursorOverSheetListener

function addMouseUpDownListener() {    
    const body = document.getElementsByTagName("body")[0];
    body.addEventListener("mousedown", () => mouseDown = true);
    body.addEventListener("mouseup", () => mouseDown = false);
} // end of addCanvasMouseDownListener


function drawOnCanvas() {
    /*console.log(canvasX + " " + canvasY);*/
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, toolSettings.drawingWidth, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = drawingColor;
    ctx.fill();
    ctx.strokeStyle = drawingColor;
    ctx.stroke();
} // end of drawOnCanvas