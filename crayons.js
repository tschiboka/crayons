
const box = document.getElementById("container");
box.addEventListener("click", (event) => cursorIsOnSheet(event.clientX,event.clientY) );
addPencilMouseListeners();


function addPencilMouseListeners() {
    const colors = ["red", "pink", "orange", "yellow", "purple", "green", "blue", "brown", "white", "gray", "black"];
    // add eventlisteners to all the pencils dinamically, mapping through the color names
    colors.map((color) => {
        const pseudo = document.getElementById(`${color}-pencil-pseudo`),
              element = document.getElementById(`pencil-${color}`);
        pseudo.addEventListener("mouseenter", (event) => { 
            element.style.animation = "pencil-move-out 0.3s linear";
            element.style.WebkitAnimation = "pencil-move-out 0.3s linear";
            element.style.left = "-90px";
        });  // end of mouseenter
        pseudo.addEventListener("mouseout", (event) => { 
            element.style.animation = "pencil-move-in 0.6s linear"; 
            element.style.WebkitAnimation = "pencil-move-in 0.6s linear"; 
            element.style.left = "-60px";
        }); // end of mouseout       
    }); // end of color mapping
}

const cursorIsOnSheet = (x,y) => {
    const sheet = document.getElementById("sheet"),
          sheetStyle = window.getComputedStyle(sheet);    
    console.log(x,y, sheetStyle);
};

