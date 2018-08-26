var drawingColor = "black",                           // default drawing color
    canvas       = document.getElementById("canvas"); // canvas    
    canvasX      = 0,                                 // mouse horizontal position on canvas
    canvasY      = 0,                                 // and vertical 
    lastDrawEventCoordinates = false;                 // to connect the dots in drawing because mousemove is just not fast enough  
    ctx          = canvas.getContext("2d"),           // canvas context
    mouseDown    = false,                             // when mouse is pressed; 
    tool         = "draw",                            // the default tool is simple drawing    
    toolSettings = {                                  // the collection of the tools attributes
        drawingWidth : "4",                           // the sharpness of the pencil    
    },    
    disableIcons = false;                             // if positioners are placed, you cannot click on tool icons



addPencilMouseListeners();
addColorPaletteMouseListener();
addCursorOverCanvasListener();
addMouseUpDownListener();
addPointWidthSliderListener();
addIconListeners();
addShapeListeners();
drawDashIcon();
drawLinesIcons();
addToggleListeners();




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
    const pencilIcon      = document.getElementById("pencil-icon"),
          pointWidthIcon  = document.getElementById("point-width-icon"),
          pointWidthPanel = document.getElementById("point-width-panel"),
          dashedIcon      = document.getElementById("dashed-icon"),
          dashedPanel     = document.getElementById("dashed-panel"),
          shapesIcon      = document.getElementById("shapes-icon"),
          shapesPanel     = document.getElementById("shapes-panel"), 
          linesIcon       = document.getElementById("lines-icon"), 
          linesPanel      = document.getElementById("lines-panel"),
          allToolsPanels  = [pointWidthPanel, dashedPanel, linesPanel, shapesPanel],
          closeAllPanels  = () => allToolsPanels.forEach(e => e.style.visibility = "hidden");          


    pencilIcon.addEventListener("click", () => {
        closeAllPanels();
        if(!disableIcons) addToolCheck(pencilIcon.id); tool = "draw"; 
    }); // end of pencilIcon Listener

    pointWidthIcon.addEventListener("click", () => {   
        if (pointWidthPanel.style.visibility === "visible") {
            pointWidthPanel.style.visibility = "hidden";
        }
        else { 
            closeAllPanels();                     
            pointWidthPanel.style.visibility = "visible"; 
            document.getElementById("point-width-display").innerHTML = toolSettings.drawingWidth;
            document.getElementById("point-width-slider").value = toolSettings.drawingWidth;           
        } // end of else
    }); // end of pointWidthIcon listener

    dashedIcon.addEventListener("click", () => {
        function drawDashSample() {
            const sample     = document.getElementById("dashed-line-sample"),
                  sampleCtx  = sample.getContext("2d");

            sampleCtx.beginPath();         
            sampleCtx.moveTo(10, 22);
            sampleCtx.lineTo(190, 22); 
            sampleCtx.closePath();  
            sampleCtx.lineWidth = toolSettings.drawingWidth;
            sampleCtx.strokeStyle = "#1a97e1";
            sampleCtx.stroke(); 
        } // end of drawDashSample


        if (dashedPanel.style.visibility === "visible") {
            dashedPanel.style.visibility = "hidden";
        } // end of if dashedPanel is visible
        else {
            closeAllPanels();
            dashedPanel.style.visibility = "visible";
            drawDashSample();
        } // end of dashedPanel is hidden
    }); // end of dashedIcon listener

    shapesIcon.addEventListener("click", () => {
        if (!disableIcons) {
            console.log(window.getComputedStyle(shapesPanel).visibility);
            // if panel is visible and icon is checked start shape set function
            if (shapesPanel.style.visibility === "visible") {
                switch(tool) {
                    case "triangle": { setTriangle(); break; }
                    case "square": { setSquare(); break; } 
                    case "rectangle": { setRectangle(); break; }
                    case "rounded-rectangle": { setRoundedRectangle(); break; }
                    case "circle": { setCircle(); break; }
                    case "ellipse": { setEllipse(); break; }
                } // end of switch tool
            } // end of if visible
            
            // if hidden take off all check signes if any visible  
            if (window.getComputedStyle(shapesPanel).visibility === "hidden") {
                closeAllPanels();
                shapesPanel.style.visibility = "visible";
                ["pencil-icon", "shape-triangle", "shape-square", "shape-rectangle", "shape-rounded-rectangle", "shape-circle", "shape-ellipse"]
                .forEach(t => document.getElementById(`${t}-check`).style.visibility = "hidden");
            } // end of if
            else shapesPanel.style.visibility = "hidden";
        } // end of if icon click is allowed        
    }); // end of shapesIcon listener
    
    linesIcon.addEventListener("click", () => {
        if (window.getComputedStyle(linesPanel).visibility == "hidden") {
            closeAllPanels();
            linesPanel.style.visibility = "visible";
        } // end of if iconpanel is hidden
        else {
            linesPanel.style.visibility = "hidden";
        } // end if it's visible
    }); // end of linesIcon listener
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
          positioners       = document.getElementsByClassName("positioner"),  // the positioners will give the basic coordinates of every shapes
          positionerClicked = Array(positionerNum).fill(false);               // array that holds maximum 1 true value, the currently active positioners. the true id is the active ids position +1.
          
    let   oldPositionX, oldPositionY,                                         // they're gonna get there value from mousedown event
          helper, helperYes, helperNo,
          helperMin, helperMax, helperRad, helperNum,                         // their value will depend on tools setting
          positionerSel = Array(positionerNum).fill(false);                   // right click selections on positioners, comes up with an array
          
    disableIcons = true; // disable, so the only way to escape is to click on helpers yes or no    

    // EVENTS
          
    // set helper for rounded rectangle and add event-handlers
    switch (tool) {  
        case "rounded-rectangle": {
            helper    = document.getElementById("worktop-helper-rounded-rectangle"),               // change helper div to the rounded rectangle one
            helperYes = document.getElementById("worktop-helper-rounded-rectangle-check"), 
            helperNo  = document.getElementById("worktop-helper-rounded-rectangle-close");
            helperMin = document.getElementById("worktop-helper-rounded-rectangle-arrow-left"),    // left arrow decrease number
            helperMax = document.getElementById("worktop-helper-rounded-rectangle-arrow-right"),   // right arrow increase number
            helperNum = document.getElementById("worktop-helper-rounded-rectangle-number"),        // the div holding the radius
            helperRad = Number(helperNum.innerHTML),                                               // number represents the radius of the rounde rectangle

            helperMin.addEventListener("click", () => { 
                helperNum.innerHTML = (helperRad = helperRad > -100 ? --helperRad : helperRad);
                drawingFunction(); // redraw when radius set
            }); // decrease radius

            helperMax.addEventListener("click", () => { 
                helperNum.innerHTML = (helperRad = helperRad < 100 ? ++helperRad : helperRad);
                drawingFunction(); // redraw when radius set
            }); // decrease radius            

            break;
        } // end of case rounded-rectangle
        default: {
            helper    = document.getElementById("worktop-helper"),       // helper div where we can press ok, or cancel
            helperYes = document.getElementById("worktop-helper-check"), // ok "button" (div)
            helperNo  = document.getElementById("worktop-helper-close"); // cancel "button"
        } // end of default
    } // end of switch tool for events  
    
           
    // helper Yes and No's functionality is the same for all the tools
    helperYes.addEventListener("click", () => { drawingFunction(ctx); });
    
    helperNo.addEventListener("click", () => { disableIcons = false; closeWorkTop(); });

    // set visibilities
    workCanvas.style.visibility = workTop.style.visibility = helper.style.visibility = "visible";
    
    [...positioners].forEach(e => {
        e.addEventListener("mousedown", function (event) {
            event.preventDefault(); // prevent text selection while dragging 
            positionerClicked[Number(this.id.match(/\d+/g)) - 1] = true; // set the clicked one true eg.: [false, true, false] for #positioner2
            oldPositionX = event.pageX;
            oldPositionY = event.pageY;
        }); // end of mousedown listener   

        // right click event
        e.addEventListener("contextmenu", function (event) { 
            event.preventDefault(); // prevent default menu popping up
            if (tool === "rounded-rectangle") { // can select and deselect corners
                const posNum = Number(this.id.match(/\d+/g) - 1); // the positons number in the array
                positionerSel[posNum] = positionerSel[posNum] ? false : true; // set position
                this.style.background = positionerSel[posNum] ? "rgb(250, 115, 115)" : "#282c34"; // set background, DON'T CHANGE COLOR! the drawing function is sorting out which is selected by color
                drawingFunction(); // redraw when selected
            } // end of if rounded rect
            return false; // need to return false otherwise default menu still pops up
        }); // end of right click listener    
    }); // end of forEach    
    
    workTop.addEventListener("mouseup", function () { positionerClicked.map((e, i) => positionerClicked[i] = false); });  // workaround, positionerClicked is a constans, can't re-reference it        
    
    workTop.addEventListener("mousemove", function (event) {
        const positionerToDrag = document.getElementById("positioner" + Number(positionerClicked.findIndex(e => !!e) + 1)),
        leftmostX = Math.max(...[...positioners].map(p => Number(window.getComputedStyle(p).left.match(/\d+/)))), // find leftmost x position
        leftMostPositionerY = window.getComputedStyle(positioners[[...positioners].findIndex(p => window.getComputedStyle(p).left === leftmostX + "px")]).top;                                               
        
        
        event.preventDefault(); // prevent text selection while dragging 
        if (positionerToDrag) {
            const diffXY = [event.pageX - oldPositionX, event.pageY - oldPositionY], // pixel movement xy
            left = Number(positionerToDrag.style.left.match(/\d+/)),                 // current left position 
            top = Number(positionerToDrag.style.top.match(/\d+/)),                   // current top position
            newXY = [left + diffXY[0], top + diffXY[1]];                             // the newly calculated positon
            
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
                    positionerToDrag.style.left  = X + "px"; // positions have to be in worktop!
                    positionerToDrag.style.top   = Y + "px";
                    xAdjust.style.left = window.getComputedStyle(positionerToDrag).left;
                    yAdjust.style.top = window.getComputedStyle(positionerToDrag).top; 
                    break;
                } // end of case square
                case "rounded-rectangle": {} // FALLTRUOGH IS INTENTIONAL !!!!! rounded rect has the same positioner bounding as rect
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
                case "ellipse": {
                    
                } // end of case ellipse           
                default: {
                    positionerToDrag.style.left  = ((newXY[0] >= -4 && newXY[0] <= 375) ? newXY[0] : left) + "px"; // positions have to be in worktop!
                    positionerToDrag.style.top   = ((newXY[1] >= -4 && newXY[1] <= 295) ? newXY[1] : top ) + "px";
                } // end of default
            } // end of switch tool
            
            [oldPositionX, oldPositionY] = [event.pageX, event.pageY]; // refresh oldpositions
            positionerToDrag.title = `[${left}, ${top}]`;              // reset title
            
            // set helper div's postion next to the leftMost positioner
            helper.style.left = (leftmostX - (tool === "rounded-rectangle" ? 90 : 60)) + "px"; // rounded rectangle has wider div
            helper.style.top = leftMostPositionerY;

            drawingFunction(); // redraw on mousemove
        } // end of if    
    }); // end of mousemove listener
    
    // close up work canvas and remove eventlisteners when close "x" is clicked
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
          workTop     = document.getElementById("worktop"),
          workCanvas  = document.getElementById("pseudo-canvas");          

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
          workTop     = document.getElementById("worktop"),
          workCanvas  = document.getElementById("pseudo-canvas"); 


    function drawSquare(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,  
              X4 = positioners[3].style.left,
              Y4 = positioners[3].style.top,
              W  = toolSettings.drawingWidth / 2, // the edges were a littlebit clumpsy, that's the correction   
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3, X4, Y4].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3, x4, y4] = [...coords]; // spread back the numbers 
              squareCtx = context || workCanvas.getContext("2d"); // default is workCanvas
        // clear canvas if it's the worktop context        
        if (!context) squareCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);

        // draw triangle
        squareCtx.beginPath();
        squareCtx.moveTo(x1, y1 - (y1 < y2 ? W : -W));  // correction works even if rectangle is "inside out"
        squareCtx.lineTo(x2, y2);
        squareCtx.moveTo(x2 - (x2 < x3 ? W : -W), y2);  // correction!
        squareCtx.lineTo(x3, y3);
        squareCtx.moveTo(x3, y3 + (y3 > y1 ? W : -W));  // correction!
        squareCtx.lineTo(x4, y4);
        squareCtx.moveTo(x4 + (x4 > x2 ? W : -W), y4);  // correction!
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
          workTop     = document.getElementById("worktop"),
          workCanvas  = document.getElementById("pseudo-canvas");

    function drawRectangle(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,  
              X4 = positioners[3].style.left,
              Y4 = positioners[3].style.top, 
              W  = toolSettings.drawingWidth / 2, // the edges were a littlebit clumpsy, that's the correction             
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3, X4, Y4].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3, x4, y4] = [...coords]; // spread back the numbers 
              rectangleCtx = context || workCanvas.getContext("2d"); // default is workCanvas
        // clear canvas if it's the worktop context        
        if (!context) rectangleCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);  
        // draw triangle
        rectangleCtx.beginPath();
        rectangleCtx.moveTo(x1, y1 - (y1 < y2 ? W : -W));  // correction works even if rectangle is "inside out"
        rectangleCtx.lineTo(x2, y2);
        rectangleCtx.moveTo(x2 - (x2 < x3 ? W : -W), y2);  // correction!
        rectangleCtx.lineTo(x3, y3);
        rectangleCtx.moveTo(x3, y3 + (y3 > y1 ? W : -W));  // correction!
        rectangleCtx.lineTo(x4, y4);
        rectangleCtx.moveTo(x4 + (x4 > x2 ? W : -W), y4);  // correction!
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
          workTop     = document.getElementById("worktop"),
          workCanvas  = document.getElementById("pseudo-canvas");

    function drawRoundedRectangle(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,  
              X4 = positioners[3].style.left,
              Y4 = positioners[3].style.top,
              R  = Number(document.getElementById("worktop-helper-rounded-rectangle-number").innerHTML), // radius
              W  = (cond, w = toolSettings.drawingWidth / 2) => cond ? w : -w, // the edges were a littlebit clumpsy, that's the correction
              SEL = [...positioners].map(e => window.getComputedStyle(e).backgroundColor === "rgb(250, 115, 115)"), // find selected positioners by background color
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3, X4, Y4].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3, x4, y4] = [...coords]; // spread back the numbers 
              roundedRectangleCtx = context || workCanvas.getContext("2d"); // default is workCanvas
        // clear canvas if it's the worktop context        
        if (!context) roundedRectangleCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);

        // draw triangle
        roundedRectangleCtx.beginPath();

        // CORNER 1 
        if (!SEL[0]) {                                                                             // draw arc if pos1 not selected
            R >= 0 ? roundedRectangleCtx.arc(x1 + R, y1 + R, R, Math.PI, Math.PI * 1.5, false)     // positive 
                   : roundedRectangleCtx.arc(x1, y1, Math.abs(R), 0, Math.PI * 0.5, false);        // negative
        } // end of if positioner 1 is not selected   
        roundedRectangleCtx.moveTo(x1, y1 + (!SEL[0] ? Math.abs(R) : 0) - W(y1<y2));               // clip line 1 start position if pos1 not selected

        // CORNER 2
        roundedRectangleCtx.lineTo(x2, y2 - (!SEL[1] ? Math.abs(R) : 0));                          // clip line 1 end position if pos2 not selected
        if (!SEL[1]) {                                                                             // draw arc if pos2 not selected
            R >= 0 ? roundedRectangleCtx.arc(x2 + R, y2 - R, R, Math.PI, Math.PI * 0.5, true)      // positive
                   : roundedRectangleCtx.arc(x2, y2, Math.abs(R), Math.PI * 1.5, 0, false);        // negative
        } // end of if positioner 2 is not selected        
        roundedRectangleCtx.moveTo(x2 + (!SEL[1] ? Math.abs(R) : 0) - W(x2<x3), y2);               // clip line 2 start position if pos2 not selected

        // CORNER 3
        roundedRectangleCtx.lineTo(x3 - (!SEL[2] ? Math.abs(R) : 0), y3);                          // clip line 2 end position if pos3 not selected
        if (!SEL[2]) {                                                                             // draw arc if pos3 not selected
            R >= 0 ? roundedRectangleCtx.arc(x3 - R, y3 - R, R, Math.PI * 0.5, 0, true)            // positive
                   : roundedRectangleCtx.arc(x3, y3, Math.abs(R), Math.PI, Math.PI * 1.5 , false); // negative
        } // end of if positioner 3 is not selected         
        roundedRectangleCtx.moveTo(x3, y3 - (!SEL[2] ? Math.abs(R) : 0) + W(y3>y4));               // clip line 3 start position if pos3 not selected

        // CORNER 4
        roundedRectangleCtx.lineTo(x4, y4 + (!SEL[3] ? Math.abs(R) : 0));                          // clip line 3 end position if pos4 not selected 
        if (!SEL[3]) {                                                                             // draw arc if pos4 not selected
            R >= 0 ? roundedRectangleCtx.arc(x4 - R, y4 + R, R, Math.PI * 0, Math.PI * 1.5, true)  // positive
                   : roundedRectangleCtx.arc(x4, y4, Math.abs(R), Math.PI * 0.5, Math.PI, false);  // negative          
        } // end of if positioner 4 is not selected                     
        roundedRectangleCtx.moveTo(x4 - (!SEL[3] ? Math.abs(R) : 0) + W(x4>x1), y4);               // clip line 4 start position if pos4 not selected
        roundedRectangleCtx.lineTo(x1 + (!SEL[0] ? Math.abs(R) : 0) - W(x1<x4), y1);               // clip line 4 end position if pos1 not selected

        roundedRectangleCtx.closePath();
        roundedRectangleCtx.lineWidth = toolSettings.drawingWidth;
        roundedRectangleCtx.strokeStyle = drawingColor;
        roundedRectangleCtx.stroke();          
    } // end of drawSquare
    
    addPositioner(workTop, 4, [[100,100], [100,200], [280,200], [280,100]]);
    
    anyShapeDrawing(4, drawRoundedRectangle);    
} // end of setRoundedRectangle



function setCircle() {
    const positioners = document.getElementsByClassName("positioner"),
          workTop     = document.getElementById("worktop"),
          workCanvas  = document.getElementById("pseudo-canvas");

    function drawCircle(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,              
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2] = [...coords], // spread back the numbers
              circleCtx = context || workCanvas.getContext("2d"), // default is workCanvas
              // calculating distance between pos1 and 2 by pythagorian theorem
              D = (ax, ay, bx, by) => { // DISTANCE
                  const A = Math.max(ax, ay) - Math.min(ax, ay), // A and B is always positive
                        B = Math.max(bx, by) - Math.min(bx, by);
                  return Math.round(Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2))); 
              }; 

        // clear canvas if it's the worktop context        
        if (!context) circleCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);

        // draw triangle
        circleCtx.beginPath();        
        circleCtx.arc(x1, y1, D(x1, x2, y1, y2), 0, 2 * Math.PI, true);        
        circleCtx.closePath();
        circleCtx.lineWidth = toolSettings.drawingWidth;
        circleCtx.strokeStyle = drawingColor;
        circleCtx.stroke();        
    } // end of drawTriangle
      
    addPositioner(workTop, 2, [[190,140], [140,150]]);

    anyShapeDrawing(2, drawCircle);
} // end of  setCircle
 




function setEllipse() {
    const positioners = document.getElementsByClassName("positioner"),
          workTop     = document.getElementById("worktop"),
          workCanvas  = document.getElementById("pseudo-canvas");

    function drawEllipse(context) {
        const X1 = positioners[0].style.left,
              Y1 = positioners[0].style.top,
              X2 = positioners[1].style.left,
              Y2 = positioners[1].style.top,  
              X3 = positioners[2].style.left,
              Y3 = positioners[2].style.top,             
              // get rid of all px postfixes (+ 4 is to get it centered (positioners width n height is 8px with border))
              coords = [X1, Y1, X2, Y2, X3, Y3].map(e => Number(e.match(/\d+/)) + 4), 
              [x1, y1, x2, y2, x3, y3] = [...coords], // spread back the numbers
              ellipseCtx = context || workCanvas.getContext("2d"); // default is workCanvas              

        // clear canvas if it's the worktop context        
        if (!context) ellipseCtx.clearRect(0, 0, workCanvas.width, workCanvas. height);

        // draw triangle
        ellipseCtx.beginPath();        
        ellipseCtx.ellipse(x1, y1, Math.max(x1, x3) - Math.min(x1, x3), Math.max(y1, y2) - Math.min(y1, y2), 0, 0, 2 * Math.PI, true);        
        ellipseCtx.closePath();
        ellipseCtx.lineWidth = toolSettings.drawingWidth;
        ellipseCtx.strokeStyle = drawingColor;
        ellipseCtx.stroke();        
    } // end of drawTriangle
      
    addPositioner(workTop, 3, [[190,150], [190,100], [290,150]]);

    anyShapeDrawing(2, drawEllipse);
} // end of setEllipse




function drawDashIcon() {
    const icon    = document.getElementById("dashed-icon-canvas");
          iconCtx = icon.getContext("2d");

    // draw a horizontal dashed line
    iconCtx.strokeStyle = "#1a97e1";
    iconCtx.lineWidth = 2;
    iconCtx.setLineDash([5, 3, 1, 3]);
    
    iconCtx.beginPath();
    iconCtx.moveTo(10, 25);
    iconCtx.lineTo(90, 25);
    iconCtx.moveTo(90, 25);
    iconCtx.closePath();
    iconCtx.stroke();
    
    // draw a diagonal dotted line   
    iconCtx.lineWidth = 1;
    iconCtx.setLineDash([1, 1]);
    
    iconCtx.beginPath();
    iconCtx.moveTo(10, 35);
    iconCtx.lineTo(90, 15);
    iconCtx.moveTo(90, 15);
    iconCtx.closePath();
    iconCtx.stroke();
} // end of drawDashIcon




function drawLinesIcons() {
    const icon     = document.getElementById("lines-icon-canvas"),
          iconCtx  = icon.getContext("2d"),
          line     = document.getElementById("line-icon"),
          lineCtx  = line.getContext("2d"),
          arc      = document.getElementById("arc-icon"),
          arcCtx   = arc.getContext("2d"),
          bezier   = document.getElementById("bezier-icon"),
          bezCtx   = bezier.getContext("2d"),
          quad     = document.getElementById("quadratic-icon"),
          quadCtx  = quad.getContext("2d");

    let grad;


    // draw tools lines icon
    iconCtx.beginPath();
    iconCtx.arc(35, 25, 13, Math.PI, 0, false);
    iconCtx.moveTo(75, 25);
    iconCtx.arc(62, 25, 13,0,  Math.PI, false);
    iconCtx.moveTo(10, 25);
    iconCtx.lineTo(85, 25);
    iconCtx.closePath();
    iconCtx.lineWidth = 2;
    iconCtx.strokeStyle = "#1a97e1";
    iconCtx.stroke();

    // draw line icon   
    grad = lineCtx.createLinearGradient(0, 100, 100, 100);
    grad.addColorStop(0, "yellow");
    grad.addColorStop(1, "orange");
    lineCtx.beginPath();
    lineCtx.moveTo(5, 95);
    lineCtx.lineTo(95, 5);
    lineCtx.closePath();
    lineCtx.lineWidth = 2;
    lineCtx.strokeStyle = grad;
    lineCtx.stroke();

    // draw arc icon
    grad = arcCtx.createLinearGradient(0, 100, 100, 100);
    grad.addColorStop(0, "rgb(91, 207, 232)");
    grad.addColorStop(1, "rgb(23, 236, 50)");
    arcCtx.beginPath();
    arcCtx.arc(50, 50, 20, Math.PI * 1.5, 0, false);
    arcCtx.moveTo(90, 50);
    arcCtx.arc(50, 50, 40, 0, Math.PI * 1.8, false);    
    arcCtx.lineWidth = 2;
    arcCtx.strokeStyle = grad;
    arcCtx.stroke();

    // draw bezier icon
    grad = bezCtx.createLinearGradient(0, 100, 100, 100);
    grad.addColorStop(0, "rgb(202, 168, 249)");
    grad.addColorStop(1, "rgb(142, 53, 168)");
    bezCtx.beginPath();
    bezCtx.moveTo(10, 50);
    bezCtx.bezierCurveTo(30, -80, 20, 170, 100, 70);  
    bezCtx.lineWidth = 2;
    bezCtx.strokeStyle = grad;
    bezCtx.stroke();

    // draw quadratic icon
    grad = quadCtx.createLinearGradient(0, 100, 100, 100);
    grad.addColorStop(0, "rgb(128, 128, 192)");
    grad.addColorStop(1, "rgb(0, 255, 255)");
    quadCtx.beginPath();
    quadCtx.moveTo(10, 90);
    quadCtx.quadraticCurveTo(20, -10, 100, 70);  
    quadCtx.lineWidth = 2;
    quadCtx.strokeStyle = grad;
    quadCtx.stroke();
} // end of drawLinesIcon




function addToggleListeners() {
    const toggleIds = ["dash-and-gap", "dash-pattern"];

    toggleIds.forEach(tg => {
        const toggle = document.getElementById(tg + "-toggle-button"),
              light = document.getElementById(tg + "-toggle-button-light");

        console.log(toggle.style.animation, light);

        toggle.addEventListener("click", () => {            
            toggle.dataset.on = toggle.dataset.on === "true" ? "false" : "true"; // switch on custom attribute
            if (toggle.dataset.on === "true") {
                const otherToggleName = tg === toggleIds[0] ? toggleIds[1] : toggleIds[0], // get other toggle so they can cancel each other
                      otherToggle     = document.getElementById(otherToggleName + "-toggle-button"),
                      otherLight      = document.getElementById(otherToggleName + "-toggle-button-light");

                // set active toggle
                toggle.style.webkitAnimation = toggle.style.animation = "0.2s toggleOn linear";
                toggle.style.top = "1px";
                light.style.background = "#a6e6ed";

                // set the other toggle
                if (otherToggle.dataset.on === "true") {
                    otherToggle.style.webkitAnimation = otherToggle.style.animation = "0.2s toggleOff linear";                
                    otherToggle.style.top = "26px";
                    otherLight.style.background = "#ff8494";
                    otherToggle.dataset.on = "false";
                } // end of if other toggle is on                
            } //  end of if current toggle is on
            else {                
                toggle.style.webkitAnimation = toggle.style.animation = "0.2s toggleOff linear";                
                toggle.style.top = "26px";
                light.style.background = "#ff8494";
            } // end of if current toggle is off            
        }); // end of enentlistener
    }); // end of iterate toggleIds
} // end of addToggleListeners