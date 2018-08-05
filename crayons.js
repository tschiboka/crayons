var drawingColor = "black";

addPencilMouseListeners();
addColorPaletteMouseListener();
addCursorOverCanvasListener();

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
    const canvas = document.getElementById("canvas");
          canvas.addEventListener("mousemove", function(e) {
              const rect = e.target.getBoundingClientRect();
              const X = Math.round(e.pageX - rect.left);
              const Y = Math.round(e.pageX - rect.left);
              console.log(X,Y);
          });
    
} // end of addCursorOverSheetListener
