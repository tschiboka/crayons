var drawingColor = "black";

addPencilMouseListeners();
addColorPaletteMouseListener();

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
            console.log(drawingColor);
        }); // end of click 
    }); // end of color mapping
} // end of addPencilMouseListener

function addColorPaletteMouseListener() {
    const palette = document.getElementById("palette-icon");
    palette.addEventListener("click", () => {
        console.log("click");
        const dialog = document.getElementById("color-selector-dialog-box");
        dialog.click();
    });
} // end of addColorPaletteMouseListener


