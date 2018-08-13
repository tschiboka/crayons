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
                case "draw" : { drawOnCanvas(); break; }                               
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

    
    pencilIcon.addEventListener("click", () => { addToolCheck(pencilIcon.id); tool = "draw"});

    pointWidthIcon.addEventListener("click", () => {                
        console.log(tool);
        if (pointWidthPanel.style.visibility === "visible") pointWidthPanel.style.visibility = "hidden";
        else { 
           pointWidthPanel.style.visibility = "visible"; 
           document.getElementById("point-width-display").innerHTML = toolSettings.drawingWidth;
           document.getElementById("point-width-slider").value = toolSettings.drawingWidth;           
        } // end of else
    }); // end of pointWidthIcon listener

    shapesIcon.addEventListener("click", () => {

        // if panel is visible and icon is checked start shape set function
        if (shapesPanel.style.visibility === "visible") {
            switch(tool) {
                case "triangle": { setTriangle(); break; }
                case "square": { setSquare(); break; } 
                case "rectangle": { setRectangle(); break; }
                case "rounded-rectangle": { setRoundedRectangle(); break; }
            } // end of switch tool
        } // end of if visible
        shapesPanel.style.visibility = shapesPanel.style.visibility === "visible" ? "hidden" : "visible"; 
        // if hidden take off all check signes if any visible  
        if (shapesPanel.style.visibility === "hidden") {
            ["pencil-icon", "shape-triangle", "shape-square", "shape-rectangle", "shape-rounded-rectangle", "shape-circle", "shape-ellipse"]
            .forEach(t => document.getElementById(`${t}-check`).style.visibility = "hidden");
        } // end of if
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



/* addPositioner adds as many points to the surface (arg0) as arg1, which will be used to set geometric shape
   coordiantes (coord) on the canvas. Note coord is an array (arg2), which looks like the following 
   ([[X1,Y1],[X2Y2]...]) if coord length differs from num, exception is thrown! */
function addPositioner(worktop, num, coords) {
    // check if num corrisponds to coords' length
    if (num !== coords.length) throw new Error("Error on calling addPositioner function! Coordinates length don't match! (" + num + ") (" + coords.length + ")");
    else {        
        // create positioners num times
        for (let i = 1; i <= num; i++) {
            newPositioner = document.createElement("div");
            newPositioner.id = "positioner"+i;                  // id
            newPositioner.classList.add("positioner");          // class
            newPositioner.style.left = coords[i - 1][0] + "px"; // left
            newPositioner.style.top = coords[i - 1][1] + "px";  // top
            newPositioner.title = `[${newPositioner.style.left.match(/\d+/)}, ${newPositioner.style.top.match(/\d+/)}]`;
            worktop.appendChild(newPositioner); 
        } // end of for     
    } // end of else
} // end of addPositioner




/* 
    General shape drawing function. It takes positioner number as argument1, so it can be flexibly used, and drawingfunction
    as a secound argument. The caller function is sending its own drawing function, so drawing won't make this function bigger
    than it's necessary.
*/
function anyShapeDrawing(positionerNum, drawingFunction) {
    const workCanvas        = document.getElementById("pseudo-canvas"),       // the canvas we put the temporary drawings
          workTop           = document.getElementById("worktop"),             // the div we put the positioners on
          helper            = document.getElementById("worktop-helper"),      // helper div where we can press ok, or cancel
          helperYes         = document.getElementById("worktop-helper-check"),// ok "button" (div)
          helperNo          = document.getElementById("worktop-helper-close"),// cancel "button"
          positioners       = document.getElementsByClassName("positioner"),  // the positioners will give the basic coordinates of every shapes
          positionerClicked = Array(positionerNum).fill(false);               // array that holds maximum 1 true value, the currently active positioners. the true id is the active ids position +1.

    workCanvas.style.visibility = workTop.style.visibility = helper.style.visibility = "visible";

    // EVENTS

    let oldPositionX, oldPositionY; // they're gonna get there value from mousedown event

    if (tool === "rounded-rectangle") {  // set helper for rounded rectangle and add event-handlers
        const helper    = document.getElementById("worktop-helper-rounded-rectangle"),               // change helper div to the rounded rectangle one
              helperYes = document.getElementById("worktop-helper-rounded-rectangle-check"), 
              helperMin = document.getElementById("worktop-helper-rounded-rectangle-arrow-left"),    // left arrow decrease number
              helperRad = Number(document.getElementById("worktop-helper-rounded-rectangle-number")),// number represents the radius of the rounde rectangle
              helperMax = document.getElementById("worktop-helper-rounded-rectangle-arrow-right"),   // right arrow increase number
              helperNo  = document.getElementById("worktop-helper-rounded-rectangle-close");

        helperMin.addEventListener("click", () => { helperRad = helperRad <=-20 ? --helperRad : helperRad; }); // decrease radius
        console.log(helper);

    } // end of if rounded-rectangle

    helperYes.addEventListener("click", () => { drawingFunction(ctx); });

    helperNo.addEventListener("click", () => { closeWorkTop(); });

    [...positioners].forEach(e => {
        e.addEventListener("mousedown", function (event) {
            event.preventDefault(); // prevent text selection while dragging 
            positionerClicked[Number(this.id.match(/\d/)) - 1] = true;
            oldPositionX = event.pageX;
            oldPositionY = event.pageY;
        }); // end of mousedown listener        
    }); // end of forEach    

    workTop.addEventListener("mouseup", function () { positionerClicked.map((e, i) => positionerClicked[i] = false); });  // workaround, positionerClicked is a constans, can't re-reference it        

    workTop.addEventListener("mousemove", function (event) {
        const positionerToDrag = document.getElementById("positioner" + Number(positionerClicked.findIndex(e => !!e) + 1)),
              leftmostX = Math.max(...[...positioners].map(p => Number(window.getComputedStyle(p).left.match(/\d+/)))), // find leftmost x position
              leftMostPositionerY = window.getComputedStyle(positioners[[...positioners].findIndex(p => window.getComputedStyle(p).left === leftmostX + "px")]).top;                                               
                  

        event.preventDefault(); // prevent text selection while dragging 
        if (positionerToDrag) {
            const diffXY = [event.pageX - oldPositionX, event.pageY - oldPositionY], // pixel movement xy
                  left = Number(positionerToDrag.style.left.match(/\d+/)),           // current left position 
                  top = Number(positionerToDrag.style.top.match(/\d+/)),             // current top position
                  newXY = [left + diffXY[0], top + diffXY[1]];                       // the newly calculated positon
           
            // set new positions

            switch (tool) {
                case "square": {
                    const corner = Number(positionerToDrag.id.match(/\d/) - 1),
                          findPositionerWherXIsToBeAdjusted = c =>[[0, 1], [1, 0], [2, 3], [3, 2]].filter(e => e[0] === c)[0][1],
                          findPositionerWherYIsToBeAdjusted = c =>[[0, 3], [1, 2], [2, 1], [3, 0]].filter(e => e[0] === c)[0][1],
                          xAdjust = document.getElementById("positioner" + (findPositionerWherXIsToBeAdjusted(corner) + 1)),
                          yAdjust = document.getElementById("positioner" + (findPositionerWherYIsToBeAdjusted(corner) + 1))
                          changeX = newXY[0] - left,
                          changeY = newXY[1] - top,
                          changeMin = Math.min(Math.abs(changeX), Math.abs(changeY)), // choose the smeller amount of change
                          changeAmount = changeMin > 5 ? 5 : changeMin, // and it cannot be grater then 5
                          changeXY = []; 

                    // set changeXY by scenario
                    switch (corner) {
                        case 0: { (changeX < 0 && changeY < 0) ? changeXY = [-Math.abs(changeAmount), -Math.abs(changeAmount)]
                                    : (changeX >= 0 && changeY >= 0) ? changeXY = [Math.abs(changeAmount), Math.abs(changeAmount)]
                                    : changeXY = [0, 0];
                                    break; }
                        case 1: { (changeX < 0 && changeY >= 0) ? changeXY = [-Math.abs(changeAmount), Math.abs(changeAmount)]
                                    : (changeX >= 0 && changeY < 0) ? changeXY = [Math.abs(changeAmount), -Math.abs(changeAmount)]
                                    : changeXY = [0, 0];
                                    break; }                       
                        case 2: { (changeX >= 0 && changeY >= 0) ? changeXY = [Math.abs(changeAmount), Math.abs(changeAmount)]
                                    : (changeX < 0 && changeY < 0) ? changeXY = [-Math.abs(changeAmount), -Math.abs(changeAmount)]
                                    : changeXY = [0, 0];
                                    break; } 
                        case 3: { (changeX < 0 && changeY >= 0) ? changeXY = [-Math.abs(changeAmount), Math.abs(changeAmount)]
                                   : (changeX >= 0 && changeY < 0) ? changeXY = [Math.abs(changeAmount), -Math.abs(changeAmount)]
                                   : changeXY = [0, 0];
                                   break; }                               
                    } // end of switch corner
                    
                    const X = 0 < (left + changeXY[0]) && (left + changeXY[0]) < 380 ? (left + changeXY[0]) : left,
                          Y = 0 < (top + changeXY[1]) && (top + changeXY[1]) < 300 ? (top + changeXY[1]) : top;
                    console.log(X, Y, changeAmount);
                    positionerToDrag.style.left  = X + "px"; // positions have to be in worktop!
                    positionerToDrag.style.top   = Y + "px";
                    xAdjust.style.left = window.getComputedStyle(positionerToDrag).left;
                    yAdjust.style.top = window.getComputedStyle(positionerToDrag).top; 
                    break;
                } // end of case square
                case "rectangle": {
                    const corner = Number(positionerToDrag.id.match(/\d/) - 1),
                          findPositionerWherXIsToBeAdjusted = c =>[[0, 1], [1, 0], [2, 3], [3, 2]].filter(e => e[0] === c)[0][1],
                          findPositionerWherYIsToBeAdjusted = c =>[[0, 3], [1, 2], [2, 1], [3, 0]].filter(e => e[0] === c)[0][1],
                          xAdjust = document.getElementById("positioner" + (findPositionerWherXIsToBeAdjusted(corner) + 1)),
                          yAdjust = document.getElementById("positioner" + (findPositionerWherYIsToBeAdjusted(corner) + 1));

                    positionerToDrag.style.left  = ((newXY[0] >= -4 && newXY[0] <= 375) ? newXY[0] : left) + "px"; // positions have to be in worktop!
                    positionerToDrag.style.top   = ((newXY[1] >= -4 && newXY[1] <= 295) ? newXY[1] : top ) + "px";
                    xAdjust.style.left = window.getComputedStyle(positionerToDrag).left;
                    yAdjust.style.top = window.getComputedStyle(positionerToDrag).top; 
                    break;
                } // end of case rectangle
                default: {
                    positionerToDrag.style.left  = ((newXY[0] >= -4 && newXY[0] <= 375) ? newXY[0] : left) + "px"; // positions have to be in worktop!
                    positionerToDrag.style.top   = ((newXY[1] >= -4 && newXY[1] <= 295) ? newXY[1] : top ) + "px";
                } // end of default
            } // end of switch tool

            [oldPositionX, oldPositionY] = [event.pageX, event.pageY];               // refresh oldpositions
            positionerToDrag.title = `[${left}, ${top}]`;                            // reset title

            helper.style.left = (leftmostX - 60) + "px";
            helper.style.top = leftMostPositionerY;

            drawingFunction(); // redraw on mousemove
        } // end of if    
    }); // end of mousemove listener
    
    function closeWorkTop() {        
        workCanvas.style.visibility = helper.style.visibility = "hidden"; // work-canvas, helper disappears               
        const newWorkTop = workTop.cloneNode(true);                       // cloned node will not inherit listeners
        workTop.parentNode.replaceChild(newWorkTop, workTop);             // remove workTop eventlisteners         
        [...positioners].forEach(p => { newWorkTop.removeChild(p); });    // remove all positioners        
        newWorkTop.style.visibility = "hidden";                           // hide workTop  
    } // end of closeWorkTop 
    drawingFunction(); // prime shape on canvas
} // end of anyShapeDrawing




function setTriangle() {    
    const positioners = document.getElementsByClassName("positioner"),
          workTop = document.getElementById("worktop"),
          workCanvas = document.getElementById("pseudo-canvas");          

    function drawTriangle(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,              
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3] = [...coords], // spread back the numbers
              triangleCtx = context || workCanvas.getContext("2d"); // default is workCanvas

        // clear canvas if it's the worktop context        
        if (!context) triangleCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);

        // draw triangle
        triangleCtx.beginPath();
        triangleCtx.moveTo(x1, y1);
        triangleCtx.lineTo(x2, y2);
        triangleCtx.moveTo(x2, y2);
        triangleCtx.lineTo(x3, y3);
        triangleCtx.moveTo(x3, y3);
        triangleCtx.lineTo(x1, y1);
        triangleCtx.closePath();
        triangleCtx.lineWidth = toolSettings.drawingWidth;
        triangleCtx.strokeStyle = drawingColor;
        triangleCtx.stroke();        
    } // end of drawTriangle

    addPositioner(workTop, 3, [[180,50], [50,250], [330,250]]);

    anyShapeDrawing(3, drawTriangle);
} // end of setTriangle





function setSquare() {
    const positioners = document.getElementsByClassName("positioner"),
          workTop = document.getElementById("worktop"),
          workCanvas = document.getElementById("pseudo-canvas"); 


    function drawSquare(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,  
              X4 = positioners[3].style.left,
              Y4 = positioners[3].style.top,
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3, X4, Y4].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3, x4, y4] = [...coords]; // spread back the numbers 
              squareCtx = context || workCanvas.getContext("2d"); // default is workCanvas
        // clear canvas if it's the worktop context        
        if (!context) squareCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);

        // draw triangle
        squareCtx.beginPath();
        squareCtx.moveTo(x1, y1);
        squareCtx.lineTo(x2, y2);
        squareCtx.moveTo(x2, y2);
        squareCtx.lineTo(x3, y3);
        squareCtx.moveTo(x3, y3);
        squareCtx.lineTo(x4, y4);
        squareCtx.moveTo(x4, y4);
        squareCtx.lineTo(x1, y1);
        squareCtx.closePath();
        squareCtx.lineWidth = toolSettings.drawingWidth;
        squareCtx.strokeStyle = drawingColor;
        squareCtx.stroke();  
    } // end of drawSquare

    addPositioner(workTop, 4, [[140,100], [140,200], [240,200], [240,100]]);

    anyShapeDrawing(4, drawSquare);
} // end of setSquare





function setRectangle() {
    const positioners = document.getElementsByClassName("positioner"),
          workTop = document.getElementById("worktop"),
          workCanvas = document.getElementById("pseudo-canvas");

    function drawRectangle(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,  
              X4 = positioners[3].style.left,
              Y4 = positioners[3].style.top,
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3, X4, Y4].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3, x4, y4] = [...coords]; // spread back the numbers 
              rectangleCtx = context || workCanvas.getContext("2d"); // default is workCanvas
        // clear canvas if it's the worktop context        
        if (!context) rectangleCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);  
        // draw triangle
        rectangleCtx.beginPath();
        rectangleCtx.moveTo(x1, y1);
        rectangleCtx.lineTo(x2, y2);
        rectangleCtx.moveTo(x2, y2);
        rectangleCtx.lineTo(x3, y3);
        rectangleCtx.moveTo(x3, y3);
        rectangleCtx.lineTo(x4, y4);
        rectangleCtx.moveTo(x4, y4);
        rectangleCtx.lineTo(x1, y1);
        rectangleCtx.closePath();
        rectangleCtx.lineWidth = toolSettings.drawingWidth;
        rectangleCtx.strokeStyle = drawingColor;
        rectangleCtx.stroke();  
    } // end of drawSquare
    
    addPositioner(workTop, 4, [[100,100], [100,200], [280,200], [280,100]]);
    
    anyShapeDrawing(4, drawRectangle);
} // end of setRectangle
// git hub check




function setRoundedRectangle() {
    const positioners = document.getElementsByClassName("positioner"),
          workTop = document.getElementById("worktop"),
          workCanvas = document.getElementById("pseudo-canvas");

    function drawRoundedRectangle(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,  
              X4 = positioners[3].style.left,
              Y4 = positioners[3].style.top,
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3, X4, Y4].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3, x4, y4] = [...coords]; // spread back the numbers 
              roundedRectangleCtx = context || workCanvas.getContext("2d"); // default is workCanvas
        // clear canvas if it's the worktop context        
        if (!context) roundedRectangleCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);  
        // draw triangle
        roundedRectangleCtx.beginPath();
        roundedRectangleCtx.moveTo(x1, y1);
        roundedRectangleCtx.lineTo(x2, y2);
        roundedRectangleCtx.moveTo(x2, y2);
        roundedRectangleCtx.lineTo(x3, y3);
        roundedRectangleCtx.moveTo(x3, y3);
        roundedRectangleCtx.lineTo(x4, y4);
        roundedRectangleCtx.moveTo(x4, y4);
        roundedRectangleCtx.lineTo(x1, y1);
        roundedRectangleCtx.closePath();
        roundedRectangleCtx.lineWidth = toolSettings.drawingWidth;
        roundedRectangleCtx.strokeStyle = drawingColor;
        roundedRectangleCtx.stroke();  
    } // end of drawSquare
    
    addPositioner(workTop, 4, [[100,100], [100,200], [280,200], [280,100]]);
    
    anyShapeDrawing(4, drawRoundedRectangle);
} // end of setRoundedRectangle
 
