var drawingColor = "black",                     // default drawing color
    canvas = document.getElementById("canvas"); // canvas    
    canvasX = 0,                                // mouse horizontal position on canvas
    canvasY = 0,                                // and vertical 
    lastDrawEventCoordinates = false;           // to connect the dots in drawing because mousemove is just not fast enough  
    ctx = canvas.getContext("2d"),              // canvas context
    mouseDown = false,                          // when mouse is pressed; 
    tool = "draw",                              // the default tool is simple drawing    
    toolSettings = {                            // the collection of the tools attributes
        drawingWidth : "4",                     // the sharpness of the pencil
    };


addPencilMouseListeners();
addColorPaletteMouseListener();
addCursorOverCanvasListener();
addMouseUpDownListener();
addPointWidthSliderListener();
addIconListeners();
addShapeListeners();


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
    }); // end of click listener
} // end of addColorPaletteMouseListener


function addCursorOverCanvasListener() {    
    canvas.addEventListener("mousemove", function(e) {
        const rect = e.target.getBoundingClientRect(); // get relative coordinates
        X = Math.round(e.pageX - rect.left); // calculate canvas X & Y (starngely returns decimal point numbers, so they're rounded)
        Y = Math.round(e.pageY - rect.top);
        canvasX = X; canvasY = Y;   // pass values to global vars            
        if(mouseDown) {
            switch (tool) {
                case "draw" : drawOnCanvas();
                case "triangle" : setTriangle();
            } // end of tool switch
        } // end of if mousedown                    
    }); // end of mousemove listener        
} // end of addCursorOverSheetListener


function addMouseUpDownListener() {    
    const body = document.getElementsByTagName("body")[0];

    body.addEventListener("mousedown", () => mouseDown = true);
    // whenever mouse button released clear mouse history for new linedraws
    body.addEventListener("mouseup", () => { mouseDown = false; lastDrawEventCoordinates = false; }); 
} // end of addCanvasMouseDownListener


function drawOnCanvas() {    
    // draw circle on canvas
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, toolSettings.drawingWidth / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = drawingColor;
    ctx.fill();        

    // if mouse has history (not false), connect the current circle with the previous one
    if (lastDrawEventCoordinates) {
        // draws a single line
        const connectDots = (X1,Y1, X2, Y2) => {
            ctx.beginPath();
            ctx.moveTo(X1, Y1);
            ctx.lineTo(X2, Y2);
            ctx.closePath();
            ctx.lineWidth = toolSettings.drawingWidth;
            ctx.strokeStyle = drawingColor;
            ctx.stroke();
            }; // end of connectDots            
        
        connectDots(lastDrawEventCoordinates[0], lastDrawEventCoordinates[1], canvasX, canvasY);
    } // end of if lastMouseEvent
    lastDrawEventCoordinates = [canvasX, canvasY]; // feed last update
} // end of drawOnCanvas


function addIconListeners() {
    const pencilIcon = document.getElementById("pencil-icon"),
          pointWidthIcon = document.getElementById("point-width-icon"),
          pointWidthPanel = document.getElementById("point-width-panel"),
          shapesIcon = document.getElementById("shapes-icon"),
          shapesPanel = document.getElementById("shapes-panel");


    pencilIcon.addEventListener("click", () => addToolCheck(pencilIcon.id));

    pointWidthIcon.addEventListener("click", () => {              
        if (pointWidthPanel.style.visibility === "visible") pointWidthPanel.style.visibility = "hidden";
        else { 
           pointWidthPanel.style.visibility = "visible"; 
           document.getElementById("point-width-display").innerHTML = toolSettings.drawingWidth;
           document.getElementById("point-width-slider").value = toolSettings.drawingWidth;           
        } // end of else
    }); // end of pointWidthIcon listener

    shapesIcon.addEventListener("click", () => {              
        shapesPanel.style.visibility = shapesPanel.style.visibility === "visible" ? "hidden" : "visible";        
    }); // end of shapesIcon listener
} // end of addIconListeners


function addPointWidthSliderListener() {
    const slider = document.getElementById("point-width-slider"),
          setWidth = () => document.getElementById("point-width-display").innerHTML = toolSettings.drawingWidth = slider.value;
    let sliderClicked = false;    
    
    slider.addEventListener("change", () => { setWidth(); }); // I had to write the literal clicks too (slider body didnt react)     
    slider.addEventListener("mouseup", () => {sliderClicked = false; });
    slider.addEventListener("mousedown", () => { sliderClicked = true; setWidth(); });  // if clicked change values
    slider.addEventListener("mousemove", () => { // if dragged change value as well
        if (sliderClicked) {
            document.getElementById("point-width-display").innerHTML = toolSettings.drawingWidth = slider.value;
        } // end of if
    }); // end of mousemove listener
} // end of addPointWidthSliderListener

function addShapeListeners() {
    const shapes = document.getElementsByClassName("shape-option"); // get all shapes

    [...shapes].forEach(sh => sh.addEventListener("click",function () { addToolCheck(this.id); })); // add listeners to all
} // end of addShapeListeners

function addToolCheck(id) {
    const toolsIds = ["pencil-icon", "shape-triangle", "shape-square", "shape-rectangle", "shape-rounded-rectangle", "shape-circle", "shape-ellipse"],
          tools = ["pencil", "triangle", "square", "rectangle", "rounded-rectangle", "circle", "ellipse"];

    // most of tools cancel out each other!
    toolsIds.forEach(t => document.getElementById(`${t}-check`).style.visibility = "hidden"); // reset all to hidden
    document.getElementById(`${id}-check`).style.visibility = "visible"; // set actual visible

    // set tool variable
    tool = tools[toolsIds.findIndex(e => e === id)];

    // if one of the shapes are selected, shape icon is checked
    document.getElementById("shapes-icon-check").style.visibility = ((/(triangle|square|rectangle|rounded-rectangle|circle|ellipse)/).test(tool)) ? "visible" : "hidden";
} // end of addToolCheck